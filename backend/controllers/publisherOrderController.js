import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

// Place publisher order
export const placePublisherOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { admin_id, publisher_id, books } = req.body;

    // Generate unique integer IDs by parsing uuid strings (as you prefer)
    let publisher_order_id;
    do {
      publisher_order_id = parseInt(uuidv4().replace(/\D/g, '').slice(0, 8));
    } while (isNaN(publisher_order_id) || publisher_order_id < 10000000);

    const order_date = new Date();
    let total_amount = 0;

    await client.query('BEGIN');

    // Calculate total amount from books
    for (const book of books) {
      total_amount += book.quantity * book.price_per_unit;
    }

    // Insert publisher_order (trigger will apply discount and validate balance)
    await client.query(
      `INSERT INTO publisher_order (
        publisher_order_id, admin_id, publisher_id, order_date, total_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [publisher_order_id, admin_id, publisher_id, order_date, total_amount, 'pending']
    );

    // Insert each publisher_order_item
    for (const book of books) {
      let publisher_order_item_id;
      do {
        publisher_order_item_id = parseInt(uuidv4().replace(/\D/g, '').slice(0, 8));
      } while (isNaN(publisher_order_item_id) || publisher_order_item_id < 10000000);

      await client.query(
        `INSERT INTO publisher_order_item (
          publisher_order_item_id, publisher_order_id, book_id, quantity, price_per_unit
        ) VALUES ($1, $2, $3, $4, $5)`,
        [publisher_order_item_id, publisher_order_id, book.book_id, book.quantity, book.price_per_unit]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ message: 'Order placed successfully', publisher_order_id });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing publisher order:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  } finally {
    client.release();
  }
};

// Confirm order by publisher
export const confirmPublisherOrder = async (req, res) => {
  const { publisher_order_id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE publisher_order SET status = 'confirmed' WHERE publisher_order_id = $1 AND status = 'pending'`,
      [publisher_order_id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Order not found or already confirmed/cancelled.' });
    }

    res.status(200).json({ message: 'Order confirmed. Admin can proceed to payment.' });
  } catch (err) {
    console.error('Error confirming publisher order:', err);
    res.status(500).json({ message: 'Error confirming order' });
  }
};

// Cancel order (admin or publisher)
export const cancelPublisherOrder = async (req, res) => {
  const { publisher_order_id } = req.params;

  try {
    // Attempt to update status to cancelled, trigger prevents cancellation after payment
    const result = await pool.query(
      `UPDATE publisher_order SET status = 'cancelled' 
       WHERE publisher_order_id = $1 AND status IN ('pending', 'confirmed')`,
      [publisher_order_id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Cannot cancel completed or non-existent order.' });
    }

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: err.message || 'Error cancelling order' });
  }
};

// Make payment after confirmation
export const makePublisherPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { publisher_order_id, method, transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ message: 'transaction_id is required' });
    }

    const date = new Date();

    await client.query('BEGIN');

    // Check order exists and is confirmed (trigger handles balance check)
    const orderRes = await client.query(
      `SELECT status FROM publisher_order WHERE publisher_order_id = $1`,
      [publisher_order_id]
    );

    if (orderRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Order does not exist.' });
    }

    if (orderRes.rows[0].status !== 'confirmed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Order is not confirmed or already paid/cancelled.' });
    }

    // Insert payment record (trigger will deduct balance and update inventory and order status)
    await client.query(
      `INSERT INTO payment (
        transaction_id, amount, date, method, payer_admin_id, receiver_publisher_id, publisher_order_id
      ) SELECT $1, total_amount * 0.95, $2, $3, 101, publisher_id, publisher_order_id
        FROM publisher_order WHERE publisher_order_id = $4`,
      [transaction_id, date, method, publisher_order_id]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'Payment successful and inventory updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing payment:', err);
    res.status(500).json({ message: err.message || 'Payment failed' });
  } finally {
    client.release();
  }
};

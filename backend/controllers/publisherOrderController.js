import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

// Place publisher order
export const placePublisherOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('Received order data:', req.body);

    const { admin_id, publisher_id, books } = req.body;

    if (!admin_id || !publisher_id || !Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ message: 'Missing or invalid order data' });
    }

    let publisher_order_id;
    do {
      publisher_order_id = parseInt(uuidv4().replace(/\D/g, '').slice(0, 8));
    } while (isNaN(publisher_order_id) || publisher_order_id < 10000000);

    const order_date = new Date();
    let total_amount = 0;

    await client.query('BEGIN');

    // Validate books and calculate total amount
    for (const book of books) {
      if (!book.book_id || !book.quantity || !book.price_per_unit) {
        throw new Error('Invalid book data');
      }
      total_amount += book.quantity * book.price_per_unit;
    }

    // Check admin 101 balance before placing order
    const balanceResult = await client.query(
      `SELECT balance FROM admin WHERE admin_id = 101`
    );
    if (balanceResult.rowCount === 0) {
      throw new Error('Admin 101 not found.');
    }
    const admin101Balance = parseFloat(balanceResult.rows[0].balance);
    if (total_amount > admin101Balance) {
      throw new Error('Not enough balance in admin 101 account.');
    }

    // Insert publisher_order
    await client.query(
      `INSERT INTO publisher_order (
        publisher_order_id, admin_id, publisher_id, order_date, total_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [publisher_order_id, admin_id, publisher_id, order_date, total_amount, 'pending']
    );

    // Insert order items
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
// Get order status
export const getPublisherOrderStatus = async (req, res) => {
  const { orderId } = req.params;

  try {
    const result = await pool.query(
      `SELECT status FROM publisher_order WHERE publisher_order_id = $1`,
      [orderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ status: result.rows[0].status });
  } catch (err) {
    console.error('Error fetching order status:', err);
    res.status(500).json({ message: 'Error fetching order status' });
  }
};

// Get pending orders for a publisher
export const getPendingOrdersForPublisher = async (req, res) => {
  const { publisher_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT po.publisher_order_id, po.total_amount, poi.quantity, poi.price_per_unit,
              b.title
       FROM publisher_order po
       JOIN publisher_order_item poi ON po.publisher_order_id = poi.publisher_order_id
       JOIN book b ON poi.book_id = b.book_id
       WHERE po.publisher_id = $1 AND po.status = 'pending'
       ORDER BY po.publisher_order_id DESC`,
      [publisher_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ orders: [] });
    }

    // Group rows by publisher_order_id
    const grouped = {};
    for (const row of result.rows) {
      if (!grouped[row.publisher_order_id]) {
        grouped[row.publisher_order_id] = {
          publisher_order_id: row.publisher_order_id,
          total_amount: row.total_amount,
          items: [],
        };
      }
      grouped[row.publisher_order_id].items.push({
        title: row.title,
        quantity: row.quantity,
        price_per_unit: row.price_per_unit,
      });
    }

    res.status(200).json({ orders: Object.values(grouped) });
  } catch (err) {
    console.error('Error fetching pending orders:', err);
    res.status(500).json({ message: 'Error fetching pending orders' });
  }
};

// Get previous (confirmed or cancelled) orders for a publisher
export const getPreviousOrdersForPublisher = async (req, res) => {
  const { publisher_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT po.publisher_order_id, po.total_amount, poi.quantity, poi.price_per_unit, b.title
       FROM publisher_order po
       JOIN publisher_order_item poi ON po.publisher_order_id = poi.publisher_order_id
       JOIN book b ON poi.book_id = b.book_id
       WHERE po.publisher_id = $1 AND po.status IN ('confirmed', 'cancelled')
       ORDER BY po.publisher_order_id DESC`,
      [publisher_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ orders: [] });
    }

    const grouped = {};
    for (const row of result.rows) {
      if (!grouped[row.publisher_order_id]) {
        grouped[row.publisher_order_id] = {
          publisher_order_id: row.publisher_order_id,
          total_amount: row.total_amount,
          items: [],
        };
      }
      grouped[row.publisher_order_id].items.push({
        title: row.title,
        quantity: row.quantity,
        price_per_unit: row.price_per_unit,
      });
    }

    res.status(200).json({ orders: Object.values(grouped) });
  } catch (err) {
    console.error('Error fetching previous orders:', err);
    res.status(500).json({ message: 'Error fetching previous orders' });
  }
};

// Get all previous publisher orders (admin view)
export const getAllPreviousPublisherOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT po.publisher_order_id, po.total_amount, po.status,
             p.publisher_name, p.publisher_img_url,
             poi.quantity, poi.price_per_unit, b.title
      FROM publisher_order po
      JOIN publisher_order_item poi ON po.publisher_order_id = poi.publisher_order_id
      JOIN book b ON poi.book_id = b.book_id
      JOIN publisher p ON po.publisher_id = p.publisher_id
      WHERE po.status IN ('confirmed', 'cancelled')
      ORDER BY po.publisher_order_id DESC
    `);

    const grouped = {};
    for (const row of result.rows) {
      if (!grouped[row.publisher_order_id]) {
        grouped[row.publisher_order_id] = {
          publisher_order_id: row.publisher_order_id,
          publisher_name: row.publisher_name,
          publisher_img_url: row.publisher_img_url,
          total_amount: row.total_amount,
          status: row.status,
          items: [],
        };
      }
      grouped[row.publisher_order_id].items.push({
        title: row.title,
        quantity: row.quantity,
        price_per_unit: row.price_per_unit,
      });
    }

    res.status(200).json({ orders: Object.values(grouped) });
  } catch (err) {
    console.error('Error fetching admin previous orders:', err);
    res.status(500).json({ message: 'Failed to fetch previous orders' });
  }
};


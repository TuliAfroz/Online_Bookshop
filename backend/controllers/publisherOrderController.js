import pool from '../config/db.js';

export const placePublisherOrder = async (req, res) => {
  const { admin_id, publisher_id, books } = req.body; // books is an array of { book_id, quantity, price_per_unit }

  if (!admin_id || !publisher_id || !books || books.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: admin_id, publisher_id, and books array.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Calculate total amount
    let total_amount = 0;
    for (const book of books) {
      total_amount += book.quantity * book.price_per_unit;
    }

    // Insert into publisher_order
    const orderResult = await client.query(
      `INSERT INTO publisher_order (admin_id, publisher_id, order_date, total_amount)
       VALUES ($1, $2, NOW(), $3) RETURNING publisher_order_id`,
      [admin_id, publisher_id, total_amount]
    );
    const publisher_order_id = orderResult.rows[0].publisher_order_id;

    // Insert into publisher_order_item and update inventory
    for (const book of books) {
      await client.query(
        `INSERT INTO publisher_order_item (publisher_order_id, book_id, quantity, price_per_unit)
         VALUES ($1, $2, $3, $4)`,
        [publisher_order_id, book.book_id, book.quantity, book.price_per_unit]
      );

      // Update inventory: if book exists, increment quantity, else insert new inventory record
      const inventoryCheck = await client.query(
        `SELECT * FROM Inventory WHERE book_id = $1`,
        [book.book_id]
      );

      if (inventoryCheck.rows.length > 0) {
        await client.query(
          `UPDATE Inventory SET quantity = quantity + $1 WHERE book_id = $2`,
          [book.quantity, book.book_id]
        );
      } else {
        await client.query(
          `INSERT INTO Inventory (book_id, quantity) VALUES ($1, $2)`,
          [book.book_id, book.quantity]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Publisher order placed successfully', publisher_order_id });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error placing publisher order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const processPublisherPayment = async (req, res) => {
  const { publisher_order_id, admin_id, publisher_id, amount, method } = req.body;

  if (!publisher_order_id || !admin_id || !publisher_id || !amount || !method) {
    return res.status(400).json({ error: 'Missing required fields: publisher_order_id, admin_id, publisher_id, amount, method.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Deduct amount from admin's balance
    const adminBalanceResult = await client.query(
      `UPDATE Admin SET balance = balance - $1 WHERE admin_id = $2 RETURNING balance`,
      [amount, admin_id]
    );

    if (adminBalanceResult.rows.length === 0) {
      throw new Error('Admin not found.');
    }
    if (adminBalanceResult.rows[0].balance < 0) {
      throw new Error('Insufficient balance for admin.');
    }

    // 2. Add amount to publisher's balance
    const publisherBalanceResult = await client.query(
      `UPDATE Publisher SET balance = balance + $1 WHERE publisher_id = $2 RETURNING balance`,
      [amount, publisher_id]
    );

    if (publisherBalanceResult.rows.length === 0) {
      throw new Error('Publisher not found.');
    }

    // 3. Insert into payment table
    await client.query(
      `INSERT INTO Payment (transaction_id, publisher_order_id, amount, date, method, payer_admin_id, receiver_publisher_id)
       VALUES (gen_random_uuid(), $1, $2, NOW(), $3, $4, $5)`,
      [publisher_order_id, amount, method, admin_id, publisher_id]
    );

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Payment processed successfully' });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error processing publisher payment:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const cancelPublisherOrder = async (req, res) => {
  const { publisher_order_id } = req.params;

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Get order items to revert inventory
    const orderItemsResult = await client.query(
      `SELECT book_id, quantity FROM publisher_order_item WHERE publisher_order_id = $1`,
      [publisher_order_id]
    );

    for (const item of orderItemsResult.rows) {
      await client.query(
        `UPDATE Inventory SET quantity = quantity - $1 WHERE book_id = $2`,
        [item.quantity, item.book_id]
      );
    }

    // Update order status to cancelled
    const result = await client.query(
      `UPDATE publisher_order SET status = 'cancelled' WHERE publisher_order_id = $1 RETURNING *`,
      [publisher_order_id]
    );

    if (result.rows.length === 0) {
      throw new Error('Publisher order not found.');
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Publisher order cancelled successfully' });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error cancelling publisher order:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

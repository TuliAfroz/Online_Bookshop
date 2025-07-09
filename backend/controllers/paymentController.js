import pool from '../config/db.js';

export const makePayment = async (req, res) => {
  const { transaction_id, method, payer_customer_id } = req.body;

  const ADMIN_ID = 100; // Constant admin ID

  if (!transaction_id || !method || !payer_customer_id) {
    return res.status(400).json({ error: 'Missing required fields: transaction_id, method, or payer_customer_id' });
  }

  try {
    // Get the latest order for this customer (most recent order not paid yet)
    const orderResult = await pool.query(
      `SELECT order_id, total_price FROM orders
       WHERE order_id = (
         SELECT order_id FROM orders
         WHERE customer_id = $1
         ORDER BY date DESC
         LIMIT 1
       )`,
      [payer_customer_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'No recent order found for this customer' });
    }

    const { order_id, total_price: amount } = orderResult.rows[0];

    // Insert payment
    const result = await pool.query(
      `INSERT INTO Payment (
        transaction_id,
        amount,
        method,
        order_id,
        date,
        payer_customer_id,
        receiver_admin_id
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6)
      RETURNING *`,
      [transaction_id, amount, method, order_id, payer_customer_id, ADMIN_ID]
    );

    res.status(201).json({
      success: true,
      message: 'Payment successful',
      payment: result.rows[0]
    });

  } catch (err) {
    console.error('❌ Error making payment:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

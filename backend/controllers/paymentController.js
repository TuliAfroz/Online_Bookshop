import pool from '../config/db.js';

export const makePayment = async (req, res) => {
  const { order_id, method, transaction_id } = req.body;

  const payer_customer_id = req.body.payer_customer_id; // or get from session
  const receiver_admin_id = 1; // Fixed admin ID

  try {
    // Get amount from order
    const orderResult = await pool.query(
      `SELECT total_price FROM orders WHERE order_id = $1`,
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const amount = orderResult.rows[0].total_price;

    const result = await pool.query(
      `INSERT INTO Payment (transaction_id, amount, method, order_id, date, payer_customer_id, receiver_admin_id)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6)
       RETURNING *`,
      [transaction_id, amount, method, order_id, payer_customer_id, receiver_admin_id]
    );

    res.status(201).json({ success: true, payment: result.rows[0] });
  } catch (error) {
    console.error('❌ Error making payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getPaymentDetails = async (req, res) => {
  const { order_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM Payment WHERE order_id = $1`,
      [order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found for this order' });
    }

    res.status(200).json({ payment: result.rows[0] });
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
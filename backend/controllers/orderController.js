import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const placeOrder = async (req, res) => {
  const { customer_id, use_points, giftcard_ids } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  const cartResult = await pool.query(
    `SELECT cart_id FROM Cart WHERE Customer_ID = $1 ORDER BY created_at DESC LIMIT 1`,
    [customer_id]
  );

  if (cartResult.rows.length === 0) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const cartId = cartResult.rows[0].cart_id; // ✅ Variable defined correctly

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Clear existing temp gift card usage for this customer
    await client.query(`DELETE FROM UsedGiftCardsTemp WHERE customer_id = $1`, [customer_id]);

    // 2. Insert selected gift card IDs (VARCHAR) into the temp table
    if (Array.isArray(giftcard_ids) && giftcard_ids.length > 0) {
      const insertQuery = `
        INSERT INTO UsedGiftCardsTemp (customer_id, giftcard_id)
        VALUES ${giftcard_ids.map((_, i) => `($1, $${i + 2})`).join(', ')}
      `;
      await client.query(insertQuery, [customer_id, ...giftcard_ids]);
    }

    // 3. Place the order — triggers handle discount/points logic
    const orderId = parseInt(uuidv4().replace(/\D/g, '').slice(0, 8));

    const result = await client.query(
      `INSERT INTO "orders" (order_id, customer_id, cart_id, use_points, Date)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [orderId, customer_id, cartId, use_points] // ✅ Corrected variable name
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, order: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error placing order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
};

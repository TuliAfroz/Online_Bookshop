import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const placeOrder = async (req, res) => {
  const { customer_id, use_points, giftcard_ids } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  try {
    // 1. Get latest cart for the customer
    const cartResult = await pool.query(
      `SELECT cart_id FROM Cart WHERE Customer_ID = $1 ORDER BY created_at DESC LIMIT 1`,
      [customer_id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartId = cartResult.rows[0].cart_id;

    // 2. Clear old entries in temp giftcard table
    await pool.query(`DELETE FROM UsedGiftCardsTemp WHERE customer_id = $1`, [customer_id]);

    // 3. Insert selected giftcards (if any)
    if (Array.isArray(giftcard_ids) && giftcard_ids.length > 0) {
      const insertQuery = `
        INSERT INTO UsedGiftCardsTemp (customer_id, giftcard_id)
        VALUES ${giftcard_ids.map((_, i) => `($1, $${i + 2})`).join(', ')}
      `;
      await pool.query(insertQuery, [customer_id, ...giftcard_ids]);
    }

    // 4. Generate unique order ID
    let orderId = null;
    do {
      orderId = parseInt(uuidv4().replace(/\D/g, '').slice(0, 8));
    } while (isNaN(orderId) || orderId < 10000000);

    // 5. Insert order — trigger will do all logic
    const result = await pool.query(
      `INSERT INTO orders (order_id, customer_id, cart_id, use_points, date)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [orderId, customer_id, cartId, use_points]
    );

    res.status(201).json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const cancelOrder = async (req, res) => {
  const { order_id } = req.params;

  try {
    // 1. Check if the order exists and is not paid
    const orderCheck = await pool.query(
      `SELECT * FROM orders WHERE order_id = $1`,
      [order_id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const paymentCheck = await pool.query(
      `SELECT * FROM payment WHERE order_id = $1`,
      [order_id]
    );

    if (paymentCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Order already paid and cannot be cancelled' });
    }

    // 2. Delete the order
    await pool.query(`DELETE FROM orders WHERE order_id = $1`, [order_id]);

    res.status(200).json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




// import pool from '../config/db.js';
// import { v4 as uuidv4 } from 'uuid';

// export const placeOrder = async (req, res) => {
//   const { customer_id, use_points, giftcard_ids } = req.body;

//   if (!customer_id) {
//     return res.status(400).json({ error: 'Customer ID is required' });
//   }

//   const cartResult = await pool.query(
//     `SELECT cart_id FROM Cart WHERE Customer_ID = $1 ORDER BY created_at DESC LIMIT 1`,
//     [customer_id]
//   );

//   if (cartResult.rows.length === 0) {
//     return res.status(404).json({ error: 'Cart not found' });
//   }

//   const cartId = cartResult.rows[0].cart_id; // ✅ Variable defined correctly

//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');

//     // 1. Clear existing temp gift card usage for this customer
//     await client.query(`DELETE FROM UsedGiftCardsTemp WHERE customer_id = $1`, [customer_id]);

//     // 2. Insert selected gift card IDs (VARCHAR) into the temp table
//     if (Array.isArray(giftcard_ids) && giftcard_ids.length > 0) {
//       const insertQuery = `
//         INSERT INTO UsedGiftCardsTemp (customer_id, giftcard_id)
//         VALUES ${giftcard_ids.map((_, i) => `($1, $${i + 2})`).join(', ')}
//       `;
//       await client.query(insertQuery, [customer_id, ...giftcard_ids]);
//     }

//     // 3. Place the order — triggers handle discount/points logic
//     const orderId = parseInt(uuidv4().replace(/\D/g, '').slice(0, 8));

//     const result = await client.query(
//       `INSERT INTO "orders" (order_id, customer_id, cart_id, use_points, Date)
//        VALUES ($1, $2, $3, $4, NOW())
//        RETURNING *`,
//       [orderId, customer_id, cartId, use_points] // ✅ Corrected variable name
//     );

//     await client.query('COMMIT');
//     res.status(201).json({ success: true, order: result.rows[0] });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error placing order:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   } finally {
//     client.release();
//   }
// };

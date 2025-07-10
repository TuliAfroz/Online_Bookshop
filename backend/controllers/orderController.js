// placeOrder.js
import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const placeOrder = async (req, res) => {
  const { customer_id, use_points, giftcard_ids } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  try {
    const cartResult = await pool.query(
      `SELECT cart_id FROM Cart WHERE Customer_ID = $1 ORDER BY created_at DESC LIMIT 1`,
      [customer_id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartId = cartResult.rows[0].cart_id;

    // Clear temp table
    await pool.query(`DELETE FROM UsedGiftCardsTemp WHERE customer_id = $1`, [customer_id]);

    // Insert selected giftcards
    if (Array.isArray(giftcard_ids) && giftcard_ids.length > 0) {
      const insertQuery = `
        INSERT INTO UsedGiftCardsTemp (customer_id, giftcard_id)
        VALUES ${giftcard_ids.map((_, i) => `($1, ${i + 2})`).join(', ')}
      `;
      await pool.query(insertQuery, [customer_id, ...giftcard_ids]);
    }

    // Generate order ID
    let orderId;
    do {
      orderId = parseInt(uuidv4().replace(/\D/g, '').slice(0, 8));
    } while (isNaN(orderId) || orderId < 10000000);

    // Insert order — BEFORE INSERT trigger does all logic
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


// cancelOrder.js
export const cancelOrder = async (req, res) => {
  const { order_id } = req.params;

  try {
    const orderCheck = await pool.query(
      `SELECT * FROM orders WHERE order_id = $1`,
      [order_id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderCheck.rows[0];
    const customer_id = order.customer_id;
    const use_points = order.use_points;

    const paymentCheck = await pool.query(
      `SELECT * FROM payment WHERE order_id = $1`,
      [order_id]
    );

    if (paymentCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Order already paid and cannot be cancelled' });
    }

    // Restore used gift cards
    const giftcards = await pool.query(
      `SELECT giftcard_id FROM UsedGiftCardsTemp WHERE customer_id = $1`,
      [customer_id]
    );

    for (const row of giftcards.rows) {
      await pool.query(
        `INSERT INTO GiftCard (card_id, customer_id, amount) VALUES ($1, $2, 0)`,
        [row.giftcard_id, customer_id]
      );
    }

    // Restore points if used
    if (use_points) {
      const pointResult = await pool.query(`SELECT * FROM Point WHERE Customer_ID = $1`, [customer_id]);
      if (pointResult.rows.length > 0) {
        await pool.query(`UPDATE Point SET Point_count = Point_count + 300 WHERE Customer_ID = $1`, [customer_id]);
      }
    }

    await pool.query(`DELETE FROM UsedGiftCardsTemp WHERE customer_id = $1`, [customer_id]);
    await pool.query(`DELETE FROM orders WHERE order_id = $1`, [order_id]);

    res.status(200).json({ success: true, message: 'Order cancelled and resources restored' });
  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCustomerBooks = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const purchasedBooks = await pool.query(
            `SELECT DISTINCT b.book_id, b.title
             FROM orders o
             JOIN cartitem ci ON o.cart_id = ci.cart_id
             JOIN book b ON ci.book_id = b.book_id
             WHERE o.customer_id = $1`,
            [customer_id]
        );
        res.json(purchasedBooks.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
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
//         VALUES ${giftcard_ids.map((_, i) => `($1, ${i + 2})`).join(', ')}
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

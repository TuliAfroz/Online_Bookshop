import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';


export const addToCart = async (req, res) => {
  const { customer_id, cart_items } = req.body;

  if (!customer_id || !Array.isArray(cart_items) || cart_items.length === 0) {
    return res.status(400).json({ error: 'customer_id and cart_items are required' });
  }

  try {
    // Get or create cart for customer
    let cartRes = await pool.query(`SELECT Cart_ID FROM Cart WHERE Customer_ID = $1`, [customer_id]);

    let cartId;
    if (cartRes.rows.length === 0) {
      cartId = parseInt(uuidv4().replace(/\D/g, '').slice(0, 6)); // generate numeric ID
      await pool.query(
        `INSERT INTO Cart (Cart_ID, Customer_ID, Created_At) VALUES ($1, $2, CURRENT_DATE)`,
        [cartId, customer_id]
      );
    } else {
      cartId = cartRes.rows[0].cart_id;
    }

    for (const item of cart_items) {
      const { book_id, quantity } = item;

      if (!book_id || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Each cart item must have valid book_id and quantity > 0' });
      }

      // Check existing quantity in cart for this book
      const existingItemRes = await pool.query(
        `SELECT Quantity FROM CartItem WHERE Cart_ID = $1 AND Book_ID = $2`,
        [cartId, book_id]
      );
      const existingQty = existingItemRes.rows.length > 0 ? existingItemRes.rows[0].quantity : 0;

      // Check inventory quantity
      const inventoryRes = await pool.query(
        `SELECT Quantity FROM Inventory WHERE Book_ID = $1`,
        [book_id]
      );

      if (
        inventoryRes.rows.length === 0 ||
        inventoryRes.rows[0].quantity < existingQty + quantity
      ) {
        return res.status(400).json({
          error: `Insufficient stock for Book ID ${book_id}. You already have ${existingQty} in cart, requested ${quantity}, but only ${inventoryRes.rows[0]?.quantity ?? 0} available.`
        });
      }

      // Get book price
      const bookPriceRes = await pool.query(
        `SELECT Price FROM Book WHERE Book_ID = $1`,
        [book_id]
      );

      if (bookPriceRes.rows.length === 0) {
        return res.status(400).json({ error: `Book ID ${book_id} does not exist` });
      }

      const per_item_price = bookPriceRes.rows[0].price;

      if (existingQty > 0) {
        await pool.query(
          `UPDATE CartItem 
           SET Quantity = Quantity + $1
           WHERE Cart_ID = $2 AND Book_ID = $3`,
          [quantity, cartId, book_id]
        );
      } else {
        const cartItemId = parseInt(uuidv4().replace(/\D/g, '').slice(0, 6)); // generate numeric ID
        await pool.query(
          `INSERT INTO CartItem (CartItem_ID, Cart_ID, Book_ID, Quantity, Per_Item_Price)
           VALUES ($1, $2, $3, $4, $5)`,
          [cartItemId, cartId, book_id, quantity, per_item_price]
        );
      }
    }

    res.status(200).json({ success: true, message: 'Added to cart successfully', cart_id: cartId });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




export const getCartWithItems = async (req, res) => {
  const { Customer_ID} = req.params;

  try {
    // 1. Get latest cart for this customer
    const cartResult = await pool.query(
      `SELECT * FROM Cart WHERE Customer_ID = $1 ORDER BY Created_At DESC LIMIT 1`,
      [Customer_ID]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found for this customer' });
    }

    const cart = cartResult.rows[0];

    // 2. Get items in this cart
    const itemsResult = await pool.query(
      `SELECT 
         ci.CartItem_ID,
         ci.Book_ID,
         b.Title,
         ci.Quantity,
         ci.Per_Item_Price,
         (ci.Quantity * ci.Per_Item_Price) AS total
       FROM CartItem ci
       JOIN Book b ON ci.Book_ID = b.Book_ID
       WHERE ci.Cart_ID = $1`,
      [cart.cart_id]
    );

    const items = itemsResult.rows;

    // 3. Compute total price safely
    const total_price = items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total);
      return sum + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);

    // 4. Send response
    res.status(200).json({
      cart_id: cart.cart_id,
      customer_id: cart.customer_id,
      created_at: cart.created_at,
      items,
      total_price
    });

  } catch (error) {
    console.error("❌ Error fetching cart:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to remove an item from the cart

export const removeFromCart = async (req, res) => {
  const { customer_id, book_id } = req.body;

  if (!customer_id || !book_id) {
    return res.status(400).json({ error: 'customer_id and book_id are required' });
  }

  try {
    // 1. Get the latest cart
    const cartResult = await pool.query(
      `SELECT Cart_ID FROM Cart WHERE Customer_ID = $1 ORDER BY Created_At DESC LIMIT 1`,
      [customer_id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found for this customer' });
    }

    const cartId = cartResult.rows[0].cart_id;

    // 2. Check current quantity
    const itemRes = await pool.query(
      `SELECT Quantity FROM CartItem WHERE Cart_ID = $1 AND Book_ID = $2`,
      [cartId, book_id]
    );

    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    const currentQty = itemRes.rows[0].quantity;

    if (currentQty > 1) {
      // 3. Decrease quantity
      await pool.query(
        `UPDATE CartItem SET Quantity = Quantity - 1 WHERE Cart_ID = $1 AND Book_ID = $2`,
        [cartId, book_id]
      );
      return res.status(200).json({ success: true, message: 'Item quantity decreased by 1' });
    } else {
      // 4. Quantity is 1 → remove item
      await pool.query(
        `DELETE FROM CartItem WHERE Cart_ID = $1 AND Book_ID = $2`,
        [cartId, book_id]
      );
      return res.status(200).json({ success: true, message: 'Item removed from cart' });
    }

  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

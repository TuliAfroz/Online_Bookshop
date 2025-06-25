import pool from '../config/db.js';

// Get inventory: Book Title + Quantity
export const getInventoryList = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.book_id, b.title, i.quantity
       FROM inventory i
       JOIN book b ON i.book_id = b.book_id
       ORDER BY b.title ASC`
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

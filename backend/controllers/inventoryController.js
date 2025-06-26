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

//update quantity
export const updateInventoryQuantity = async (req, res) => {
  const { book_id } = req.params;
  const { quantity } = req.body;
  if (quantity == null) {
    return res.status(400).json({ error: 'Quantity is required' });
  }
  try{
    const result = await pool.query(
      `UPDATE inventory SET quantity = $1 WHERE book_id = $2
      RETURNING *`,
      [quantity,book_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found in inventory' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });

  }catch(error){
    console.error('Error updating inventory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

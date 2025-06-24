import pool from '../config/db.js';

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Category ORDER BY category_id ASC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  const { Category_ID, Category_Name, Description } = req.body;

  if (!Category_Name || !Category_ID) {
    return res.status(400).json({ error: 'Category_Name and Category_ID are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Category (Category_ID, Category_Name, Description) VALUES ($1, $2, $3) RETURNING *`,
      [Category_ID, Category_Name, Description || ''] // Default to empty string
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

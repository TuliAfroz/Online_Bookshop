import pool from '../config/db.js';

// Get all authors
export const getAllAuthors = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 18;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(`
      SELECT * FROM Author ORDER BY author_id ASC LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const totalCount = await pool.query(`SELECT COUNT(*) FROM Author`);

    res.status(200).json({
      success: true,
      data: result.rows,
      total: parseInt(totalCount.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create new author
export const createAuthor = async (req, res) => {
  const { Author_ID, Author_Name, Total_books } = req.body;

  if (!Author_Name || !Author_ID) {
    return res.status(400).json({ error: 'Author_Name and Author_ID are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Author (Author_ID, Author_Name, Total_books) VALUES ($1, $2, $3) RETURNING *`,
      [Author_ID, Author_Name, Total_books ?? null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

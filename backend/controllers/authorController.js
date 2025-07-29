import pool from '../config/db.js';

// Get all authors
export const getAllAuthors = async (req, res) => {
  const page = parseInt(req.query.page) || null;
  const limit = parseInt(req.query.limit) || null;

  try {
    let query = `SELECT * FROM Author ORDER BY author_name ASC`;
    let params = [];

    if (page && limit) {
      const offset = (page - 1) * limit;
      query += ` LIMIT $1 OFFSET $2`;
      params = [limit, offset];
    }

    const result = await pool.query(query, params);

    // If paginated, also return total pages
    if (page && limit) {
      const totalCount = await pool.query(`SELECT COUNT(*) FROM Author`);
      const total = parseInt(totalCount.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        data: result.rows,
        total,
        totalPages,
      });
    }

    // Otherwise return full list
    return res.status(200).json({ success: true, data: result.rows });

  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Create new author
export const createAuthor = async (req, res) => {
  const { Author_ID, Author_Name, Total_books, Author_Image_URL } = req.body;

  if (!Author_Name || !Author_ID) {
    return res.status(400).json({ error: 'Author_Name and Author_ID are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Author (Author_ID, Author_Name, Total_books, author_image_url) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [Author_ID, Author_Name, Total_books ?? null, Author_Image_URL ?? null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


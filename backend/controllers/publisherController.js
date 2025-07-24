import pool from '../config/db.js';


export const getAllPublishers = async (req, res) => {
  try {
    const { page = 1, limit = 18 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = await pool.query('SELECT COUNT(*) FROM publisher');
    const total = parseInt(totalResult.rows[0].count, 10);

    // Get paginated publishers
    const result = await pool.query(
      'SELECT publisher_id, publisher_name, phone_no, publisher_img_url FROM publisher ORDER BY publisher_id ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.status(200).json({ success: true, data: result.rows, total }); // ✅ add success

  } catch (error) {
    console.error('Error fetching publishers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Create new publisher
export const createPublisher = async (req, res) => {
  const { Publisher_ID,Publisher_Name, Phone_No } = req.body;

  if (!Publisher_Name || !Publisher_ID ) {
    return res.status(400).json({ error: 'Publisher_Name and Publisher_ID are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Publisher (Publisher_ID, Publisher_Name, Phone_No) VALUES ($1, $2, $3) RETURNING *`,
      [Publisher_ID, Publisher_Name, Phone_No || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating publisher:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


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
  const { Publisher_ID, Publisher_Name, Phone_No, Publisher_Img_Url } = req.body;

  if (!Publisher_Name || !Publisher_ID) {
    return res.status(400).json({ error: 'Publisher_Name and Publisher_ID are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Publisher (Publisher_ID, Publisher_Name, Phone_No, Publisher_Img_Url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [Publisher_ID, Publisher_Name, Phone_No || null, Publisher_Img_Url || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating publisher:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getPublisherProfile = async (req, res) => {
  const { publisherId } = req.params;
  console.log('Fetching profile for publisherId:', publisherId);

  const numericPublisherId = parseInt(publisherId, 10);
  if (isNaN(numericPublisherId)) {
    console.warn('Invalid publisher ID:', publisherId);
    return res.status(400).json({ error: 'Invalid publisher ID' });
  }

  try {
    const result = await pool.query( // ✅ changed db.query -> pool.query
      `SELECT publisher_id, publisher_name, phone_no, balance, publisher_img_url 
       FROM publisher WHERE publisher_id = $1`,
      [numericPublisherId]
    );

    console.log('Query result:', result.rows);

    if (result.rowCount === 0) {
      console.warn('No publisher found with ID:', numericPublisherId);
      return res.status(404).json({ error: 'Publisher not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching publisher profile:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};
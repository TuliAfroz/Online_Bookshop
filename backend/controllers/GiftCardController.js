import pool from '../config/db.js';

export const getGiftcardsByCustomer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT card_id, amount FROM giftcard WHERE customer_id = $1`,
      [customer_id]
    );

    res.status(200).json({ success: true, giftcard: result.rows });
  } catch (error) {
    console.error('❌ Error fetching giftcard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch giftcard' });
  }
};

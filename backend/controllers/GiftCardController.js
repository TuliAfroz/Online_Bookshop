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

export const addGiftcard = async (req, res) => {
  const { customer_id, card_id, amount } = req.body;

  // Validate inputs
  if (!customer_id || !card_id || amount == null) {
    return res.status(400).json({
      success: false,
      error: 'customer_id, card_id and amount are required',
    });
  }

  try {
    // 1. Check if customer exists
    const customerCheck = await pool.query(
      `SELECT customer_id FROM customer WHERE customer_id = $1`,
      [customer_id]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Customer ID ${customer_id} not found`,
      });
    }

    // 2. Check if card already exists
    const cardCheck = await pool.query(
      `SELECT card_id FROM giftcard WHERE card_id = $1`,
      [card_id]
    );

    if (cardCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Gift card ID ${card_id} already exists`,
      });
    }

    // 3. Insert new gift card
    const result = await pool.query(
      `INSERT INTO giftcard (card_id, customer_id, amount)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [card_id, customer_id, amount]
    );

    res.status(201).json({
      success: true,
      message: 'Gift card added successfully',
      giftcard: result.rows[0],
    });

  } catch (error) {
    console.error('❌ Error adding gift card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add gift card',
    });
  }
};

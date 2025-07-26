// controllers/adminController.js
import db from '../config/db.js';

export const getAdminBalance = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT balance FROM admin WHERE admin_id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ balance: result.rows[0].balance });
  } catch (err) {
    console.error('Error fetching admin balance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

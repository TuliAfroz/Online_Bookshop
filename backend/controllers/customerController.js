import pool from '../config/db.js';
import bcrypt from 'bcrypt';


// Get customer profile (excluding password)
export const getCustomerProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT customer_id, customer_name, phone_No, address, email FROM Customer WHERE Customer_ID = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('❌ Error fetching customer profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }

  try {

  const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE Customer SET Password = $1 WHERE Customer_ID = $2`,
      [hashedPassword, id]
    );

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('❌ Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        Customer_ID AS customer_id, 
        Customer_Name AS name, 
        Email AS email,             
        Phone_No AS phone,
        Address AS address
      FROM Customer
    `);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



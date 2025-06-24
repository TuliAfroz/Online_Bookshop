import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// ===================== ADMIN SIGNUP =====================
export const signupAdmin = async (req, res) => {
  const { Admin_ID, Password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    await pool.query(
      `INSERT INTO Admin (Admin_ID, Password) VALUES ($1, $2)`,
      [Admin_ID, hashedPassword]
    );
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Admin signup failed' });
  }
};

// ===================== CUSTOMER SIGNUP =====================
export const signupCustomer = async (req, res) => {

  const { Customer_Name, Email, Password, Address, Phone_No } = req.body;
  console.log("🚀 Received signup request:", req.body); 
  try {
    // Check if email already exists
    const check = await pool.query(
      'SELECT * FROM Customer WHERE Email = $1',
      [Email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'This email already has an account' });
    }
    const hashedPassword = await bcrypt.hash(Password, 10);
    const result = await pool.query(
      `INSERT INTO Customer (Customer_Name, Email, Password, Address, Phone_No)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING Customer_ID`,
      [Customer_Name, Email, hashedPassword, Address, Phone_No]
    );
    res.status(201).json({
      message: 'Customer created successfully',
      Customer_ID: result.rows[0].customer_id
    });
  } catch (err) {
    console.error("❌ Error in signupCustomer:", err);
    res.status(500).json({ error: 'Customer signup failed' });
  }
};

// ===================== LOGIN (ADMIN + CUSTOMER) =====================
export const login = async (req, res) => {
  const { role, id, email, password } = req.body;

  try {
    if (role === 'admin') {
      if (!id || !password) {
        return res.status(400).json({ error: 'Admin ID and password required' });
      }

      const result = await pool.query(
        'SELECT * FROM Admin WHERE Admin_ID = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      const admin = result.rows[0];

      // Compare password
      const validPass = await bcrypt.compare(password, admin.password);
      if (!validPass) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: admin.admin_id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({ message: 'Admin login successful', token });

    } else if (role === 'customer') {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Fetch customer by Email
      const result = await pool.query(
        'SELECT * FROM Customer WHERE Email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const customer = result.rows[0];

      // Compare password
      const validPass = await bcrypt.compare(password, customer.password);
      if (!validPass) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: customer.customer_id, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({ message: 'Customer login successful', token });

    } else {
      return res.status(400).json({ error: 'Role must be admin or customer' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

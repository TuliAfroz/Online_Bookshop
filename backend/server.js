import express from 'express'; 
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/authRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import publisherRoutes from './routes/publisherRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

import { readFile } from 'fs/promises';
import pool from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();    

const app = express();
const PORT = process.env.PORT || 3000;

console.log(PORT);

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);

export async function initializeDB() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await readFile(schemaPath, 'utf8');

    await pool.query(schema); // Multiple CREATE TABLEs work here
    console.log("✅ Schema executed successfully");
  } catch (err) {
    console.error("❌ Schema load error:", err.message);
  }
}

initializeDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
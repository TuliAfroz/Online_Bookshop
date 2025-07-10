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
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'; 
import customerRoutes from './routes/customerRoutes.js';
import giftcardRoutes from './routes/giftCardRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

import pool from './config/db.js';

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
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/giftcards', giftcardRoutes);
app.use('/api/reviews', reviewRoutes);

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection error:', err);
    } else {
        console.log('✅ Database connected successfully');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

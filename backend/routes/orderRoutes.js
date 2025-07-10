import express from 'express';
import { placeOrder, cancelOrder, getCustomerBooks } from '../controllers/orderController.js';

const router = express.Router();
router.post('/place', placeOrder);
router.delete('/cancel/:order_id', cancelOrder);
router.get('/customer/:customer_id/books', getCustomerBooks);
export default router;
import express from 'express';
import { placeOrder, cancelOrder, getCustomerBooks, getOrderDetails,getOrdersByCustomer } from '../controllers/orderController.js';

const router = express.Router();
router.post('/place', placeOrder);
router.delete('/cancel/:order_id', cancelOrder);
router.get('/customer/:customer_id/books', getCustomerBooks);
router.get('/details/:order_id', getOrderDetails);
router.get('/customer/:customer_id', getOrdersByCustomer);

export default router;
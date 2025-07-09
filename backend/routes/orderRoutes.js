import express from 'express';
import { placeOrder ,cancelOrder} from '../controllers/orderController.js';

const router = express.Router();
router.post('/place', placeOrder);
router.delete('/cancel/:order_id', cancelOrder);
export default router;

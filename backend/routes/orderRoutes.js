import express from 'express';
import { placeOrder } from '../controllers/orderController.js';

const router = express.Router();
router.post('/place', placeOrder);
export default router;

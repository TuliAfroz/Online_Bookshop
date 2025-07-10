
import express from 'express';
import { makePayment,getPaymentDetails } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/make', makePayment);
router.get('/:order_id', getPaymentDetails);

export default router;

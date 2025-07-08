
import express from 'express';
import { makePayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/make', makePayment);

export default router;

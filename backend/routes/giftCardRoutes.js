import express from 'express';
import { getGiftcardsByCustomer } from '../controllers/GiftCardController.js';

const router = express.Router();

router.get('/customer/:customer_id', getGiftcardsByCustomer);

export default router;

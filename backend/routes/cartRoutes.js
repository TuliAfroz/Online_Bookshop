import express from 'express';
import { addToCart ,getCartWithItems } from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', addToCart);
router.get('/:Customer_ID', getCartWithItems);

export default router;
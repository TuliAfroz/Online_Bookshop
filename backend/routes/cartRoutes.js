import express from 'express';
import { addToCart ,getCartWithItems,removeFromCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', addToCart);
router.get('/:Customer_ID', getCartWithItems);
router.post('/remove', removeFromCart);


export default router;
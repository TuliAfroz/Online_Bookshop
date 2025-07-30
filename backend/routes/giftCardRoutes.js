import express from 'express';
import { getGiftcardsByCustomer,addGiftcard} from '../controllers/GiftCardController.js';

const router = express.Router();

router.get('/customer/:customer_id', getGiftcardsByCustomer);
router.post('/add', addGiftcard);

export default router;


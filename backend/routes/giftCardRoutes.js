import express from 'express';
import { getGiftcardsByCustomer,addGiftcard} from '../controllers/GiftCardController.js';

const router = express.Router();

router.get('/customer/:customer_id', getGiftcardsByCustomer);
router.post('/add', addGiftcard);
<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 9befe7598735a3022aa97bd60806261323617a01

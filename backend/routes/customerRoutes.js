import express from 'express';
import { getCustomerProfile, changePassword } from '../controllers/customerController.js';

const router = express.Router();

router.get('/:id', getCustomerProfile);
router.put('/:id/password', changePassword);


export default router;

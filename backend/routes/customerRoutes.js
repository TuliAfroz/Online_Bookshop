import express from 'express';
import { getCustomerById, getCustomerProfile, changePassword } from '../controllers/customerController.js';

const router = express.Router();

// GET /api/customers/:id
router.get('/:id', getCustomerById);
router.get('/:id', getCustomerProfile);
router.put('/:id/password', changePassword);


export default router;

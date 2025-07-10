import express from 'express';
import {getAllCustomers,getCustomerProfile,changePassword} from '../controllers/customerController.js';

const router = express.Router();

router.get('/', getAllCustomers);
router.get('/:id', getCustomerProfile);
router.put('/:id/password', changePassword);

export default router;

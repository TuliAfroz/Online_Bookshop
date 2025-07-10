import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/admin/signup', authController.signupAdmin);
router.post('/customer/signup', authController.signupCustomer);
router.post('/login', authController.login);

export default router;

import express from 'express';
import {
  signupAdmin,
  signupCustomer,
  login
} from '../controllers/authController.js';

const router = express.Router();

router.post('/admin/signup', signupAdmin);
router.post('/customer/signup', signupCustomer);
router.post('/login', login);

export default router;

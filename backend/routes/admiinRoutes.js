// Example: routes/adminRoutes.js
import express from 'express';
import { getAdminBalance } from '../controllers/adminController.js';

const router = express.Router();

// Add this route
router.get('/:id/balance', getAdminBalance);

export default router;

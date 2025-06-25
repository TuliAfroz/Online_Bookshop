import express from 'express';
import { getInventoryList } from '../controllers/inventoryController.js';

const router = express.Router();

// GET /api/inventory
router.get('/', getInventoryList);

export default router;

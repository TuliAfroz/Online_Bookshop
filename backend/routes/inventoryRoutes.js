import express from 'express';
import { getInventoryList,updateInventoryQuantity } from '../controllers/inventoryController.js';

const router = express.Router();

// GET /api/inventory
router.get('/', getInventoryList);
router.patch('/:book_id', updateInventoryQuantity);

export default router;

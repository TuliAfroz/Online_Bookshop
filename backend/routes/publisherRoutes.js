import express from 'express';
import { getAllPublishers, createPublisher } from '../controllers/publisherController.js';

const router = express.Router();

router.get('/', getAllPublishers);
router.post('/', createPublisher);

export default router;

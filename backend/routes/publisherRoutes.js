import express from 'express';
import { getAllPublishers, createPublisher,getPublisherProfile } from '../controllers/publisherController.js';

const router = express.Router();

router.get('/', getAllPublishers);
router.post('/', createPublisher);

router.get('/:publisherId/profile', getPublisherProfile);

export default router;

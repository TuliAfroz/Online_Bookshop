import express from 'express';
import * as publisherOrderController from '../controllers/publisherOrderController.js';

const router = express.Router();

// Route for admin to place an order with a publisher
router.post(
  '/',
  publisherOrderController.placePublisherOrder
);

// Route for admin to process payment for a publisher order
router.post(
  '/payment',
  publisherOrderController.processPublisherPayment
);

// Route for admin to cancel a publisher order
router.put(
  '/:publisher_order_id/cancel',
  publisherOrderController.cancelPublisherOrder
);

export default router;

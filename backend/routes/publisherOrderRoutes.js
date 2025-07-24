import express from 'express';
import {
    placePublisherOrder,
    confirmPublisherOrder,
    cancelPublisherOrder,
    makePublisherPayment
} from '../controllers/publisherOrderController.js';

const router = express.Router();

router.post('/place', placePublisherOrder);
router.put('/confirm/:publisher_order_id', confirmPublisherOrder);
router.put('/cancel/:publisher_order_id', cancelPublisherOrder);
router.post('/payment', makePublisherPayment);

export default router;

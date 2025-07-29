import express from 'express';
import {
    placePublisherOrder,
    confirmPublisherOrder,
    cancelPublisherOrder,
    makePublisherPayment,
    getPublisherOrderStatus,
    getPendingOrdersForPublisher,
    getPreviousOrdersForPublisher,
    getAllPreviousPublisherOrders,
    getAllPendingPublisherOrders
} from '../controllers/publisherOrderController.js';

const router = express.Router();

router.post('/place', placePublisherOrder);
router.put('/confirm/:publisher_order_id', confirmPublisherOrder);
router.delete('/cancel/:publisher_order_id', cancelPublisherOrder);
router.post('/payment', makePublisherPayment);
router.get('/:orderId/status', getPublisherOrderStatus);
router.get('/pending/:publisher_id', getPendingOrdersForPublisher);
router.get('/previous/:publisher_id', getPreviousOrdersForPublisher);
router.get('/admin/previous-orders', getAllPreviousPublisherOrders);
router.get('/admin/pending-orders', getAllPendingPublisherOrders);



export default router;

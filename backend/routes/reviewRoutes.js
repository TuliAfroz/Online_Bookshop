import express from 'express';
const router = express.Router();
import * as reviewController from '../controllers/reviewController.js';

// Add a new review
router.post('/', reviewController.addReview);

// Get all reviews for a specific book
router.get('/book/:book_id', reviewController.getBookReviews);

// Get all reviews by a specific customer
router.get('/customer/:customer_id', reviewController.getCustomerReviews);

// Update a review
router.put('/:book_id/:customer_id', reviewController.updateReview);

// Delete a review
router.delete('/:book_id/:customer_id', reviewController.deleteReview);

export default router;

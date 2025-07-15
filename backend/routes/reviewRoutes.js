import express from 'express';
import {
  addReview,
  getBookReviews,
  getCustomerReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/add', addReview);
router.get('/book/:book_id', getBookReviews);
router.get('/customer/:customer_id', getCustomerReviews);
router.put('/update/:book_id/:customer_id', updateReview);
router.delete('/delete/:book_id/:customer_id', deleteReview);

export default router;

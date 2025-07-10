import express from 'express';
import * as bookController from '../controllers/bookController.js';

const router = express.Router();

router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.post('/', bookController.createBook);
router.get('/:book_id', bookController.getBook);
router.put('/:book_id', bookController.updateBook);
router.delete('/:book_id', bookController.deleteBook);
router.put('/inventory/:book_id', bookController.updateInventory);

export default router;
import express from 'express';
import * as bookController from '../controllers/bookController.js';

const router = express.Router();

router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.post('/', bookController.createBook);

router.get('/in-stock', bookController.getBooksInStock);
router.get('/author/:id', bookController.getBooksByAuthor);
router.get('/publisher/:publisherId', bookController.getBooksByPublisher);

router.get('/by-category', bookController.getBooksGroupedByCategory);


router.get('/:book_id', bookController.getBook);
router.put('/:book_id', bookController.updateBook);
router.delete('/:book_id', bookController.deleteBook);
router.put('/inventory/:book_id', bookController.updateInventory);

// router.put('/update-price/:bookId', bookController.updateBookPrice);


export default router;

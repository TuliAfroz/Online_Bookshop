import express from 'express';
import { getAllBooks, createBook, getBook,updateBook,deleteBook,searchBooks,updateInventory } from '../controllers/bookController.js';

const router = express.Router();

router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.post('/', createBook);
router.get('/:book_id', getBook);
router.put('/:book_id', updateBook);
router.delete('/:book_id', deleteBook);
router.put('/inventory/:book_id', updateInventory);


export default router;
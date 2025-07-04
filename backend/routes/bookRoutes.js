import express from 'express';
import { getAllBooks, createBook, getBook,updateBook,deleteBook } from '../controllers/bookController.js';

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:Book_ID', getBook);
router.post('/', createBook);
router.put('/:Book_ID', updateBook);
router.delete('/:Book_ID', deleteBook);

export default router;
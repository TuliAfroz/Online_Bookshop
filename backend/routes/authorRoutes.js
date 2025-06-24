import express from 'express';
import { getAllAuthors, createAuthor } from '../controllers/authorController.js';

const router = express.Router();

router.get('/', getAllAuthors);
router.post('/', createAuthor);

export default router;

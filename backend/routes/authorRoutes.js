import express from 'express';
import * as authorController from '../controllers/authorController.js';

const router = express.Router();

router.get('/', authorController.getAllAuthors);
router.post('/', authorController.createAuthor);

export default router;

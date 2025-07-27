import db from '../config/db.js';

// Add a new review
export const addReview = async (req, res) => {
  const { book_id, customer_id, rating, description } = req.body;

  try {
    // Insert the review
    const insertedReview = await db.query(
      `INSERT INTO review (book_id, customer_id, rating, description)
       VALUES ($1, $2, $3, $4)
       RETURNING book_id, customer_id, rating, description`
      ,
      [book_id, customer_id, rating, description]
    );

    // Get the inserted review row
    const review = insertedReview.rows[0];

    // Optionally join with book title to send back
    const reviewWithBook = await db.query(
      `SELECT r.book_id, b.title AS book_title, r.rating, r.description
       FROM review r
       JOIN book b ON r.book_id = b.book_id
       WHERE r.book_id = $1 AND r.customer_id = $2`,
      [review.book_id, review.customer_id]
    );

    res.status(201).json(reviewWithBook.rows[0]);
  } catch (err) {
    if (err.message.includes('has not purchased')) {
      return res.status(403).json({ error: 'You can only review books you purchased' });
    }
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get all reviews for a specific book
export const getBookReviews = async (req, res) => {
  try {
    const { book_id } = req.params;
    const reviews = await db.query(
      `SELECT r.book_id, r.rating, r.description, c.customer_name
      FROM review r
      JOIN customer c ON r.customer_id = c.customer_id
      WHERE r.book_id = $1`,
      [book_id]
    );
    res.json(reviews.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get all reviews by a specific customer
export const getCustomerReviews = async (req, res) => {
  try {
    const { customer_id } = req.params;
    const reviews = await db.query(
      `SELECT * FROM review WHERE customer_id = $1`,
      [customer_id]
    );
    res.json(reviews.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { book_id, customer_id } = req.params;
    const { rating, description } = req.body;
    const updatedReview = await db.query(
      `UPDATE review SET rating = $1, description = $2
       WHERE book_id = $3 AND customer_id = $4
       RETURNING *`,
      [rating, description, book_id, customer_id]
    );
    if (updatedReview.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(updatedReview.rows[0]);
  } catch (err) {
    if (err.message.includes('has not purchased')) {
      return res.status(403).json({ error: 'You can only review books you purchased' });
    }
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { book_id, customer_id } = req.params;
    await db.query(
      `DELETE FROM review WHERE book_id = $1 AND customer_id = $2`,
      [book_id, customer_id]
    );
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

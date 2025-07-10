import db from '../config/db.js';

// Add a new review
export const addReview = async (req, res) => {
    const { book_id, customer_id, rating, description } = req.body;
    try {
        const newReview = await db.query(
            "INSERT INTO review (book_id, customer_id, rating, description) VALUES ($1, $2, $3, $4) RETURNING *",
            [book_id, customer_id, rating, description]
        );
        res.status(201).json(newReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

// Get all reviews for a specific book
export const getBookReviews = async (req, res) => {
    try {
        const { book_id } = req.params;
        const reviews = await db.query("SELECT * FROM review WHERE book_id = $1", [book_id]);
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
        const reviews = await db.query("SELECT * FROM review WHERE customer_id = $1", [customer_id]);
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
            "UPDATE review SET rating = $1, description = $2 WHERE book_id = $3 AND customer_id = $4 RETURNING *",
            [rating, description, book_id, customer_id]
        );
        if (updatedReview.rows.length === 0) {
            return res.status(404).json("Review not found.");
        }
        res.json(updatedReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const { book_id, customer_id } = req.params;
        await db.query("DELETE FROM review WHERE book_id = $1 AND customer_id = $2", [book_id, customer_id]);
        res.json("Review deleted.");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

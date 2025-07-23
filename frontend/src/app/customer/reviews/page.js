'use client';

import { useEffect, useState } from 'react';
import { getCustomerIdFromToken } from '../../utils/getCustomerId';

export default function CustomerReviews() {
    const [reviews, setReviews] = useState([]);
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');
    const [editingReview, setEditingReview] = useState(null);

    const customerId = getCustomerIdFromToken();

    useEffect(() => {
        if (!customerId) return;

        // Fetch customer reviews
        fetch(`http://localhost:3000/api/reviews/customer/${customerId}`)
            .then(res => res.json())
            .then(data => setReviews(data));

        // Fetch purchased books
        fetch(`http://localhost:3000/api/orders/customer/${customerId}/books`)
            .then(res => res.json())
            .then(data => setBooks(data));
    }, [customerId]);

    const handleAddReview = async () => {
        if (!selectedBook || rating === 0) {
            setMessage('Please select a book and provide a rating.');
            return;
        }

        const res = await fetch('http://localhost:3000/api/reviews/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                book_id: selectedBook,
                customer_id: customerId,
                rating,
                description: comment,
            }),
        });

        const result = await res.json();

        if (res.ok) {
            setReviews([...reviews, result]);
            setMessage('Review added successfully!');
            setRating(0);
            setComment('');
            setSelectedBook('');
        } else {
            setMessage(result.message || 'Failed to add review');
        }
    };

    const handleUpdateReview = async () => {
        if (!editingReview) return;

        const res = await fetch(
            `http://localhost:3000/api/reviews/update/${editingReview.book_id}/${customerId}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating,
                    description: comment,
                }),
            }
        );

        const result = await res.json();

        if (res.ok) {
            setReviews(reviews.map(r => r.book_id === editingReview.book_id ? result : r));
            setMessage('Review updated successfully!');
            setEditingReview(null);
            setRating(0);
            setComment('');
        } else {
            setMessage(result.message || 'Failed to update review');
        }
    };

    const handleDeleteReview = async (book_id) => {
        const res = await fetch(
            `http://localhost:3000/api/reviews/delete/${book_id}/${customerId}`,
            { method: 'DELETE' }
        );

        if (res.ok) {
            setReviews(reviews.filter(r => r.book_id !== book_id));
            setMessage('Review deleted successfully!');
        } else {
            const result = await res.json();
            setMessage(result.message || 'Failed to delete review');
        }
    };

    const startEdit = (review) => {
        setEditingReview(review);
        setRating(review.rating);
        setComment(review.description);  // Use description instead of review_text
        setSelectedBook(review.book_id);
    };

    return (
        <div className="min-h-screen bg-blue-50 py-10 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - My Reviews */}
                <div className="bg-white shadow-md rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-4">My Reviews</h2>
                    <div className="space-y-4">
                        {reviews.length === 0 && (
                            <p className="text-gray-600">You haven't reviewed any books yet.</p>
                        )}
                        {reviews.map(review => (
                            <div key={review.book_id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                                <p className="font-bold">
                                    Book: {books.find(b => b.book_id === review.book_id)?.title || 'Unknown'}
                                </p>
                                <p><strong>Rating:</strong> {review.rating}/5</p>
                                <p><strong>Comment:</strong> {review.description}</p>
                                <div className="mt-2 space-x-2">
                                    <button
                                        onClick={() => startEdit(review)}
                                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteReview(review.book_id)}
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Add/Edit Review */}
                <div className="bg-white shadow-md rounded-xl p-6">
                    <h3 className="text-2xl font-bold mb-4">{editingReview ? 'Edit Review' : 'Add a Review'}</h3>

                    <select
                        value={selectedBook}
                        onChange={e => setSelectedBook(e.target.value)}
                        className="w-full p-2 border rounded mb-3"
                        disabled={editingReview}
                    >
                        <option value="">Select a Book</option>
                        {books.map(book => (
                            <option key={book.book_id} value={book.book_id}>
                                {book.title}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Rating (1-5)"
                        value={rating}
                        onChange={e => setRating(Number(e.target.value))}
                        className="w-full p-2 border rounded mb-3"
                    />

                    <textarea
                        placeholder="Write a comment..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="w-full p-2 border rounded mb-3"
                    />

                    <div className="flex justify-center mt-2">
                        {editingReview ? (
                            <button
                                onClick={handleUpdateReview}
                                className="px-4 py-2 bg-slate-600 text-white hover:bg-slate-500 rounded"
                            >
                                Update Review
                            </button>
                        ) : (
                            <button
                                onClick={handleAddReview}
                                className="px-4 py-2 bg-slate-600 text-white hover:bg-slate-500 rounded"
                            >
                                Submit Review
                            </button>
                        )}
                    </div>

                    {message && (
                        <p className="mt-4 text-center text-sm text-green-600 font-medium">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

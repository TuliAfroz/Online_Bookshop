'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
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

        // Fetch purchased books to allow new reviews
        fetch(`http://localhost:3000/api/orders/customer/${customerId}/books`)
            .then(res => res.json())
            .then(data => setBooks(data));
    }, [customerId]);

    const handleAddReview = async () => {
        if (!selectedBook || rating === 0) {
            setMessage('Please select a book and provide a rating.');
            return;
        }

        const reviewData = { book_id: selectedBook, customer_id: customerId, rating, description: comment };

        const res = await fetch(`http://localhost:3000/api/reviews`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
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

        const reviewData = { rating, description: comment };

        const res = await fetch(`http://localhost:3000/api/reviews/${editingReview.book_id}/${customerId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });

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
        const res = await fetch(`http://localhost:3000/api/reviews/${book_id}/${customerId}`, { method: 'DELETE' });

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
        setComment(review.description);
        setSelectedBook(review.book_id);
    };

    return (
        <div className="min-h-screen bg-blue-50">
            <Header />
            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 mt-6 space-y-6">
                <h2 className="text-2xl font-bold mb-4">My Reviews</h2>

                {/* Add/Edit Review Form */}
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-lg mb-2">{editingReview ? 'Edit Review' : 'Add a Review'}</h3>
                    <select 
                        value={selectedBook} 
                        onChange={e => setSelectedBook(e.target.value)} 
                        className="w-full p-2 border rounded mb-2" 
                        disabled={editingReview}
                    >
                        <option value="">Select a Book</option>
                        {books.map(book => (
                            <option key={book.book_id} value={book.book_id}>{book.title}</option>
                        ))}
                    </select>
                    <input 
                        type="number" 
                        min="1" 
                        max="5" 
                        placeholder="Rating (1-5)" 
                        value={rating} 
                        onChange={e => setRating(e.target.value)} 
                        className="w-full p-2 border rounded mb-2" 
                    />
                    <textarea 
                        placeholder="Write a comment..." 
                        value={comment} 
                        onChange={e => setComment(e.target.value)} 
                        className="w-full p-2 border rounded mb-2" 
                    />
                    {editingReview ? (
                        <button onClick={handleUpdateReview} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">Update Review</button>
                    ) : (
                        <button onClick={handleAddReview} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500">Submit Review</button>
                    )}
                    {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
                </div>

                {/* Existing Reviews */}
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.book_id} className="p-4 border rounded-lg shadow-sm">
                            <p className="font-bold">Book ID: {review.book_id}</p>
                            <p><strong>Rating:</strong> {review.rating}/5</p>
                            <p><strong>Comment:</strong> {review.description}</p>
                            <div className="mt-2 space-x-2">
                                <button onClick={() => startEdit(review)} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">Edit</button>
                                <button onClick={() => handleDeleteReview(review.book_id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

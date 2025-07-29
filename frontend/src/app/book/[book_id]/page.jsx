'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function BookDetailPage() {
  const { book_id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/books/${book_id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load book');
        } else {
          setBook(data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong');
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/reviews/book/${book_id}`);
        const data = await res.json();
        if (!res.ok) {
          setError('Failed to load reviews');
        } else {
          setReviews(data);
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong loading reviews');
      }
    };

    fetchBook();
    fetchReviews();
  }, [book_id]);

  if (error) return <div className="p-10 text-red-600">{error}</div>;
  if (!book) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      {/* Book Details */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Book Cover */}
        <div>
          {book.cover_image_url?.startsWith('http') && (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full h-auto object-cover rounded"
            />
          )}
        </div>

        {/* Book Info */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-gray-700 text-lg mb-1">Author: {book.author_name}</p>
          <p className="text-gray-700 text-sm mb-1">
            Category: {book.categories?.join(', ') || 'N/A'}
          </p>
          <p className="text-gray-600 text-sm mb-3">{book.description}</p>
          <p className="text-slate-700 font-bold text-xl mb-2">৳{book.price}</p>
          <p className="text-green-600 font-medium text-md">
            {book.quantity > 0
              ? `In Stock (${book.quantity} copies available)`
              : 'Out of Stock'}
          </p>
          <p className="text-yellow-600 font-semibold text-lg mb-4">
            ⭐ Average Rating:{' '}
            {book.average_rating != null
              ? Number(book.average_rating).toFixed(1)
              : 'No ratings yet'}
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review this book!</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map(({ customer_name, rating, description }, index) => (
              <li key={index} className="border-b border-gray-200 pb-4">
                <p className="font-semibold">{customer_name}</p>
                <p className="text-yellow-600">⭐ {rating.toFixed(1)}</p>
                <p className="text-gray-700">{description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

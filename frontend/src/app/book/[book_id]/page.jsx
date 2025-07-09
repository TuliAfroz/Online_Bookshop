'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header'; // adjust path if needed

export default function BookDetailPage() {
  const { book_id } = useParams();
  const [book, setBook] = useState(null);
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

    fetchBook();
  }, [book_id]);

  if (error) return <div className="p-10 text-red-600">{error}</div>;
  if (!book) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-10 flex justify-center">
        <div className="max-w-4xl w-full bg-white p-6 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Book Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-gray-700 text-lg mb-1">Author: {book.author_name}</p>
            <p className="text-gray-700 text-sm mb-1">Category: {book.categories?.join(', ')}</p>
            <p className="text-gray-600 text-sm mb-3">{book.description}</p>
            <p className="text-slate-700 font-bold text-xl mb-2">৳{book.price}</p>
            <p className="text-green-600 font-medium text-md">
              {book.quantity > 0
                ? `In Stock (${book.quantity} copies available)`
                : 'Out of Stock'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

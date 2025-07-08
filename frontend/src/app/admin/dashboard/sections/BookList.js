'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BookList() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/books')
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Fetch failed: ${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) setBooks(data.data);
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center"> All Books</h2>
      {books.length === 0 ? (
        <p className="text-gray-500">No books found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.book_id} className="bg-white rounded-xl shadow p-4">
              <Link href={`/book/${book.book_id}`}>
                <div className="cursor-pointer hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out">
                  {book.cover_image_url?.startsWith('http') && (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-48 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-bold text-lg">{book.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">{book.author_name}</p>
                  <p className="text-slate-600 font-bold">৳{book.price}</p>
                  {book.average_rating && (
                    <p className="text-yellow-600 text-sm mt-1">
                      ⭐ {parseFloat(book.average_rating).toFixed(1)}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

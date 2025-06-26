'use client';

import { useEffect, useState } from 'react';

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
    <div>
      <h2 className="text-2xl font-semibold mb-4">📚 All Books</h2>
      {books.length === 0 ? (
        <p className="text-gray-500">No books found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <div
              key={book.book_id}
              className="bg-white rounded-xl shadow p-4 border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{book.description}</p>
              <p className="text-sm text-gray-800">
                <span className="font-medium">Price:</span> {book.price}৳
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Author ID:</span> {book.author_id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Publisher ID:</span> {book.publisher_id}
              </p>
              {book.cover_image_url && book.cover_image_url.startsWith('http') && (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="mt-3 w-full h-40 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

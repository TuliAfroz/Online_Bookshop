'use client';

import { useEffect, useState } from 'react';

export default function BookSearch() {
  const [books, setBooks] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');

  const fetchBooks = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/books');
      const data = await res.json();
      setBooks(data.data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTitle.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Search Books</h2>

      <input
        type="text"
        placeholder="Search by title..."
        className="w-full p-2 mb-4 border border-gray-300 rounded-xl"
        value={searchTitle}
        onChange={(e) => setSearchTitle(e.target.value)}
      />

      {filteredBooks.length === 0 ? (
        <p className="text-gray-500">No books found.</p>
      ) : (
        <ul className="space-y-3">
          {filteredBooks.map((book) => (
            <li
              key={`${book.book_id}-${book.copy_no}`}
              className="border p-3 rounded-xl shadow-sm bg-gray-50"
            >
              <p className="font-semibold">{book.title}</p>
              <p className="text-sm text-gray-600">
                Book ID: {book.book_id}
              </p>
              {book.description && (
                <p className="text-sm mt-1 text-gray-700">{book.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

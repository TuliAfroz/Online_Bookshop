'use client';

import { useEffect, useState } from 'react';

export default function CustomerDashboard() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/books');
        const data = await res.json();

        if (res.ok) {
          setBooks(data.data || []);
          setFilteredBooks(data.data || []);
        } else {
          console.error('Failed to fetch books:', data.error);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter((book) =>
      (book?.Title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4 text-center">📚 Browse Books</h1>

        <input
          type="text"
          placeholder="Search books by title..."
          className="w-full p-3 mb-6 border border-gray-300 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book, index) => (
            <div
              key={`${book.Book_ID || index}-${book.Copy_No || '0'}`}
              className="bg-gray-50 p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              {book.Cover_Image_URL && (
                <img
                  src={book.Cover_Image_URL}
                  alt={book.Title}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
              <h2 className="text-xl font-semibold mb-1">{book.Title}</h2>
              <p className="text-gray-700 text-sm mb-2">
                {book.Description || 'No description available.'}
              </p>
              <p className="text-blue-600 font-bold">${book.Price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

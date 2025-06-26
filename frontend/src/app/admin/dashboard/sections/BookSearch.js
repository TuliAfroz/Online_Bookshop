'use client';

import { useEffect, useState } from 'react';

export default function BookSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/api/books/search');
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format. Server returned HTML instead of JSON.');
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch books');
      }

      setBooks(data.data || []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(); // Initial load
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(); // Call the same function
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchBooks();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/books/search?query=${encodeURIComponent(searchTerm)}`);
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format. Server returned HTML instead of JSON.');
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setBooks(data.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Something went wrong.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Books</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by title, author, or category..."
          className="w-full p-2 mb-4 border border-gray-300 rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && <p>Searching...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && books.length === 0 && !error && <p>No results found.</p>}

      <ul className="space-y-4">
        {books.map((book) => (
          <li
            key={book.book_id}
            className="border p-4 rounded-lg shadow bg-gray-50"
          >
            <p className="font-semibold text-lg">{book.title}</p>
            <p className="text-sm text-gray-700">Author: {book.author_name}</p>
            <p className="text-sm text-gray-700">Price: ${book.price}</p>
            <p className="text-sm text-yellow-700">
              Rating: ⭐ {parseFloat(book.average_rating).toFixed(1)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

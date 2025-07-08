'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    fetchBooks();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
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
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Search Books</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by title, author, or category..."
          className="w-full p-2 border border-gray-300 rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600"
        >
          Search
        </button>
      </div>

      {loading && <p>Searching...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && books.length === 0 && !error && <p>No results found.</p>}

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
    </div>
  );
}

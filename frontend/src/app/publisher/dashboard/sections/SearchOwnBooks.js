'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublisherIdFromToken } from '../../utils/getPublisherId'; // update path if needed

export default function SearchOwnBooks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState(''); // <-- ADD THIS

  const booksPerPage = 18;

  const fetchBooks = async (query = '', sort = '') => {
    const publisherId = getPublisherIdFromToken();
    if (!publisherId) {
      setError('Unauthorized: No publisher ID found.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const url = new URL(`http://localhost:3000/api/books/publisher/${publisherId}`);
      if (query) url.searchParams.append('query', query);
      if (sort) url.searchParams.append('sort', sort); // <-- ADD SORT PARAM

      const res = await fetch(url.toString());
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) throw new Error('Invalid response format.');

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch books');

      setBooks(data.data || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBooks(searchTerm.trim(), sortOption); // <-- PASS sortOption
  };

  // Fetch books on mount and when sortOption changes
  useEffect(() => {
    fetchBooks('', sortOption); // <-- PASS sortOption
  }, [sortOption]);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => handleSearch(), 300);
    return () => clearTimeout(delay);
  }, [searchTerm, sortOption]);

  // Pagination logic for current page slice
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">My Books</h1>

      <div className="flex gap-2 max-w-2xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by title, author or catagory..."
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
        {/* --- SORT DROPDOWN --- */}
        <select
          className="p-2 border border-gray-300 rounded-xl"
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
        >
          <option value="">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Rating: High to Low</option>
          <option value="rating_asc">Rating: Low to High</option>
          <option value="name_asc">Name: A-Z</option>
          <option value="name_desc">Name: Z-A</option>
        </select>
      </div>

      {loading && <p className="text-center">Loading books...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}
      {!loading && books.length === 0 && !error && (
        <p className="text-gray-500 text-center">No books found.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-6">
        {currentBooks.map((book) => (
          <div
            key={book.book_id}
            className="bg-white rounded-xl shadow p-3 hover:shadow-2xl transform hover:scale-[1.03] transition duration-300 ease-in-out"
          >
            <Link href={`/book/${book.book_id}`}>
              <div className="cursor-pointer">
                {book.cover_image_url?.startsWith('http') && (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-60 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-bold text-base line-clamp-2">{book.title}</h3>
                <p className="text-sm text-gray-500 mb-1">{book.author_name}</p>
                <p className="text-slate-700 font-bold text-sm mb-1">৳{book.price}</p>
                {book.average_rating && (
                  <p className="text-yellow-600 text-xs">
                    ⭐ {parseFloat(book.average_rating).toFixed(1)}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &lt;
          </button>

          {currentPage > 2 && (
            <>
              <button onClick={() => setCurrentPage(1)} className="px-3 py-1 border rounded">1</button>
              {currentPage > 3 && <span className="px-2">...</span>}
            </>
          )}

          {currentPage > 1 && (
            <button onClick={() => setCurrentPage(currentPage - 1)} className="px-3 py-1 border rounded">
              {currentPage - 1}
            </button>
          )}

          <span className="px-3 py-1 border rounded bg-slate-700 text-white">{currentPage}</span>

          {currentPage < totalPages && (
            <button onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1 border rounded">
              {currentPage + 1}
            </button>
          )}

          {currentPage < totalPages - 1 && (
            <>
              {currentPage < totalPages - 2 && <span className="px-2">...</span>}
              <button onClick={() => setCurrentPage(totalPages)} className="px-3 py-1 border rounded">
                {totalPages}
              </button>
            </>
          )}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}

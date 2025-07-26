'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PublisherBookList({ publisherId }) {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 18;

  useEffect(() => {
    const fetchBooksByPublisher = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/books/publisher/${publisherId}?page=${currentPage}&limit=${booksPerPage}`);
        const data = await res.json();

        if (data.success) {
          setBooks(data.data || []);
          setTotalPages(Math.ceil((data.total || 0) / booksPerPage));
        }
      } catch (err) {
        console.error('Failed to fetch books by publisher:', err);
      }
    };

    if (publisherId) {
      fetchBooksByPublisher();
    }
  }, [publisherId, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <h2 className="text-2xl font-bold mb-6 text-center">My Published Books</h2>

      {books.length === 0 ? (
        <p className="text-gray-500 text-center">No books found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
            {books.map((book) => (
              <Link key={book.book_id} href={`/book/${book.book_id}`}>
                <div className="bg-white rounded-xl shadow hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out p-4 cursor-pointer w-40">
                  <div className="w-full h-60 flex items-center justify-center bg-gray-100 rounded mb-2 overflow-hidden">
                    {book.cover_image_url?.startsWith('http') && (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="h-full object-contain"
                      />
                    )}
                  </div>
                  <h3 className="font-bold text-sm line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-gray-500 mb-1">{book.author_name}</p>
                  <p className="text-slate-700 font-bold text-sm mb-1">৳{book.price}</p>
                  {book.average_rating && (
                    <p className="text-yellow-600 text-xs">
                      ⭐ {parseFloat(book.average_rating).toFixed(1)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

export default function ViewAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/authors?page=${currentPage}`)
      .then((res) => res.json())
      .then((data) => {
        setAuthors(data.data || []);
        setTotalPages(data.totalPages || 1); // assuming your backend returns this
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching authors:', err);
        setLoading(false);
      });
  }, [currentPage]);
  

  const fetchBooksByAuthor = (authorId) => {
    console.log('Fetch books by author ID:', authorId);
    // Navigate or update book list here
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Authors</h2>
      {loading ? (
        <p className="text-center">Loading authors...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {authors.length === 0 ? (
            <p className="text-center col-span-full text-gray-500">No authors found.</p>
          ) : (
            authors.map((author) => (
              <button
                key={author.author_id}
                onClick={() => fetchBooksByAuthor(author.author_id)}
                className="focus:outline-none"
              >
                <div className="bg-white rounded-xl shadow hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out p-4 cursor-pointer w-full text-center">
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded mb-2 overflow-hidden">
                    {author.author_image_url?.startsWith('http') ? (
                      <img
                        src={author.author_image_url}
                        alt={author.author_name}
                        className="h-full object-contain"
                      />
                    ) : (
                      <span className="text-3xl text-gray-600">👤</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm truncate">{author.author_name}</h3>
                  <p className="text-xs text-gray-500">{author.total_books ? `${author.total_books} books` : ''}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
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

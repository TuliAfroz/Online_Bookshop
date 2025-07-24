'use client';

import { useEffect, useState } from 'react';

export default function PublisherList() {
  const [publishers, setPublishers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const publishersPerPage = 18;

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/publishers?page=${currentPage}&limit=${publishersPerPage}`);
        const data = await res.json();
        if (data.success) {
          setPublishers(data.data);
          setTotalPages(Math.ceil(data.total / publishersPerPage));
        } else {
          console.error('Failed to load publishers');
        }
      } catch (err) {
        console.error('Error fetching publishers:', err);
      }
    };

    fetchPublishers();
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <h2 className="text-2xl font-bold mb-6 text-center">📚 All Publishers</h2>

      {publishers.length === 0 ? (
        <p className="text-gray-500 text-center">No publishers found.</p>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
            {publishers.map((publisher) => (
              <div key={publisher.publisher_id} className="bg-white rounded-xl shadow hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out p-4 cursor-pointer w-40">
                <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded mb-2 overflow-hidden">
                  {publisher.publisher_img_url?.startsWith('http') ? (
                    <img
                      src={publisher.publisher_img_url}
                      alt={publisher.publisher_name}
                      className="h-full object-contain"
                      onError={(e) => (e.target.src = '/fallback.png')}
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
                <h3 className="font-bold text-sm line-clamp-2 text-center">{publisher.publisher_name}</h3>
                <p className="text-xs text-gray-500 text-center mt-1">{publisher.phone_no || 'N/A'}</p>
              </div>
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 20;


  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredBooks(books);
        return;
      }
      fetch(`http://localhost:3000/api/books/search?query=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => setFilteredBooks(data.data || []))
        .catch(err => console.error('Search error:', err));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchBooks = async (page = 1) => {
    try {
      const res = await fetch(`http://localhost:3000/api/books?page=${page}&limit=${booksPerPage}`);
      const data = await res.json();
      setBooks(data.data || []);
      setFilteredBooks(data.data || []);
      setTotalPages(Math.ceil(data.total / booksPerPage));
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Login/Signup Floating Dropdown */}
      <div className="absolute top-4 right-4 z-20">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-white text-slate-700 font-semibold px-4 py-2 rounded hover:bg-gray-200 shadow"
          >
            Login / Signup
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow z-10 text-black p-2 space-y-2">
              {/* Login submenu */}
              <div className="group relative">
                <button className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">
                  Login ▸
                </button>
                <div className="absolute right-full top-0 w-40 bg-white shadow rounded hidden group-hover:block z-20">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => router.push('/admin/login')}
                  >
                    Admin
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => router.push('/customer/login')}
                  >
                    Customer
                  </button>
                </div>
              </div>

              {/* Signup submenu */}
              <div className="group relative">
                <button className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">
                  Signup ▸
                </button>
                <div className="absolute right-full top-0 w-40 bg-white shadow rounded hidden group-hover:block z-20">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => router.push('/admin/signup')}
                  >
                    Admin
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => router.push('/customer/signup')}
                  >
                    Customer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center p-4 mt-8">
        <input
          type="text"
          placeholder="Search by title, author, category or publisher"
          className="w-1/2 p-3 border border-gray-300 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Horizontal Menu as Buttons */}
      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {[
          'Author',
          'Publication',
          'Offers',
          'Academic Books',
          'Books In Stock'
        ].map((label) => (
          <button
            key={label}
            className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-xl shadow hover:bg-gray-100 transition"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Featured Books */}
<div className="px-6 pb-10 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7 gap-6 justify-items-center">
  {filteredBooks.map((book) => (
    <Link href={`/book/${book.book_id}`} key={book.book_id}>
      <div className="bg-white rounded-xl shadow hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out p-4 cursor-pointer w-40">
        {book.cover_image_url?.startsWith('http') && (
          <div className="w-full h-60 flex items-center justify-center bg-gray-100 rounded mb-2 overflow-hidden">
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="h-full object-contain"
            />
          </div>
        )}
        <h3 className="font-bold text-sm truncate">{book.title}</h3>
        <p className="text-xs text-gray-500 mb-1 truncate">{book.author_name}</p>
        <p className="text-blue-600 font-bold text-sm">৳{book.price}</p>
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

  {/* Show 1st, current, ..., last */}
  {currentPage > 2 && (
    <>
      <button onClick={() => setCurrentPage(1)} className="px-3 py-1 border rounded">1</button>
      {currentPage > 3 && <span className="px-2">...</span>}
    </>
  )}

  {/* Current Page */}
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

  {/* Show last */}
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


    </div>
  );
}
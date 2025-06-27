'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

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

  const fetchBooks = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/books');
      const data = await res.json();
      setBooks(data.data || []);
      setFilteredBooks(data.data || []);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-teal-900 text-white relative">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <BookOpen size={32} className="text-white" />
          <span className="text-2xl font-[cursive] tracking-widest italic">PORUA</span>
        </div>

        {/* Nested Login / Signup */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-white text-teal-900 font-semibold px-4 py-2 rounded hover:bg-gray-200"
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
                <div className="absolute right-full top-0 w-40 bg-white shadow rounded hidden group-hover:block">
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
                <div className="absolute right-full top-0 w-40 bg-white shadow rounded hidden group-hover:block">
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
      <div className="flex justify-center p-4">
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
          'Books In Stock',
          'New Books'
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
      <div className="px-6 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredBooks.map((book) => (
        <Link href={`/book/${book.book_id}`} key={book.book_id}>
          <div className="bg-white rounded-xl shadow hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out p-4 cursor-pointer">
            {book.cover_image_url?.startsWith('http') && (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-full h-48 object-cover rounded mb-2"
              />
            )}
            <h3 className="font-bold text-lg">{book.title}</h3>
            <p className="text-sm text-gray-500 mb-1">{book.author_name}</p>
            <p className="text-blue-600 font-bold">৳{book.price}</p>
          </div>
        </Link>
      ))}

      </div>
    </div>
  );
}

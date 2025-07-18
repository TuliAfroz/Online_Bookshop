'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  // 🌟 State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);       // NEW: publishers state
  const [activeAuthor, setActiveAuthor] = useState(null);
  const [activePublisher, setActivePublisher] = useState(null); // NEW: activePublisher state
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeView, setActiveView] = useState('books');
  const booksPerPage = 18;

  // 🌐 Fetch data on page load or when activeView/currentPage changes
  useEffect(() => {
    if (activeView === 'books') {
      if (activeAuthor !== null) {
        fetchBooksByAuthor(activeAuthor);
      } else if (activePublisher !== null) {
        fetchBooksByPublisher(activePublisher);
      } else {
        fetchBooks(currentPage);
      }
    } else if (activeView === 'authors') {
      fetchAuthors(currentPage);
    } else if (activeView === 'publications') {
      fetchPublishers(currentPage);
    }
  }, [activeView, currentPage, activeAuthor, activePublisher]);

  // 🔍 Search functionality (only searches books)
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
  }, [searchQuery, books]);

  // 📚 Fetch books (all)
  const fetchBooks = async (page = 1) => {
    try {
      const res = await fetch(`http://localhost:3000/api/books?page=${page}&limit=${booksPerPage}`);
      const data = await res.json();
      setBooks(data.data || []);
      setFilteredBooks(data.data || []);
      setTotalPages(Math.ceil(data.total / booksPerPage));
      setActiveAuthor(null);
      setActivePublisher(null);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };

  // 📚 Fetch books by author
  const fetchBooksByAuthor = async (authorId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/books/author/${authorId}`);
      const data = await res.json();
      setFilteredBooks(data.data || []);
      setTotalPages(1); // Assume no pagination for filtered results
      setActiveAuthor(authorId);
      setActivePublisher(null);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch books by author:', err);
    }
  };

  // 📚 Fetch books by publisher (NEW)
  const fetchBooksByPublisher = async (publisherId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/books/publisher/${publisherId}`);
      const data = await res.json();
      setFilteredBooks(data.data || []);
      setTotalPages(1); // Assume no pagination for filtered results
      setActivePublisher(publisherId);
      setActiveAuthor(null);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch books by publisher:', err);
    }
  };

  // 👤 Fetch authors
  const fetchAuthors = async (page = 1) => {
    try {
      const res = await fetch(`http://localhost:3000/api/authors?page=${page}&limit=${booksPerPage}`);
      const data = await res.json();
      setAuthors(data.data || []);
      setTotalPages(Math.ceil(data.total / booksPerPage));
    } catch (err) {
      console.error('Failed to fetch authors:', err);
    }
  };

  // 🏢 Fetch publishers (NEW)
  const fetchPublishers = async (page = 1) => {
    try {
      const res = await fetch(`http://localhost:3000/api/publishers?page=${page}&limit=${booksPerPage}`);
      const data = await res.json();
      setPublishers(data.data || []);
      setTotalPages(Math.ceil(data.total / booksPerPage));
    } catch (err) {
      console.error('Failed to fetch publishers:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Login/Signup Dropdown */}
      <div className="absolute top-4 right-4 z-20">
        {/* ...same as before, unchanged... */}
        {/* Skipped here for brevity */}
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

      {/* Button Menu */}
      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {[
          { label: 'Home', view: 'books' },
          { label: 'Authors', view: 'authors' },
          { label: 'Publications', view: 'publications' },
          { label: 'Categories', view: 'categories' },
          { label: 'Books In Stock', view: 'books' },
        ].map(({ label, view }) => (
          <button
            key={label}
            onClick={() => {
              setActiveView(view);
              setCurrentPage(1);
              setActiveAuthor(null);
              setActivePublisher(null);
              if (view === 'books') fetchBooks(1);
              else if (view === 'authors') fetchAuthors(1);
              else if (view === 'publications') fetchPublishers(1);
              // Add others if needed
            }}
            className={`bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-xl shadow hover:bg-gray-100 transition ${
              activeView === view ? 'bg-gray-200' : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="px-6 pb-10 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7 gap-6 justify-items-center">
        {/* Books view */}
        {activeView === 'books' &&
          filteredBooks.map((book) => (
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

        {/* Authors view */}
        {activeView === 'authors' &&
          authors.map((author) => (
            <button key={author.author_id} onClick={() => fetchBooksByAuthor(author.author_id)}>
              <div className="bg-white rounded-xl shadow hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out p-4 cursor-pointer w-40 text-center">
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
          ))}

        {/* Publishers view */}
        {activeView === 'publications' &&
          publishers.map((publisher) => (
            <button key={publisher.publisher_id} onClick={() => fetchBooksByPublisher(publisher.publisher_id)}>
              <div className="bg-white rounded-xl shadow hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out p-4 cursor-pointer w-40 text-center">
                <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded mb-2 overflow-hidden">
                  {publisher.publisher_img_url?.startsWith('http') ? (
                    <img
                      src={publisher.publisher_img_url}
                      alt={publisher.publisher_name}
                      className="h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl text-gray-600">🏢</span>
                  )}
                </div>
                <h3 className="font-bold text-sm truncate">{publisher.publisher_name}</h3>
                <p className="text-xs text-gray-500">{publisher.phone_no || ''}</p>
              </div>
            </button>
          ))}
      </div>

      {/* Pagination for books, authors, publishers */}
      {(activeView === 'books' || activeView === 'authors' || activeView === 'publications') && (
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
              <button onClick={() => setCurrentPage(1)} className="px-3 py-1 border rounded">
                1
              </button>
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

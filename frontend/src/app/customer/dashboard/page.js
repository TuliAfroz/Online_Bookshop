'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { getCustomerIdFromToken } from '../../utils/getCustomerId';
import Link from 'next/link';
import { User, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboard() {
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState([]);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [activeAuthor, setActiveAuthor] = useState(null);
  const [activePublisher, setActivePublisher] = useState(null);
  const [inStockMode, setInStockMode] = useState(false);
  const [categorySections, setCategorySections] = useState([]);
  const [activeView, setActiveView] = useState('books');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('');


  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 18;
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();


  // 🌐 Fetch data on page load or when activeView/currentPage/sortOption changes
  useEffect(() => {
    if (activeView === 'categories') {
      fetchCategoriesWithBooks();
    } else if (activeView === 'books') {
      if (inStockMode) {
        fetchBooksInStock(currentPage, sortOption); // <-- PASS sortOption
      } else if (activeAuthor !== null) {
        fetchBooksByAuthor(activeAuthor);
      } else if (activePublisher !== null) {
        fetchBooksByPublisher(activePublisher);
      } else {
        fetchBooks(currentPage, sortOption); // <-- PASS sortOption
      }
    } else if (activeView === 'authors') {
      fetchAuthors(currentPage);
    } else if (activeView === 'publications') {
      fetchPublishers(currentPage);
    }
  }, [activeView, currentPage, activeAuthor, activePublisher, inStockMode, sortOption]); // <-- ADD sortOption


  useEffect(() => {
    const customerId = getCustomerIdFromToken();
    if (!customerId) return;

    fetch(`http://localhost:3000/api/customers/${customerId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && data.data) setCustomerName(data.data.customer_name);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const customerId = getCustomerIdFromToken();
    if (!customerId) return;

    fetch(`http://localhost:3000/api/cart/${customerId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.items) setCart(data.items);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [sortOption]); // <-- ADD sortOption

  useEffect(() => {
    const delay = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredBooks(books);
        return;
      }
      let url = `http://localhost:3000/api/books/search?query=${encodeURIComponent(searchQuery)}`;
      if (sortOption) url += `&sort=${sortOption}`; // <-- ADD SORT TO SEARCH
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setFilteredBooks(data.data || []);
          setCurrentPage(1);
        })
        .catch(console.error);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, books, sortOption]); // <-- ADD sortOption

  // 📚 Fetch books (all)
  const fetchBooks = async (page = 1, sort = '') => {
    try {
      let url = `http://localhost:3000/api/books?page=${page}&limit=${booksPerPage}`;
      if (sort) url += `&sort=${sort}`; // <-- ADD SORT PARAM
      const res = await fetch(url);
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
  const fetchCategoriesWithBooks = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/books/by-category');
      const data = await res.json();
      setCategorySections(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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
      setActiveView('books');
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
      setActiveView('books');
    } catch (err) {
      console.error('Failed to fetch books by publisher:', err);
    }
  };
  // Update fetchBooksInStock to accept sort
  const fetchBooksInStock = async (page = 1, sort = sortOption) => {
    try {
      let url = `http://localhost:3000/api/books/in-stock?page=${page}&limit=${booksPerPage}`;
      if (sort) url += `&sort=${sort}`; // <-- ADD SORT PARAM
      const res = await fetch(url);
      const data = await res.json();
      setBooks(data.data || []);
      setFilteredBooks(data.data || []);
      setTotalPages(data.totalPages || 1);
      setActiveAuthor(null);
      setActivePublisher(null);
      setCurrentPage(page);
      setActiveView('books');
      setInStockMode(true);
    } catch (err) {
      console.error('Failed to fetch books in stock:', err);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleAddToCart = async (bookId) => {
    const customerId = getCustomerIdFromToken();
    if (!customerId) return alert('You must be logged in');

    try {
      const res = await fetch('http://localhost:3000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          cart_items: [{ book_id: bookId, quantity: 1 }]
        })
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Failed to add to cart');

      const updatedCart = await fetch(`http://localhost:3000/api/cart/${customerId}`);
      const updatedData = await updatedCart.json();
      if (updatedData?.items) setCart(updatedData.items);

    } catch (err) {
      console.error('Add to cart error:', err);
      alert('Failed to add to cart.');
    }
  };

  const getQuantityInCart = (bookId) =>
    cart.find(item => item.book_id === bookId)?.quantity || 0;

  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="flex justify-end items-center gap-4 px-6 pt-4">
        <button
          onClick={() => router.push('/customer/cart')}
          className="text-gray-800 hover:text-blue-600 transition"
        >
          <ShoppingCart size={24} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-xl shadow hover:bg-gray-100 transition"
          >
            <User size={20} />
            <span className="font-medium">{customerName || 'User'}</span>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow z-10 text-sm">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/customer/dashboard');
                }}
              >
                Home
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/customer/profile');
                }}
              >
                My Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/customer/reviews');
                }}
              >
                Reviews
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/customer/orders');
                }}
              >
                Orders
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Search & Sort */}
      <div className="flex justify-center items-center gap-4 p-4">
        <input
          type="text"
          placeholder="Search by title, author, category or publisher"
          className="w-1/2 p-3 border border-gray-300 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* --- SORT DROPDOWN --- */}
        <select
          className="p-3 border border-gray-300 rounded-xl"
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

      {/* Button Menu */}
      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {[
          { label: 'Home', view: 'books', onClick: () => fetchBooks(1) },
          { label: 'Authors', view: 'authors', onClick: () => fetchAuthors(1) },
          { label: 'Publications', view: 'publications', onClick: () => fetchPublishers(1) },
          { label: 'Categories', view: 'categories' },
          { label: 'Books In Stock', view: 'books', onClick: () => fetchBooksInStock(1) },
        ].map(({ label, view, onClick }) => (
          <button
            key={label}
            onClick={() => {
              setActiveView(view);
              setCurrentPage(1);
              setActiveAuthor(null);
              setActivePublisher(null);
              setInStockMode(false);
              onClick?.();
            }}
            className={`bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-xl shadow hover:bg-gray-100 transition ${activeView === view ? 'bg-gray-200' : ''
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
    <div key={book.book_id} className="bg-white rounded-xl shadow hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out p-4 w-40">
      <Link href={`/book/${book.book_id}`}>
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
        <p className="text-yellow-600 font-semibold mb-1">
          ⭐ {book.average_rating != null && !isNaN(book.average_rating)
            ? Number(book.average_rating).toFixed(1)
            : '0.0'}
        </p>
        <p className="text-blue-600 font-bold text-sm">৳{book.price}</p>
        <div className="text-xs mt-1 text-gray-700">In cart: {getQuantityInCart(book.book_id)}</div>
      </Link>
      <button
        onClick={() => handleAddToCart(book.book_id)}
        className="mt-3 w-full bg-slate-700 text-white text-sm px-3 py-2 rounded hover:bg-slate-600 transition whitespace-nowrap"
      >
        Add to Cart
      </button>
    </div>
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
      {/* Categories view */}
      {activeView === 'categories' && categorySections.map((category) => {
        const scrollRef = React.createRef();

        const scrollLeft = () => {
          if (scrollRef.current) scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
        };

        const scrollRight = () => {
          if (scrollRef.current) scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        };

        return (
          <div
            key={category.category_id}
            className="bg-white shadow-md rounded-xl p-6 mb-10 max-w-6xl mx-auto"
          >
            <h2 className="text-xl font-semibold mb-4">{category.category_name}</h2>
            <div className="flex items-center">
              <button onClick={scrollLeft} className="text-2xl px-3">←</button>
              <div
                ref={scrollRef}
                className="flex overflow-x-auto space-x-4 scrollbar-hide px-4"
              >
                {category.books.map((book) => (
                  <div
                    key={book.book_id}
                    className="bg-gray-50 rounded-xl shadow hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out p-4 cursor-pointer w-40 shrink-0"
                  >
                    <Link href={`/book/${book.book_id}`}>
                      <div>
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
                    <div className="text-xs mt-1 text-gray-700">In cart: {getQuantityInCart(book.book_id)}</div>
                    <button
                      onClick={() => handleAddToCart(book.book_id)}
                      className="mt-2 w-full bg-slate-700 text-white text-sm px-3 py-2 rounded hover:bg-slate-600 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={scrollRight} className="text-2xl px-3">→</button>
            </div>
          </div>
        );
        
      })}

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

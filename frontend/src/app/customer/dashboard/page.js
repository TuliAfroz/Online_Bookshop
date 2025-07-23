'use client';

import { useEffect, useState } from 'react';
import { getCustomerIdFromToken } from '../../utils/getCustomerId';
import Link from 'next/link';
import { User, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboard() {
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState([]);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 18;
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const router = useRouter();

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
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredBooks(books);
        return;
      }

      fetch(`http://localhost:3000/api/books/search?query=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setFilteredBooks(data.data || []);
          setCurrentPage(1);
        })
        .catch(console.error);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const fetchBooks = async () => {
    const res = await fetch('http://localhost:3000/api/books?page=1&limit=1000');
    const data = await res.json();
    setBooks(data.data || []);
    setFilteredBooks(data.data || []);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-end items-center gap-4 px-6 pt-4">
        <button onClick={() => router.push('/customer/cart')} className="text-gray-800 hover:text-blue-600 transition">
          <ShoppingCart size={24} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-xl shadow hover:bg-gray-100 transition"
          >
            <User size={20} />
            <span className="font-medium">{customerName}</span>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow z-10 text-sm">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => router.push('/customer/profile')}
              >
                My Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => router.push('/customer/reviews')}
              >
                Reviews
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Search */}
      <div className="flex justify-center p-4">
        <input
          type="text"
          placeholder="Search by title, author, category or publisher"
          className="w-1/2 p-3 border border-gray-300 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Book Grid */}
      <div className="px-6 pb-10 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7 gap-6 justify-items-center">
        {paginatedBooks.map((book) => (
          <div key={book.book_id} className="w-40 bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between">
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
              <div className="text-xs mt-1 text-gray-700">In cart: {getQuantityInCart(book.book_id)}</div>
            </div>
          </Link>
        
          <button
            onClick={() => handleAddToCart(book.book_id)}
            className="mt-3 w-full bg-slate-700 text-white text-sm px-3 py-2 rounded hover:bg-slate-600 transition whitespace-nowrap"
          >
            Add to Cart
          </button>
        </div>
        
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-10 mb-16 space-x-2">
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
    </div>
  );
}

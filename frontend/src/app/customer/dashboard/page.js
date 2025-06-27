// frontend/src/app/customer/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
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

  const router = useRouter();

  useEffect(() => {
    const customerId = getCustomerIdFromToken();
    if (!customerId) return;

    fetch(`http://localhost:3000/api/customers/${customerId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && data.data) setCustomerName(data.data.name);
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
      if (!searchQuery.trim()) return setFilteredBooks(books);
      fetch(`http://localhost:3000/api/books/search?query=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => setFilteredBooks(data.data || []))
        .catch(console.error);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const fetchBooks = async () => {
    const res = await fetch('http://localhost:3000/api/books');
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
  
      // Update cart again
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => router.push('/customer/profile')}>My Profile</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleLogout}>Sign Out</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center p-4">
        <input
          type="text"
          placeholder="Search by title, author, category or publisher"
          className="w-1/2 p-3 border border-gray-300 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="px-6 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.book_id} className="bg-white rounded-xl shadow p-4">
            <Link href={`/book/${book.book_id}`}>
              <div className="cursor-pointer hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out">
                {book.cover_image_url?.startsWith('http') && (
                  <img src={book.cover_image_url} alt={book.title} className="w-full h-48 object-cover rounded mb-2" />
                )}
                <h3 className="font-bold text-lg">{book.title}</h3>
                <p className="text-sm text-gray-500 mb-1">{book.author_name}</p>
                <p className="text-blue-600 font-bold">৳{book.price}</p>

                <div className="mt-2 text-sm text-gray-800">
                  <span>In cart : {getQuantityInCart(book.book_id)}</span>
                </div>

              </div>
            </Link>
            <button
              onClick={() => handleAddToCart(book.book_id)}
              className="mt-2 w-full bg-teal-800 text-white py-2 rounded-xl hover:bg-teal-700 transition"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

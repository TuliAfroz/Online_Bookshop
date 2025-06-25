'use client';

import { useEffect, useState } from 'react';
import { getCustomerIdFromToken } from '@/app/utils/getCustomerId';

export default function CustomerDashboard() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const customerId = getCustomerIdFromToken();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/books');
        const data = await res.json();
        setBooks(data.data);
        setFilteredBooks(data.data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      }
    };

    const fetchCart = async () => {
      if (!customerId) return;
      try {
        const res = await fetch(`http://localhost:3000/api/cart/${customerId}`);
        const data = await res.json();
        setCart(data.items || []);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      }
    };

    fetchBooks();
    fetchCart();
  }, [customerId]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = books.filter(book =>
      book.title?.toLowerCase().includes(query)
    );
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  const addToCart = async (bookId) => {
    try {
      const res = await fetch('http://localhost:3000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_id: customerId,
          cart_items: [{ book_id: bookId, quantity: 1 }]
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
      } else {
        const data = await res.json();
        console.log('Added to cart:', data);
        // Re-fetch cart
        const cartRes = await fetch(`http://localhost:3000/api/cart/${customerId}`);
        const cartData = await cartRes.json();
        setCart(cartData.items || []);
      }
    } catch (error) {
      console.error('Add to cart failed:', error);
    }
  };

  const getQuantityInCart = (bookId) =>
    cart.find(item => item.book_id === bookId)?.quantity || 0;

  const toggleCart = () => setCartVisible(!cartVisible);

  const total = cart.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛍️ Customer Dashboard</h1>
        <button
          onClick={toggleCart}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          🛒 Cart ({cart.length})
        </button>
      </div>

      {cartVisible && (
        <div className="mb-6 bg-white p-4 rounded-2xl shadow border">
          <h2 className="text-xl font-semibold mb-2">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Cart is empty.</p>
          ) : (
            <ul className="space-y-2">
              {cart.map((item) => (
                <li key={item.cartitem_id} className="flex justify-between border-b pb-1">
                  <span>{item.title} × {item.quantity}</span>
                  <span className="font-semibold text-blue-600">${item.total}</span>
                </li>
              ))}
              <li className="flex justify-between font-bold pt-2">
                <span>Total:</span>
                <span>${total}</span>
              </li>
            </ul>
          )}
        </div>
      )}

      <input
        type="text"
        placeholder="Search books by title..."
        className="w-full p-3 mb-6 border border-gray-300 rounded-xl"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div
            key={book.book_id}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition"
          >
            {book.cover_image_url?.startsWith('http') && (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            )}
            <h2 className="text-xl font-semibold mb-1">{book.title}</h2>
            <p className="text-gray-600 text-sm mb-2">
              {book.description || 'No description available.'}
            </p>
            <p className="text-blue-600 font-bold mb-2">${book.price}</p>
            <p className="text-sm text-gray-500 mb-2">
              In Cart: {getQuantityInCart(book.book_id)}
            </p>
            <button
              onClick={() => addToCart(book.book_id)}
              className="bg-green-500 text-white px-4 py-2 rounded-xl"
            >
              ➕ Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

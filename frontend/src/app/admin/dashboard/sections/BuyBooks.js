'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BuyBooks() {
  const [publishers, setPublishers] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState({}); // book_id => { quantity, price_per_unit }
  const [adminBalance, setAdminBalance] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Always admin 101 for balance, but any admin can buy
  const ADMIN_ID = 101;

  // Fetch all publishers on mount
  axios.get('/api/publishers')
  .then(res => setPublishers(res.data.publishers)) // or whatever your actual key is
  .catch(err => {
    console.error('Failed to fetch publishers:', err);
    setPublishers([]); // set empty array to avoid map error
  });


  // Fetch admin balance (admin 101) on mount
  useEffect(() => {
    axios.get(`http://localhost:3000/api/admin/${ADMIN_ID}/balance`)
      .then(res => setAdminBalance(res.data.balance))
      .catch(err => {
        console.error('Error fetching admin balance:', err);
        setAdminBalance(0);
      });
  }, []);

  // Fetch books when publisher selected
  useEffect(() => {
    if (!selectedPublisher) {
      setBooks([]);
      setSelectedBooks({});
      setTotalPrice(0);
      return;
    }

    axios.get(`http://localhost:3000/api/books/publisher/${selectedPublisher}`)
      .then(res => {
        setBooks(res.data);
        setSelectedBooks({});
        setTotalPrice(0);
      })
      .catch(err => {
        console.error('Error fetching publisher books:', err);
        setBooks([]);
        setSelectedBooks({});
        setTotalPrice(0);
      });
  }, [selectedPublisher]);

  // Update total price when selectedBooks change
  useEffect(() => {
    let total = 0;
    for (const bookId in selectedBooks) {
      const { quantity, price_per_unit } = selectedBooks[bookId];
      total += quantity * price_per_unit;
    }
    setTotalPrice(total);
  }, [selectedBooks]);

  // Handle checkbox toggle
  const toggleSelectBook = (book) => {
    setSelectedBooks(prev => {
      if (prev[book.book_id]) {
        // Deselect => remove
        const copy = { ...prev };
        delete copy[book.book_id];
        return copy;
      } else {
        // Select with quantity 1 by default
        // Only add if total price + book.price_per_unit <= adminBalance
        if (totalPrice + book.price_per_unit > adminBalance) {
          alert("Cannot select books exceeding admin balance!");
          return prev;
        }
        return {
          ...prev,
          [book.book_id]: { quantity: 1, price_per_unit: book.price },
        };
      }
    });
  };

  // Increase quantity of selected book (if within balance)
  const increaseQuantity = (bookId) => {
    setSelectedBooks(prev => {
      const current = prev[bookId];
      if (!current) return prev; // safety

      // Calculate new total if we add one more
      const newTotal = totalPrice + current.price_per_unit;
      if (newTotal > adminBalance) {
        alert("Cannot exceed admin balance!");
        return prev;
      }

      return {
        ...prev,
        [bookId]: { ...current, quantity: current.quantity + 1 },
      };
    });
  };

  // Decrease quantity of selected book (min 1)
  const decreaseQuantity = (bookId) => {
    setSelectedBooks(prev => {
      const current = prev[bookId];
      if (!current) return prev;

      if (current.quantity === 1) {
        // If quantity hits 0, deselect book
        const copy = { ...prev };
        delete copy[bookId];
        return copy;
      }

      return {
        ...prev,
        [bookId]: { ...current, quantity: current.quantity - 1 },
      };
    });
  };

  // Place Order button handler
  const handlePlaceOrder = async () => {
    if (!selectedPublisher) {
      alert("Please select a publisher.");
      return;
    }

    const booksToOrder = Object.entries(selectedBooks).map(([book_id, { quantity, price_per_unit }]) => ({
      book_id,
      quantity,
      price_per_unit,
    }));

    if (booksToOrder.length === 0) {
      alert("Select at least one book.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/publisher-orders/place', {
        admin_id: ADMIN_ID,
        publisher_id: selectedPublisher,
        books: booksToOrder,
      });

      alert("Order placed! Waiting for publisher confirmation.");
      setOrderPlaced(true);
      setOrderId(res.data.publisher_order_id);

      // Reset selection (optional)
      setSelectedBooks({});
      setTotalPrice(0);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Buy Books</h1>

      <div className="mb-6">
        <label htmlFor="publisher-select" className="block mb-2 font-semibold">
          Select Publisher:
        </label>
        <select
          id="publisher-select"
          className="p-2 border rounded w-full max-w-sm"
          value={selectedPublisher || ''}
          onChange={(e) => setSelectedPublisher(e.target.value || null)}
        >
          <option value="">-- Choose a publisher --</option>
          {publishers.map((p) => (
            <option key={p.publisher_id} value={p.publisher_id}>
              {p.publisher_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 font-semibold">Admin Balance: ৳{adminBalance.toFixed(2)}</div>

      {books.length > 0 ? (
        <div className="space-y-3 border rounded p-4 max-w-3xl">
          {books.map((book) => {
            const isSelected = selectedBooks.hasOwnProperty(book.book_id);
            const quantity = isSelected ? selectedBooks[book.book_id].quantity : 0;

            return (
              <div
                key={book.book_id}
                className="flex items-center gap-4 border-b last:border-none pb-2"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectBook(book)}
                  className="w-5 h-5"
                />
                {book.cover_image_url && (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{book.title}</div>
                  <div className="text-sm text-gray-600">Price: ৳{book.price.toFixed(2)}</div>
                </div>

                {/* Quantity controls */}
                {isSelected && (
                  <div className="flex items-center gap-1 border rounded overflow-hidden select-none">
                    <button
                      onClick={() => decreaseQuantity(book.book_id)}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
                      type="button"
                    >
                      –
                    </button>
                    <span className="px-3">{quantity}</span>
                    <button
                      onClick={() => increaseQuantity(book.book_id)}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
                      type="button"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : selectedPublisher ? (
        <p>No books found for this publisher.</p>
      ) : null}

      <div className="mt-6 text-right font-bold text-xl">
        Total Price: <span className="text-green-700">৳{totalPrice.toFixed(2)}</span>
      </div>

      <div className="mt-4 text-right">
        <button
          disabled={totalPrice === 0}
          onClick={handlePlaceOrder}
          className={`px-6 py-2 rounded text-white ${
            totalPrice === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-600'
          }`}
        >
          Place Order
        </button>
      </div>

      {orderPlaced && (
        <div className="mt-8 p-4 border rounded bg-yellow-50 text-yellow-800 font-semibold">
          Order placed successfully! Waiting for publisher confirmation.
          <br />
          Order ID: {orderId}
        </div>
      )}
    </div>
  );
}

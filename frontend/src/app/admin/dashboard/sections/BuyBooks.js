'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BuyBooks() {
  const [publishers, setPublishers] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState(null);
  const [books, setBooks] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotal, setSubtotal] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const adminId = 101;

  const [adminBalance, setAdminBalance] = useState(0);

  // Fetch publishers
  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/publishers');
        const data = await res.json();
        if (Array.isArray(data.data)) {
          setPublishers(data.data);
        } else {
          console.error('Invalid publisher response format:', data);
        }
      } catch (error) {
        console.error('Failed to fetch publishers:', error);
      }
    };
    fetchPublishers();
  }, []);

  // Fetch books
  useEffect(() => {
    if (!selectedPublisher) return;
    axios.get(`http://localhost:3000/api/books/publisher/${selectedPublisher}`)
      .then(res => {
        const bookList = res.data.data || [];
        setBooks(bookList);
        setQuantities({});
      })
      .catch(err => console.error(err));
  }, [selectedPublisher]);

  // Subtotal calculation
  useEffect(() => {
    let sum = 0;
    for (const book of books) {
      const q = quantities[book.book_id] || 0;
      sum += q * book.price;
    }
    setSubtotal(sum);
  }, [quantities, books]);

    // Polling for order status
  useEffect(() => {
    if (!orderId) return;
  
    const interval = setInterval(async () => {
      try {

        if (!orderId || orderId === 'null') return;

        const res = await axios.get(`http://localhost:3000/api/publisher-orders/${orderId}/status`);
        const status = res.data.status;
  
        setOrderStatus(status);
  
        if (status === 'confirmed') {
          clearInterval(interval); // Stop polling once confirmed
        }
      } catch (err) {
        console.error('Failed to fetch order status:', err);
      }
    }, 3000); // poll every 3 seconds
  
    return () => clearInterval(interval); // cleanup on unmount or orderId change
  }, [orderId]);
  

  // Admin balance (from admin 101)
  useEffect(() => {
    axios.get(`http://localhost:3000/api/admin/101/balance`)
      .then(res => setAdminBalance(res.data.balance || 0))
      .catch(err => console.error(err));
  }, []);

  const updateQuantity = (bookId, delta) => {
    setQuantities(prev => {
      const newQty = Math.max(0, (prev[bookId] || 0) + delta);
      return { ...prev, [bookId]: newQty };
    });
  };

  const handlePlaceOrder = async () => {
    const orderedBooks = books
      .filter(book => (quantities[book.book_id] || 0) > 0)
      .map(book => ({
        book_id: book.book_id,
        quantity: quantities[book.book_id],
        price_per_unit: book.price,
      }));

    if (orderedBooks.length === 0) return alert('Select at least one book.');

    try {
      const res = await axios.post('http://localhost:3000/api/publisher-orders/place', {
        admin_id: adminId,
        publisher_id: selectedPublisher,
        books: orderedBooks,
      });

      alert('✅ Order placed!');
      setOrderId(res.data.publisher_order_id);
      setOrderStatus('pending');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to place order.');
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    await axios.delete(`http://localhost:3000/api/publisher-orders/cancel/${orderId}`);
    alert('🛑 Order cancelled');
    setOrderId(null);
    setOrderStatus('');
  };

  const handlePayment = async () => {
    if (!transactionId || !paymentMethod) {
      alert('Enter transaction ID and select payment method.');
      return;
    }

    try {
      await axios.post(`http://localhost:3000/api/publisher-orders/payment`, {
        publisher_order_id: orderId,
        transaction_id: transactionId,
        method: paymentMethod,
      });

      alert('✅ Payment successful and inventory updated');
      setOrderId(null);
      setOrderStatus('');
      setQuantities({});
    } catch (err) {
      console.error(err);
      alert('❌ Payment failed');
    }
  };

  const discount = subtotal * 0.05;
  const total = subtotal - discount;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Buy Books</h2>

      <select
        className="border rounded p-2 w-full mb-6"
        onChange={(e) => setSelectedPublisher(e.target.value)}
      >
        <option value="">Select Publisher</option>
        {publishers.map(p => (
          <option key={p.publisher_id} value={p.publisher_id}>{p.publisher_name}</option>
        ))}
      </select>

      {books.length > 0 && (
        <>
          <div className="space-y-4">
            {books.map(book => (
              <div
                key={book.book_id}
                className="flex items-center gap-4 bg-white shadow p-4 rounded"
              >
                <img src={book.cover_image_url} alt={book.title} className="w-20 h-28 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{book.title}</h3>
                  <p className="text-sm text-gray-600">৳{book.price}</p>
                </div>

                <div className="flex items-center border rounded">
                  <button onClick={() => updateQuantity(book.book_id, -1)} className="px-3 py-2 bg-gray-100">–</button>
                  <span className="px-4">{quantities[book.book_id] || 0}</span>
                  <button onClick={() => updateQuantity(book.book_id, 1)} className="px-3 py-2 bg-gray-100">+</button>
                </div>

                <div className="text-right text-sm font-semibold ml-6">
                  ৳{(quantities[book.book_id] || 0) * book.price}
                </div>
              </div>
            ))}
          </div>

          <div className="text-right mt-6 text-lg">
            <div>
              <span className="font-semibold">Subtotal:</span>{' '}
              <span className="font-normal"> ৳{subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-semibold">Discount (5%):</span>{' '}
              <span className="font-normal"> -৳{discount.toFixed(2)}</span>
            </div>
            <div className="text-xl">
              <span className="font-bold">Total:</span>{' '}
              <span className="font-normal"> ৳{total.toFixed(2)}</span>
            </div>
          </div>

          {orderId ? (
            <div className="mt-6 space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Order ID: {orderId}</h3>

              {orderStatus === 'pending' && (
                <div className="text-yellow-600 font-medium">
                  🔄 Your order is <strong>pending</strong>. Please wait for publisher confirmation.
                </div>
              )}

              {orderStatus === 'confirmed' && (
                <>
                  <input
                    type="text"
                    className="border rounded p-2 w-full"
                    placeholder="Transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />

                  <select
                    className="border rounded p-2 w-full"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Bkash">Bkash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                  </select>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={handleCancelOrder}
                      className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500"
                    >
                      Cancel Order
                    </button>
                    <button
                      onClick={handlePayment}
                      className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500"
                    >
                      Make Payment
                    </button>
                  </div>

                </>
              )}
            </div>
          ) : (
            <button
              onClick={handlePlaceOrder}
              className="mt-6 bg-slate-600 text-white px-4 py-2 py-2 rounded hover:bg-slate-500 mx-auto block"
            >
              Place Order
            </button>
          )}
        </>
      )}
    </div>
  );
}

// in this page, keep 2 columns. one for pending books and the other for buying books. once a books order is placed and it is in pending state, it will be added to the left column(pending orders). and then the buy book column will be cleared. once an order is confirmed, the futher payment and other functionalities will be done in the left column ....now give me a fresh, correct code like you just did
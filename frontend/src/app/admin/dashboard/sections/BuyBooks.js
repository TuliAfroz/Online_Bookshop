'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BuyBooks() {
  const [publishers, setPublishers] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [books, setBooks] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotal, setSubtotal] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [orderStatusMap, setOrderStatusMap] = useState({});
  const [transactionInputs, setTransactionInputs] = useState({});
  const adminId = 101;

  // Fetch publishers
  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/publishers');
        const data = await res.json();
        setPublishers(data.data || []);
      } catch (err) {
        console.error('Failed to fetch publishers:', err);
      }
    };
    fetchPublishers();
  }, []);

  // Fetch books of selected publisher
  useEffect(() => {
    if (!selectedPublisher) return;
    axios.get(`http://localhost:3000/api/books/publisher/${selectedPublisher}`)
      .then(res => {
        setBooks(res.data.data || []);
        setQuantities({});
      })
      .catch(err => console.error(err));
  }, [selectedPublisher]);

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/publisher-orders/admin/pending-orders');
      setPendingOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch pending orders:', err);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  // Poll order status
  useEffect(() => {
    const interval = setInterval(async () => {
      for (const order of pendingOrders) {
        try {
          const res = await axios.get(`http://localhost:3000/api/publisher-orders/${order.publisher_order_id}/status`);
          const status = res.data.status;
          setOrderStatusMap(prev => ({ ...prev, [order.publisher_order_id]: status }));
        } catch (err) {
          console.error('Polling error:', err);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [pendingOrders]);

  // Subtotal Calculation
  useEffect(() => {
    let sum = 0;
    for (const book of books) {
      const qty = quantities[book.book_id] || 0;
      sum += qty * book.price;
    }
    setSubtotal(sum);
  }, [quantities, books]);

  const updateQuantity = (bookId, delta) => {
    setQuantities(prev => {
      const newQty = Math.max(0, (prev[bookId] || 0) + delta);
      return { ...prev, [bookId]: newQty };
    });
  };

  const handlePlaceOrder = async () => {
    const orderedBooks = books
      .filter(book => quantities[book.book_id] > 0)
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
      setQuantities({});
      setSelectedPublisher('');
      setBooks([]);
      fetchPendingOrders();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to place order.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:3000/api/publisher-orders/cancel/${orderId}`);
      alert('🛑 Order cancelled');
      fetchPendingOrders();
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  const handlePayment = async (orderId) => {
    const { transactionId, paymentMethod } = transactionInputs[orderId] || {};
    if (!transactionId || !paymentMethod) {
      alert('Provide transaction ID and method');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/publisher-orders/payment', {
        publisher_order_id: orderId,
        transaction_id: transactionId,
        method: paymentMethod,
      });

      alert('✅ Payment successful');
      fetchPendingOrders();
    } catch (err) {
      console.error('Payment error:', err);
      alert('❌ Payment failed');
    }
  };

  const handleInputChange = (orderId, field, value) => {
    setTransactionInputs(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value },
    }));
  };

  const discount = subtotal * 0.05;
  const total = subtotal - discount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 max-w-7xl mx-auto">
      {/* LEFT: Pending Orders */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-center">Pending Orders</h2>
        {pendingOrders.length === 0 ? (
          <p className="text-gray-500 text-center">No pending orders</p>
        ) : (
          pendingOrders.map(order => (
            <div key={order.publisher_order_id} className="bg-white p-4 rounded shadow mb-4 space-y-2">
              <div className="font-semibold">Order ID: {order.publisher_order_id}</div>
              <ul className="list-disc ml-5 text-sm">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.title} — {item.quantity} pcs @ ৳{item.price_per_unit}
                  </li>
                ))}
              </ul>
              <div className="text-sm font-medium">Total: ৳{order.total_amount}</div>
              <div className="text-sm text-yellow-600">
                Status: {orderStatusMap[order.publisher_order_id] || 'pending'}
              </div>

              {orderStatusMap[order.publisher_order_id] === 'confirmed' && (
                <>
                  <input
                    type="text"
                    className="border rounded p-2 w-full"
                    placeholder="Transaction ID"
                    value={transactionInputs[order.publisher_order_id]?.transactionId || ''}
                    onChange={(e) =>
                      handleInputChange(order.publisher_order_id, 'transactionId', e.target.value)
                    }
                  />
                  <select
                    className="border rounded p-2 w-full"
                    value={transactionInputs[order.publisher_order_id]?.paymentMethod || ''}
                    onChange={(e) =>
                      handleInputChange(order.publisher_order_id, 'paymentMethod', e.target.value)
                    }
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Bkash">Bkash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                  </select>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleCancelOrder(order.publisher_order_id)}
                      className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePayment(order.publisher_order_id)}
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-500"
                    >
                      Pay
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* RIGHT: Buy Books */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-center">Buy Books</h2>

        <select
          className="border rounded p-2 w-full mb-4"
          value={selectedPublisher}
          onChange={(e) => setSelectedPublisher(e.target.value)}
        >
          <option value="">Select Publisher</option>
          {publishers.map(p => (
            <option key={p.publisher_id} value={p.publisher_id}>
              {p.publisher_name}
            </option>
          ))}
        </select>

        {books.map(book => (
          <div key={book.book_id} className="flex items-center gap-4 bg-white shadow p-4 rounded mb-3">
            <img src={book.cover_image_url} className="w-16 h-24 object-cover rounded" />
            <div className="flex-1">
              <div className="font-semibold">{book.title}</div>
              <div className="text-sm text-gray-500">৳{book.price}</div>
            </div>
            <div className="flex items-center border rounded">
              <button onClick={() => updateQuantity(book.book_id, -1)} className="px-3">–</button>
              <span className="px-4">{quantities[book.book_id] || 0}</span>
              <button onClick={() => updateQuantity(book.book_id, 1)} className="px-3">+</button>
            </div>
          </div>
        ))}

        {books.length > 0 && (
          <>
            <div className="text-right mt-4 space-y-1 text-sm">
              <div>Subtotal: ৳{subtotal.toFixed(2)}</div>
              <div>Discount (5%): -৳{discount.toFixed(2)}</div>
              <div className="text-lg font-semibold">Total: ৳{total.toFixed(2)}</div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 w-full"
            >
              Place Order
            </button>
          </>
        )}
      </div>
    </div>
  );
}

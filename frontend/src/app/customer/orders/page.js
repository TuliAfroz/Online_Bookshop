'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShoppingCart } from 'lucide-react';
import { getCustomerIdFromToken } from '../../utils/getCustomerId';

export default function OrdersPage() {
  const router = useRouter();
  const customerId = getCustomerIdFromToken();

  const [customerName, setCustomerName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  useEffect(() => {
    if (!customerId) return;
    fetch(`http://localhost:3000/api/customers/${customerId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && data.data) setCustomerName(data.data.customer_name);
      })
      .catch(console.error);
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    fetch(`http://localhost:3000/api/orders/customer/${customerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setError('Failed to load orders');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error loading orders');
        setLoading(false);
      });
  }, [customerId]);

  if (!customerId) return <p>Please log in to view your orders.</p>;

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="flex justify-end items-center gap-4 px-6 pt-4">
        <button
          onClick={() => router.push('/customer/cart')}
          className="text-gray-800 hover:text-blue-600 transition"
          aria-label="Go to cart"
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
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">My Orders</h1>

        {loading && <p>Loading orders...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && orders.length === 0 && <p>You have no orders yet.</p>}

        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.order_id} className="bg-white rounded-xl shadow-md p-6">
              <p className="font-semibold mb-2">Order ID: {order.order_id}</p>

              <div className="space-y-1">
                {order.books.map(book => (
                  <p key={book.book_id} className="flex items-center gap-2">
                    <span role="img" aria-label="book">📕</span>
                    <span>
                     {book.title} × {book.quantity} × ৳{book.price.toFixed(2)}
                    </span>
                  </p>
                ))}
              </div>

              <p className="mt-3 font-semibold">
                Total: ৳{order.total_price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

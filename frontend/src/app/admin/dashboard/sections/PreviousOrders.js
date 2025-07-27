'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PreviousOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/publisher-orders/admin/previous-orders');
        setOrders(response.data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-6">Loading orders...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (orders.length === 0) return <div className="p-6 text-gray-600">No previous orders found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-center">All Previous Orders</h2>

      {orders.map(order => (
        <div key={order.publisher_order_id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img
                src={order.publisher_img_url}
                alt={order.publisher_name}
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <h3 className="text-lg font-semibold">{order.publisher_name}</h3>
                <p className="text-sm text-gray-500">Order ID: {order.publisher_order_id}</p>
              </div>
            </div>
            <div className={`text-sm font-medium px-3 py-1 rounded-full ${order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {order.status.toUpperCase()}
            </div>
          </div>

          <ul className="text-sm space-y-1">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>📘 {item.title}</span>
                <span>
                  {item.quantity} × ৳{item.price_per_unit}
                </span>
              </li>
            ))}
          </ul>

          <div className="text-right font-semibold mt-3">
            Total: ৳{order.total_amount}
          </div>
        </div>
      ))}
    </div>
  );
}

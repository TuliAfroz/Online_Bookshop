'use client';

import { useEffect, useState } from 'react';
import { getPublisherIdFromToken } from '../../utils/getPublisherId';
import axios from 'axios';

export default function PreviousOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const publisherId = getPublisherIdFromToken();
      if (!publisherId) {
        setError('No publisher ID found.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/publisher-orders/previous/${publisherId}`);
        setOrders(response.data.orders || []);
      } catch (err) {
        console.error('Error fetching previous orders:', err);
        setError('Failed to load previous orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-6">Loading previous orders...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (orders.length === 0) return <div className="p-6 text-gray-600">No previous orders found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Previous Orders</h2>

      {orders.map(order => (
        <div key={order.publisher_order_id} className="bg-white shadow rounded p-4">
          <h3 className="font-bold mb-2">Order ID: {order.publisher_order_id}</h3>

          <ul className="text-sm mb-2 space-y-1">
            {order.items.map((item, idx) => (
              <li key={idx}>
                📕 {item.title} × {item.quantity} × ৳{item.price_per_unit}
              </li>
            ))}
          </ul>
          <div className="text-sm text-yellow-600">
                Status: {order.status }
              </div>
          <div className="font-semibold text-right mb-2">Total: ৳{order.total_amount}</div>
        </div>
      ))}
    </div>
  );
}

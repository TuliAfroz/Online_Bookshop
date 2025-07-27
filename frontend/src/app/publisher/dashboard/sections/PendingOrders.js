'use client';

import { useEffect, useState } from 'react';
import { getPublisherIdFromToken } from '../../utils/getPublisherId';

export default function PendingOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // order being processed

  useEffect(() => {
    const fetchPendingOrders = async () => {
      const publisherId = getPublisherIdFromToken();
      if (!publisherId) {
        setError('Unauthorized: No publisher ID found.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/publisher-orders/pending/${publisherId}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.message || 'Failed to fetch pending orders.');
          setLoading(false);
          return;
        }

        const data = await res.json();
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching pending orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    setProcessing(orderId);
    let url = '';
    let method = '';
  
    if (newStatus === 'confirmed') {
      url = `http://localhost:3000/api/publisher-orders/confirm/${orderId}`;
      method = 'PUT';
    } else if (newStatus === 'declined') {
      url = `http://localhost:3000/api/publisher-orders/cancel/${orderId}`;
      method = 'DELETE';
    } else {
      setError('Invalid order status');
      return;
    }
  
    try {
      const res = await fetch(url, { method });
  
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || `Failed to update order status to ${newStatus}.`);
        return;
      }
  
      // Remove order from UI
      setOrders(prev => prev.filter(order => order.publisher_order_id !== orderId));
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating order status.');
    } finally {
      setProcessing(null);
    }
  };
  

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (orders.length === 0) return <div className="p-6">No pending orders.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Orders</h2>
      {orders.map(order => (
        <div
          key={order.publisher_order_id}
          className="mb-6 border border-gray-300 rounded-xl p-4 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-800">
            Order ID: {order.publisher_order_id}
          </h3>
          <p className="text-gray-600 mb-2">
            Total Amount: <strong>{parseFloat(order.total_amount).toFixed(2)}৳</strong>
          </p>
          <div className="space-y-2 mb-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-t pt-2 text-gray-700"
              >
                <span>{item.title}</span>
                <span>Qty: {item.quantity}</span>
                <span>৳{parseFloat(item.price_per_unit).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => updateOrderStatus(order.publisher_order_id, 'confirmed')}
              disabled={processing === order.publisher_order_id}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 disabled:opacity-50"
            >
              ✅ Confirm
            </button>
            <button
              onClick={() => updateOrderStatus(order.publisher_order_id, 'declined')}
              disabled={processing === order.publisher_order_id}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 disabled:opacity-50"
            >
              ❌ Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

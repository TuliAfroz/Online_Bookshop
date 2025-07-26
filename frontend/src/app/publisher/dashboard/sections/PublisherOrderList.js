'use client';

import { useEffect, useState } from 'react';

export default function PublisherOrderList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/publisher');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">My Orders</h2>
      <table className="w-full border text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Order ID</th>
            <th className="p-2 border">Book</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_id}>
              <td className="p-2 border">{order.order_id}</td>
              <td className="p-2 border">{order.book_title}</td>
              <td className="p-2 border">{order.quantity}</td>
              <td className="p-2 border">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

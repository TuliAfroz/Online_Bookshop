'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { getCustomerIdFromToken } from '../../utils/getCustomerId';
import { Trash2 } from 'lucide-react';

export default function CustomerCartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const customerId = getCustomerIdFromToken();

  useEffect(() => {
    if (!customerId) return;
    fetch(`http://localhost:3000/api/cart/${customerId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.items) {
          setCartItems(data.items);
          setSubtotal(data.total_price);
        }
      })
      .catch(err => console.error('Failed to fetch cart:', err));
  }, []);

  const handleUpdateQuantity = async (bookId, type) => {
    try {
      const endpoint =
        type === 'remove'
          ? 'remove'
          : 'add';

      const payload =
        type === 'remove'
          ? { customer_id: customerId, book_id: bookId }
          : {
              customer_id: customerId,
              cart_items: [{ book_id: bookId, quantity: 1 }],
            };

      const res = await fetch(`http://localhost:3000/api/cart/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        // Re-fetch cart
        const refreshed = await fetch(`http://localhost:3000/api/cart/${customerId}`);
        const updated = await refreshed.json();
        setCartItems(updated.items);
        setSubtotal(updated.total_price);
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white-50">
      <Header />

      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.book_id}
                className="flex items-center gap-6 bg-white rounded-xl p-4 shadow"
              >
                {item.cover_image_url && (
                  <img
                    src={item.cover_image_url}
                    alt={item.title}
                    className="w-20 h-28 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-gray-600 mb-1">{item.author_name}</p>
                  <p className="text-red-500 text-sm">
                    Only {item.available_stock} copies available
                  </p>
                </div>

                {/* Quantity buttons */}
                <div className="flex items-center border rounded overflow-hidden">
                  <button
                    onClick={() => handleUpdateQuantity(item.book_id, 'remove')}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                  >
                    –
                  </button>
                  <span className="px-4 py-2 bg-white">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.book_id, 'add')}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>

                {/* Delete icon */}
                <button
                  onClick={() => handleUpdateQuantity(item.book_id, 'remove')}
                  className="text-gray-500 hover:text-red-600"
                >
                  <Trash2 />
                </button>
              </div>
            ))}

            {/* Subtotal */}
            <div className="text-right text-xl font-semibold pt-4">
              Subtotal: <span className="text-green-700">৳{subtotal.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

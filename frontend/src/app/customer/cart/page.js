'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { getCustomerIdFromToken } from '../../utils/getCustomerId';
import { Trash2 } from 'lucide-react';

export default function CustomerCartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [giftcards, setGiftcards] = useState([]);
  const [selectedGiftcard, setSelectedGiftcard] = useState('');
  const [usePoints, setUsePoints] = useState(false);
  const [giftcardDiscount, setGiftcardDiscount] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  const customerId = getCustomerIdFromToken();

  useEffect(() => {
    if (!customerId) return;

    fetch(`http://localhost:3000/api/giftcards/${customerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setGiftcards(data.giftcards);
      })
      .catch(err => console.error('Failed to fetch giftcards:', err));
  }, [customerId]);

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

  useEffect(() => {
    let gDiscount = 0;
    if (selectedGiftcard) {
      const selected = giftcards.find(g => g.giftcard_id === selectedGiftcard);
      if (selected) gDiscount = Math.min(subtotal, selected.balance);
    }
    setGiftcardDiscount(gDiscount);

    const pointsValue = usePoints ? Math.min(50, subtotal - gDiscount) : 0;
    setPointsDiscount(pointsValue);
  }, [selectedGiftcard, usePoints, giftcards, subtotal]);

  const totalPayable = Math.max(subtotal - giftcardDiscount - pointsDiscount, 0);

  const handlePlaceOrder = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          use_points: usePoints,
          giftcard_ids: selectedGiftcard ? [selectedGiftcard] : [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Order placed!');
        setOrderPlaced(true);
        setOrderId(data.order.order_id);
      } else {
        alert('❌ Order failed: ' + data.error);
      }
    } catch (err) {
      console.error('Order error:', err);
      alert('❌ Server error during order.');
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;

    try {
      const res = await fetch(`http://localhost:3000/api/orders/cancel/${orderId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        alert('🛑 Order cancelled.');
        setOrderPlaced(false);
        setOrderId(null);
        setTransactionId('');
        setPaymentMethod('');
      } else {
        alert('❌ Cancel failed: ' + data.error);
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('❌ Server error during cancellation.');
    }
  };

  const handlePayment = async () => {
    if (!transactionId || !paymentMethod) {
      alert('Please enter transaction ID and select a payment method.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/payment/make', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: transactionId,
          method: paymentMethod,
          payer_customer_id: customerId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Payment successful!');
        setCartItems([]);
        setSubtotal(0);
        setOrderPlaced(false);
        setOrderId(null);
        setTransactionId('');
        setPaymentMethod('');
      } else {
        alert('❌ Payment failed: ' + data.error);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('❌ Server error during payment.');
    }
  };

  const handleUpdateQuantity = async (bookId, type) => {
    try {
      const endpoint = type === 'remove' ? 'remove' : 'add';
      const payload =
        type === 'remove'
          ? { customer_id: customerId, book_id: bookId }
          : { customer_id: customerId, cart_items: [{ book_id: bookId, quantity: 1 }] };

      const res = await fetch(`http://localhost:3000/api/cart/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
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
                  <p className="text-sm font-bold text-blue-700 mb-1">
                    ৳{Number(item.per_item_price).toFixed(2)}
                  </p>
                  <p className="text-red-500 text-sm">
                    Only {item.available_stock} copies available
                  </p>
                </div>

                <button
                  onClick={() => handleUpdateQuantity(item.book_id, 'remove')}
                  className="text-gray-500 hover:text-red-600"
                >
                  <Trash2 />
                </button>

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

                <div className="text-sm font-bold text-black mr-4 whitespace-nowrap">
                  ৳{(item.quantity * item.per_item_price).toFixed(2)}
                </div>
              </div>
            ))}

            <div className="text-right text-xl font-semibold pt-4">
              Subtotal: <span className="text-green-700">৳{subtotal.toFixed(2)}</span>
            </div>

            <div className="text-right pt-6">
              <button
                onClick={handlePlaceOrder}
                className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600"
              >
                Place Order
              </button>
            </div>

            {orderPlaced && (
              <div className="mt-6 space-y-4 border-t pt-4">
                <div>
                  <label className="block mb-1 font-medium">Use Giftcard</label>
                  <select
                    className="p-2 border rounded w-full"
                    value={selectedGiftcard}
                    onChange={(e) => setSelectedGiftcard(e.target.value)}
                  >
                    <option value="">Select a Giftcard</option>
                    {giftcards.map(g => (
                      <option key={g.giftcard_id} value={g.giftcard_id}>
                        {g.code} (৳{g.balance})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Use Points</label>
                  <select
                    className="p-2 border rounded w-full"
                    value={usePoints ? 'true' : 'false'}
                    onChange={(e) => setUsePoints(e.target.value === 'true')}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Giftcard Discount:</span>
                    <span>-৳{giftcardDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Points Discount:</span>
                    <span>-৳{pointsDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total Payable:</span>
                    <span>৳{totalPayable.toFixed(2)}</span>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Transaction ID"
                  className="p-2 border rounded w-full"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  <option value="">Select Payment Method</option>
                  <option value="Bkash">Bkash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                </select>

                <div className="flex justify-between gap-4 pt-2">
                  <button
                    onClick={handleCancelOrder}
                    className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-500"
                  >
                    Cancel Order
                  </button>
                  <button
                    onClick={handlePayment}
                    className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600"
                  >
                    Make Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

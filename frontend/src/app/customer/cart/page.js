'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getCustomerIdFromToken } from '../../utils/getCustomerId';
import { User, ShoppingCart,Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerCartPage() {

  const router = useRouter();

  const [customerName, setCustomerName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [giftcards, setGiftcards] = useState([]);
  const [selectedGiftcards, setSelectedGiftcards] = useState([]);
  const [usePoints, setUsePoints] = useState(false);
  const [finalSubtotal, setFinalSubtotal] = useState(0);
  const [finalDiscount, setFinalDiscount] = useState(0);
  const [finalTotalPayable, setFinalTotalPayable] = useState(0);

  const customerId = getCustomerIdFromToken();
  

  // Fetch customer name for header
  useEffect(() => {
    const customerId = getCustomerIdFromToken();
    if (!customerId) return;

    fetch(`http://localhost:3000/api/customers/${customerId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && data.data) {
          setCustomerName(data.data.customer_name);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch giftcards
  useEffect(() => {
    if (!customerId) return;

    const fetchGiftcards = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/giftcards/customer/${customerId}`);
        console.log("Giftcards API response:", response.data);

        if (Array.isArray(response.data.giftcard)) {
          setGiftcards(response.data.giftcard);
        } else if (Array.isArray(response.data.giftcards)) {
          setGiftcards(response.data.giftcards);
        } else {
          setGiftcards([]);
        }
      } catch (error) {
        console.error('Error fetching giftcards:', error.response || error.message);
        setGiftcards([]);
      }
    };

    fetchGiftcards();
  }, [customerId]);

  // Fetch cart items
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
  }, [customerId]);

  // Place order
  const handlePlaceOrder = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          use_points: usePoints,
          giftcard_ids: selectedGiftcards, // array of giftcard IDs
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Order placed!');
        setOrderPlaced(true);
        setOrderId(data.order.order_id);

        // Fetch updated order details
        const orderDetailsRes = await fetch(`http://localhost:3000/api/orders/details/${data.order.order_id}`);
        const orderDetails = await orderDetailsRes.json();

        if (orderDetails.success) {
          setFinalSubtotal(orderDetails.order.subtotal_price);
          setFinalDiscount(orderDetails.order.discount);
          setFinalTotalPayable(orderDetails.order.total_price);
        } else {
          console.error('Failed to fetch order details:', orderDetails.error);
        }
      } else {
        alert('❌ Order failed: ' + data.error);
      }
    } catch (err) {
      console.error('Order error:', err);
      alert('❌ Server error during order.');
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };


  // Cancel order
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

  // Make payment
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
          order_id: orderId,
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

  // Update cart quantity
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
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="flex justify-end items-center gap-4 px-6 pt-4">
        <button
          onClick={() => router.push('/customer/cart')}
          className="text-gray-800 hover:text-blue-600 transition"
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
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

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

            {/* Giftcard and Points Selection */}
            <div className="mt-6 space-y-4 border-t pt-4">
              <div>
                <label className="block mb-1 font-medium">Use Giftcard(s)</label>
                {giftcards.length === 0 ? (
                  <p className="text-gray-500">No giftcards available</p>
                ) : (
                  <div className="space-y-2">
                    {giftcards.map((g) => (
                      <label key={g.card_id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={g.card_id}
                          checked={selectedGiftcards.includes(g.card_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGiftcards((prev) => [...prev, g.card_id]);
                            } else {
                              setSelectedGiftcards((prev) =>
                                prev.filter((id) => id !== g.card_id)
                              );
                            }
                          }}
                        />
                        <span>
                          {g.card_id} ({g.amount}% off)
                        </span>
                      </label>
                    ))}
                  </div>
                )}
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
                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>৳{finalSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Discount:</span>
                    <span>-৳{finalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total Payable:</span>
                    <span>৳{finalTotalPayable.toFixed(2)}</span>
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

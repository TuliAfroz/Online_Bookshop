'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function GiftCard() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cardId, setCardId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/customers');
        if (res.data.success) {
          setCustomers(res.data.data); // Assuming response structure is { success, data: [...] }
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomerId || !cardId || !amount) {
      setMessage('Please fill all fields');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/giftcards/add', {
        customer_id: selectedCustomerId,
        card_id: cardId,
        amount,
      });

      if (res.data.success) {
        setMessage('✅ Gift card assigned successfully!');
        setCardId('');
        setAmount('');
        setSelectedCustomerId('');
      } else {
        setMessage('❌ ' + res.data.error);
      }
    } catch (error) {
      console.error('Error assigning gift card:', error);
      setMessage('Something went wrong!');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Assign Gift Card</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Dropdown */}
        <div>
          <label className="block font-medium mb-1">Select Customer:</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">-- Select Customer --</option>
            {customers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </select>
        </div>

        {/* Card ID Input */}
        <div>
          <label className="block font-medium mb-1">Gift Card ID:</label>
          <input
            type="text"
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Amount Input */}
        <div>
          <label className="block font-medium mb-1">Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            min="0"
            required
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded"
          >
            Assign Gift Card
          </button>
        </div>
      </form>

      {message && (
        <p className="mt-4 text-center text-red-600 font-semibold">{message}</p>
      )}
    </div>
  );
}

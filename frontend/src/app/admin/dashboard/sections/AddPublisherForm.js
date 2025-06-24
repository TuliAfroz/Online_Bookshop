'use client';

import { useState } from 'react';

export default function AddPublisherForm() {
  const [form, setForm] = useState({
    Publisher_ID: '',
    Publisher_Name: '',
    Phone_No: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:3000/api/publishers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Publisher_ID: parseInt(form.Publisher_ID),
        Publisher_Name: form.Publisher_Name.trim(),
        Phone_No: form.Phone_No.trim() || null,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      setMessage('✅ Publisher added successfully');
      setForm({ Publisher_ID: '', Publisher_Name: '', Phone_No: '' });
    } else {
      setMessage(`❌ Error: ${result.error || 'Something went wrong'}`);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Add Publisher</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          name="Publisher_ID"
          placeholder="Publisher ID"
          value={form.Publisher_ID}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="Publisher_Name"
          placeholder="Publisher Name"
          value={form.Publisher_Name}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="Phone_No"
          placeholder="Phone Number (optional)"
          value={form.Phone_No}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Add Publisher
        </button>
      </form>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}

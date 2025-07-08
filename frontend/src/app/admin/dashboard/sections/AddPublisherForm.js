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
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto space-y-5 p-6 rounded-xl border border-gray-300"
      style={{ marginTop: '40px' }} // optional top margin
    >
      <h2 className="text-2xl font-semibold mb-4 text-center">Add Publisher</h2>

      <input
        type="number"
        name="Publisher_ID"
        placeholder="Publisher ID"
        value={form.Publisher_ID}
        onChange={handleChange}
        required
        className="border p-2 w-full rounded-xl"
      />
      <input
        type="text"
        name="Publisher_Name"
        placeholder="Publisher Name"
        value={form.Publisher_Name}
        onChange={handleChange}
        required
        className="border p-2 w-full rounded-xl"
      />
      <input
        type="text"
        name="Phone_No"
        placeholder="Phone Number (optional)"
        value={form.Phone_No}
        onChange={handleChange}
        className="border p-2 w-full rounded-xl"
      />
      <button
        type="submit"
        className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl w-full transition"
      >
        Add Publisher
      </button>

      {message && (
        <p
          className={`text-center text-sm mt-3 ${
            message.startsWith('✅') ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

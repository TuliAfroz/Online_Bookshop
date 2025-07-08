'use client';

import { useState } from 'react';

export default function AddCategoryForm() {
  const [form, setForm] = useState({
    Category_ID: '',
    Category_Name: '',
    Description: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Category_ID: parseInt(form.Category_ID),
        Category_Name: form.Category_Name.trim(),
        Description: form.Description.trim() || '',
      }),
    });

    const result = await response.json();
    if (response.ok) {
      setMessage('✅ Category added successfully');
      setForm({ Category_ID: '', Category_Name: '', Description: '' });
    } else {
      setMessage(`❌ Error: ${result.error || 'Something went wrong'}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 space-y-5 rounded-xl border border-gray-300"
      style={{ marginTop: '40px' }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-center">Add Category</h2>

      <input
        type="number"
        name="Category_ID"
        placeholder="Category ID"
        value={form.Category_ID}
        onChange={handleChange}
        required
        className="border p-2 w-full rounded-xl"
      />
      <input
        type="text"
        name="Category_Name"
        placeholder="Category Name"
        value={form.Category_Name}
        onChange={handleChange}
        required
        className="border p-2 w-full rounded-xl"
      />
      <textarea
        name="Description"
        placeholder="Description (optional)"
        value={form.Description}
        onChange={handleChange}
        className="border p-2 w-full rounded-xl"
        rows={4}
      />
      <button
        type="submit"
        className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl w-full transition"
      >
        Add Category
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

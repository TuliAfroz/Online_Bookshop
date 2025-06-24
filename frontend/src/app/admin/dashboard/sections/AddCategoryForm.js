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
    <div className="bg-white p-4 rounded-2xl shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Add Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          name="Category_ID"
          placeholder="Category ID"
          value={form.Category_ID}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="Category_Name"
          placeholder="Category Name"
          value={form.Category_Name}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />
        <textarea
          name="Description"
          placeholder="Description (optional)"
          value={form.Description}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Add Category
        </button>
      </form>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}

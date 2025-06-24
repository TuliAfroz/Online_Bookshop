'use client';

import { useState } from 'react';

export default function AddBookForm() {
  const [formData, setFormData] = useState({
    Book_ID: '',
    Copy_No: '',
    Title: '',
    Description: '',
    Cover_Image_URL: '',
    Author_ID: '',
    Publisher_ID: '',
    Category_ID: '',
    Price: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For Category_IDs, split by comma into array
    if (name === 'Category_ID') {
      setFormData({ ...formData, [name]: value.split(',').map(id => parseInt(id.trim())) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert fields to appropriate types
    const payload = {
      ...formData,
      Book_ID: parseInt(formData.Book_ID),
      Copy_No: parseInt(formData.Copy_No),
      Author_ID: parseInt(formData.Author_ID),
      Publisher_ID: parseInt(formData.Publisher_ID),
      Price: parseFloat(formData.Price),
    };

    try {
      const res = await fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Book added successfully!');
        setFormData({
          Book_ID: '',
          Copy_No: '',
          Title: '',
          Description: '',
          Cover_Image_URL: '',
          Author_ID: '',
          Publisher_ID: '',
          Category_ID: '',
          Price: '',
        });
      } else {
        setMessage(`❌ Error: ${data.error || 'Something went wrong'}`);
      }
    } catch (err) {
      setMessage('❌ Server error. Try again later.');
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-xl w-full">
      <h2 className="text-2xl font-bold mb-4">Add New Book</h2>
      {message && <p className="mb-2 text-sm text-red-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="Book_ID" type="number" placeholder="Book ID" value={formData.Book_ID} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="Copy_No" type="number" placeholder="Copy Number" value={formData.Copy_No} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="Title" type="text" placeholder="Title" value={formData.Title} onChange={handleChange} className="w-full p-2 border rounded" required />
        <textarea name="Description" placeholder="Description" value={formData.Description} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="Cover_Image_URL" type="url" placeholder="Cover Image URL" value={formData.Cover_Image_URL} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="Author_ID" type="number" placeholder="Author ID" value={formData.Author_ID} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="Publisher_ID" type="number" placeholder="Publisher ID" value={formData.Publisher_ID} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="Category_ID" type="text" placeholder="Category IDs (comma-separated)" value={formData.Category_ID} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="Price" type="number" step="0.01" placeholder="Price" value={formData.Price} onChange={handleChange} className="w-full p-2 border rounded" required />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">Add Book</button>
      </form>
    </div>
  );
}

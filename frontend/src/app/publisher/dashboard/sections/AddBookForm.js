'use client';

import { useState, useEffect } from 'react';
import { getPublisherIdFromToken } from '../../utils/getPublisherId';

export default function AddBookForm() {
  const [formData, setFormData] = useState({
    Book_ID: '',
    Title: '',
    Description: '',
    Cover_Image_URL: '',
    Author_Name: '',
    Price: '',
  });

  const [authors, setAuthors] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch authors on load
  useEffect(() => {
    async function fetchAuthors() {
      try {
        const res = await fetch('http://localhost:3000/api/authors');
        const data = await res.json();
        if (data.success) setAuthors(data.data);
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    }
    fetchAuthors();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Get publisher ID from token
    const publisherId = getPublisherIdFromToken();
    if (!publisherId) {
      setMessage('Publisher ID not found. Please login again.');
      return;
    }

    // Find Author_ID from selected Author_Name
    const selectedAuthor = authors.find(
      (author) => author.author_name === formData.Author_Name
    );

   if (!selectedAuthor) {
  // Redirect to Add Author page
  setMessage(`Author "${formData.Author_Name}" not found. Redirecting to Add Author page...`);
  setTimeout(() => {
    window.location.href = '/publisher/dashboard?tab=add-author';
  }, 2000);
  return;
}

    // Prepare payload with IDs and optional fields
    const payload = {
      Book_ID: formData.Book_ID,
      Title: formData.Title,
      Description: formData.Description || null,
      Cover_Image_URL: formData.Cover_Image_URL || null,
      Author_ID: selectedAuthor.author_id,
      Publisher_ID: publisherId,
      Price: formData.Price,
    };

    try {
      const res = await fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.redirect) {
        setMessage(data.message || 'Redirecting...');
        setTimeout(() => {
          window.location.href = data.redirect;
        }, 2000);
        return;
      }

      if (!res.ok) {
        setMessage(data.error || 'Failed to add book');
        return;
      }

      setMessage('✅ Book added successfully!');
      // Reset form
      setFormData({
        Book_ID: '',
        Title: '',
        Description: '',
        Cover_Image_URL: '',
        Author_Name: '',
        Price: '',
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Something went wrong.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-4"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Add New Book</h2>
      {message && <p className="text-sm text-red-600 text-center">{message}</p>}

      <input
        name="Book_ID"
        type="number"
        placeholder="ISBN"
        value={formData.Book_ID}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        name="Title"
        type="text"
        placeholder="Title"
        value={formData.Title}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        name="Description"
        placeholder="Description (optional)"
        value={formData.Description}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        name="Cover_Image_URL"
        type="url"
        placeholder="Cover Image URL (optional)"
        value={formData.Cover_Image_URL}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <label htmlFor="Author_Name" className="block font-semibold">
        Select Author
      </label>
      <input
        list="authors"
        name="Author_Name"
        placeholder="Type or select author name"
        value={formData.Author_Name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <datalist id="authors">
        {authors.map(author => (
          <option key={author.author_id} value={author.author_name} />
        ))}
      </datalist>

      <input
        name="Price"
        type="number"
        step="0.01"
        placeholder="Price"
        value={formData.Price}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <button
        type="submit"
        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
      >
        Add Book
      </button>
    </form>
  );
}

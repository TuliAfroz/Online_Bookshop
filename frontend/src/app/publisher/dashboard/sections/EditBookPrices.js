'use client';

import { useEffect, useState } from 'react';
import { getPublisherIdFromToken } from '../../utils/getPublisherId';

export default function EditBookPrice() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [publisherId, setPublisherId] = useState(null);

  useEffect(() => {
    const id = getPublisherIdFromToken();
    setPublisherId(id);
  }, []);

  useEffect(() => {
    if (!publisherId) return;

    const fetchBooks = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/books/publisher/${publisherId}`);
        const data = await res.json();
        setBooks(data.data || []);
      } catch {
        setError('Failed to fetch books');
      }
    };

    fetchBooks();
  }, [publisherId]);

  const handleSelectChange = (e) => {
    const bookId = e.target.value;
    setSelectedBookId(bookId);

    const selectedBook = books.find((b) => b.book_id === parseInt(bookId));
    if (selectedBook) {
      setCurrentPrice(selectedBook.price);
    } else {
      setCurrentPrice('');
    }

    setNewPrice('');
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !newPrice) {
      setError('Please select a book and enter a new price.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/books/inventory/${selectedBookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price: parseFloat(newPrice) }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage('Price updated successfully.');
        setError('');
        setCurrentPrice(parseFloat(newPrice));
        setNewPrice('');
      } else {
        setMessage('');
        setError(result.error || 'Failed to update price.');
      }
    } catch (err) {
      setMessage('');
      setError('Failed to update price.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-700">Edit Book Price</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={selectedBookId}
              onChange={handleSelectChange}
              className="w-full p-2 border border-gray-300 rounded-xl"
              required
            >
              <option value="">Select Book</option>
              {books.map((book) => (
                <option key={book.book_id} value={book.book_id}>
                  {book.title}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={currentPrice}
              disabled
              className="w-full p-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
              placeholder="Current Price"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="New Price"
              className="w-full p-2 border border-gray-300 rounded-xl"
              required
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

            <button
              type="submit"
              className="w-full bg-slate-700 text-white p-2 rounded-xl hover:bg-slate-600 transition"
            >
              Edit Price
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

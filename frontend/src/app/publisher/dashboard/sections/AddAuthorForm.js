'use client';

import { useState } from 'react';

export default function AddAuthorForm() {
  const [authorId, setAuthorId] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [totalBooks, setTotalBooks] = useState('');
  const [message, setMessage] = useState(null);
  const [authorImageUrl, setAuthorImageUrl] = useState('');



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authorId || !authorName) {
      setMessage({ type: 'error', text: 'Author ID and Name are required.' });
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Author_ID: parseInt(authorId),
          Author_Name: authorName,
          Total_Books: Number(totalBooks.trim()) || 0,
          Author_Image_URL: authorImageUrl.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Author added successfully.' });
        setAuthorId('');
        setAuthorName('');
        setTotalBooks('');
        setAuthorImageUrl('');

      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add author.' });
      }
    } catch (error) {
      console.error('Error adding author:', error);
      setMessage({ type: 'error', text: 'Server error. Please try again later.' });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto space-y-6 p-6 rounded-xl border border-gray-300"
      style={{ marginTop: '40px' }} // optional vertical spacing
    >
      <h2 className="text-2xl font-semibold mb-4 text-center">Add Author</h2>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Author ID</label>
        <input
          type="number"
          className="w-full p-2 border border-gray-300 rounded-xl"
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Author Name</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-xl"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-xl"
          value={authorImageUrl}
          onChange={(e) => setAuthorImageUrl(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Total Books (optional)</label>
        <input
          type="number"
          className="w-full p-2 border border-gray-300 rounded-xl"
          value={totalBooks}
          onChange={(e) => setTotalBooks(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="bg-slate-700 text-white w-full py-2 rounded-xl hover:bg-slate-600 transition"
      >
        Add Author
      </button>
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';

export default function ManageInventory() {
  const [books, setBooks] = useState([]);
  const [editingBookId, setEditingBookId] = useState(null);
  const [editedBook, setEditedBook] = useState({ price: '' });

  useEffect(() => {
    fetch('http://localhost:3000/api/books')
      .then((res) => res.json())
      .then((data) => setBooks(data.data || []))
      .catch((err) => console.error('Error fetching books:', err));
  }, []);

  const handleDelete = async (book_id) => {
    const confirmed = window.confirm('Are you sure you want to delete this book?');
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/api/books/${book_id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBooks(books.filter((b) => b.book_id !== book_id));
      } else {
        const errData = await res.json();
        alert('Error deleting book: ' + errData.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const startEditing = (book) => {
    setEditingBookId(book.book_id);
    setEditedBook({ price: book.price });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/books/inventory/${editingBookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedBook),
      });

      if (res.ok) {
        const updated = await res.json();
        setBooks(
          books.map((b) => (b.book_id === editingBookId ? { ...b, price: editedBook.price } : b))
        );
        setEditingBookId(null);
      } else {
        const err = await res.json();
        alert('Update failed: ' + err.error);
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Update failed due to a server error.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">Manage Inventory</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="py-2 px-4 text-left">Book ID</th>
              <th className="py-2 px-4 text-left">Title</th>
              <th className="py-2 px-4 text-left">Price</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.book_id} className="border-t">
                <td className="py-2 px-4">{book.book_id}</td>
                <td className="py-2 px-4">{book.title}</td>
                <td className="py-2 px-4">
                  {editingBookId === book.book_id ? (
                    <input
                      type="number"
                      value={editedBook.price}
                      onChange={(e) =>
                        setEditedBook({ ...editedBook, price: e.target.value })
                      }
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    book.price
                  )}
                </td>
                <td className="py-2 px-4 space-x-2">
                  {editingBookId === book.book_id ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBookId(null)}
                        className="bg-gray-400 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(book)}
                        className="bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-500 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book.book_id)}
                        className="bg-red-700 text-white px-2 py-1 rounded hover:bg-red-500 transition"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No books available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

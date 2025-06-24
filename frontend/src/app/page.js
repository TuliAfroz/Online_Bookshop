'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/books')  // Adjust endpoint if needed
      .then(res => res.json())
      .then(data => {
        setBooks(data.data);  // assuming { success: true, data: [...] }
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Books</h1>
      <ul className="space-y-2">
        {books.map(book => (
          <li key={`${book.book_id}-${book.copy_no}`} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{book.title}</h2>
            <p>{book.description}</p>
            <p className="text-sm text-gray-500">Price: ${book.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

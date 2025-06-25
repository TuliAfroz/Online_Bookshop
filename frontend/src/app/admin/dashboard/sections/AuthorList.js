'use client';

import { useEffect, useState } from 'react';

export default function AuthorList() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/authors')
      .then((res) => res.json())
      .then((data) => {
        setAuthors(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching authors:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🖊️ Author List</h2>
      {loading ? (
        <p>Loading authors...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="py-2 px-4 text-left">Author ID</th>
                <th className="py-2 px-4 text-left">Author Name</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={author.author_id} className="border-t">
                  <td className="py-2 px-4">{author.author_id}</td>
                  <td className="py-2 px-4">{author.author_name}</td>
                </tr>
              ))}
              {authors.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center py-4 text-gray-500">
                    No authors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

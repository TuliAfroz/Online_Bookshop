'use client';

import { useEffect, useState } from 'react';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/categories')
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Fetch failed: ${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
      });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">All Categories</h2>
      {categories.length === 0 ? (
        <p className="text-gray-500">No categories available.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {categories.map((cat) => (
            <li key={cat.category_id} className="py-3">
              <p className="text-lg font-medium">{cat.category_name}</p>
              {cat.description && (
                <p className="text-sm text-gray-600">{cat.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

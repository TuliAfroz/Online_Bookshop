'use client';

import { useEffect, useState } from 'react';

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/inventory')
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Fetch failed: ${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) setInventory(data.data);
      })
      .catch((err) => {
        console.error('Error fetching inventory:', err);
      });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">📦 Inventory List</h2>
      {inventory.length === 0 ? (
        <p className="text-gray-500">No inventory data available.</p>
      ) : (
        <table className="min-w-full table-auto border rounded-xl overflow-hidden shadow">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="px-4 py-2">Book ID</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Quantity</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {inventory.map((item) => (
              <tr key={item.book_id} className="border-t">
                <td className="px-4 py-2">{item.book_id}</td>
                <td className="px-4 py-2">{item.title}</td>
                <td className="px-4 py-2">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

export default function CustomerList({ onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/customers')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCustomers(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch customers:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading customers...</p>;
  if (customers.length === 0) return <p>No customers found.</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold mb-4 text-center">Customers</h2>
      {customers.map((cust) => (
        <div
          key={cust.customer_id}
          onClick={() => onSelectCustomer(cust)}
          className="p-4 border rounded-lg bg-white hover:bg-gray-100 cursor-pointer"
        >
          <p className="font-semibold">{cust.name}</p>
          <p className="text-sm text-gray-600">{cust.email}</p>
        </div>
      ))}
    </div>
  );
}

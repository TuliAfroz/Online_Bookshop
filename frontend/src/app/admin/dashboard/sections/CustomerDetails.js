'use client';

export default function CustomerDetails({ customer, onBack }) {
  return (
    <div className="p-4 border rounded-xl bg-white max-w-md mx-auto">
      <button
        onClick={onBack}
        className="mb-4 px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600"
      >
        &larr; Back
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center">Customer Details</h2>
      <p><strong>Name:</strong> {customer.name}</p>
      <p><strong>Email:</strong> {customer.email}</p>
      <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
      <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
      {/* Add more fields if available */}
    </div>
  );
}

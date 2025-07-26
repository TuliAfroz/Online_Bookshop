'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PublisherLoginPage() {
  const [publishers, setPublishers] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch publisher list on mount
  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/publishers');
        const data = await res.json();
        setPublishers(data.data || []);
      } catch (err) {
        console.error('Failed to load publishers', err);
      }
    };

    fetchPublishers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'publisher',
          publisher_id: selectedPublisher,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        localStorage.setItem('token', data.token);
        router.push('/publisher/dashboard');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-700">Publisher Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-xl"
              required
            >
              <option value="">Select Publisher</option>
              {publishers.map((publisher) => (
                <option key={publisher.publisher_id} value={publisher.publisher_id}>
                  {publisher.publisher_name}
                </option>
              ))}
            </select>

            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-slate-700 text-white p-2 rounded-xl hover:bg-slate-600 transition"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

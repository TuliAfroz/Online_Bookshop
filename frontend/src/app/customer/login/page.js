'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'customer',
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        localStorage.setItem('token', data.token);
        router.push('/customer/dashboard');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ⬇️ Use Header here */}
      <Header />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-teal-900">Customer Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border border-gray-300 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

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

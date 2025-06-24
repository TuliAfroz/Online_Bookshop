'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSignupPage() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Admin_ID: adminId,
          Password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
      } else {
        setSuccess('Admin created successfully!');
        setAdminId('');
        setPassword('');
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Signup</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Admin ID"
            className="w-full p-2 border border-gray-300 rounded-xl"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
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

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

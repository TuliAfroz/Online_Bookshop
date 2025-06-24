// src/app/page.js
'use client';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold mb-6">📚 Welcome to the Online Bookshop</h1>

      <div className="space-x-4">
        <button
          onClick={() => router.push('/admin/login')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Admin Login
        </button>
        <button
          onClick={() => router.push('/customer/login')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Customer Login
        </button>
        <button
          onClick={() => router.push('/customer/signup')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Customer Signup
        </button>
        <button
          onClick={() => router.push('/admin/signup')}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Admin Signup
        </button>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerSignup() {
  const [form, setForm] = useState({
    Customer_Name: '',
    Email: '',
    Password: '',
    Address: '',
    Phone_No: ''
  });

  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:3000/api/auth/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Signup successful! Redirecting...');
        setTimeout(() => {
          router.push('/customer/login');
        }, 1500);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Server error');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded shadow space-y-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Customer Signup</h1>

        <input
          type="text"
          name="Customer_Name"
          placeholder="Full Name"
          value={form.Customer_Name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="Email"
          placeholder="Email"
          value={form.Email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="Password"
          placeholder="Password"
          value={form.Password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="Address"
          placeholder="Address"
          value={form.Address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="Phone_No"
          placeholder="Phone Number"
          value={form.Phone_No}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-slate-700 text-white py-2 rounded hover:bg-slate-600 transition"
        >
          Sign Up
        </button>

        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}

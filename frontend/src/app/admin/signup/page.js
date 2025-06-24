"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminSignup() {
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3000/api/auth/admin/signup', {
        Admin_ID: adminId,
        Password: password,
      })
      toast.success('Admin signed up successfully!')
      router.push('/admin/login')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Signup failed')
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Admin Signup</h2>
        <input
          type="text"
          placeholder="Admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          required
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 mb-6 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  )
}

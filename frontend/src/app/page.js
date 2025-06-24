// // src/app/page.js

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-200 to-blue-200 text-center px-4">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">📚পড়ুয়ায় আপনাকে স্বাগতম!
      </h1>
      <p className="text-lg mb-8 text-gray-700">Please select your role to continue:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
        <Link href="/admin/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Admin Login
        </Link>
        <Link href="/admin/signup" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Admin Signup
        </Link>
        <Link href="/customer/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Customer Login
        </Link>
        <Link href="/customer/signup" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Customer Signup
        </Link>
      </div>
    </div>
  )
}

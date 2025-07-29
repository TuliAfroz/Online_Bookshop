'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShoppingCart } from 'lucide-react';
import { getCustomerIdFromToken } from '../../utils/getCustomerId';

export default function CustomerProfile() {
  const router = useRouter();


  const [customerName, setCustomerName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [profile, setProfile] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const customerId = getCustomerIdFromToken();

  useEffect(() => {
    const id = getCustomerIdFromToken();
    if (!id) return;
  
    fetch(`http://localhost:3000/api/customers/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && data.data) {
          setProfile(data.data);
          setCustomerName(data.data.customer_name);
        }
      })
      .catch(console.error);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleChangePassword = async () => {
    if (!newPassword) return;
    const res = await fetch(`http://localhost:3000/api/customers/${customerId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
        });


    const result = await res.json();
    if (result.success) {
      setMessage('Password updated!');
      setNewPassword('');
    } else {
      setMessage(result.error || 'Failed to update');
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="flex justify-end items-center gap-4 px-6 pt-4">
        <button
          onClick={() => router.push('/customer/cart')}
          className="text-gray-800 hover:text-blue-600 transition"
        >
          <ShoppingCart size={24} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-xl shadow hover:bg-gray-100 transition"
          >
            <User size={20} />
            <span className="font-medium">{customerName || 'User'}</span>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow z-10 text-sm">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/customer/dashboard');
                }}
              >
                Home
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/customer/profile');
                }}
              >
                My Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/customer/reviews');
                }}
              >
                Reviews
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/customer/orders');
                }}
              >
                Orders
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl p-6 mt-6 space-y-4">
        <h2 className="text-xl font-bold mb-2">My Profile</h2>
        <p><strong>Name:</strong> {profile.customer_name}</p>
        <p><strong>Points:</strong> {profile.point_count ?? 0}</p>
        <p><strong>Level:</strong> {profile.level ?? 'N/A'}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone_no}</p>
        <p><strong>Address:</strong> {profile.address}</p>

        <hr />

        <div>
          <h3 className="font-semibold">Change Password</h3>
          <input
            type="password"
            className="border rounded px-3 py-2 w-full mt-2"
            value={newPassword}
            placeholder="Enter new password"
            onChange={e => setNewPassword(e.target.value)}
          />
          <button
            onClick={handleChangePassword}
            className="mt-2 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
          >
            Update Password
          </button>
          {message && <p className="mt-2 text-green-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}

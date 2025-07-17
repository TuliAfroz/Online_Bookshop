'use client';

import { useEffect, useState } from 'react';
import { getCustomerIdFromToken } from '../../utils/getCustomerId';

export default function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const customerId = getCustomerIdFromToken();

  useEffect(() => {
    if (!customerId) return;
    fetch(`http://localhost:3000/api/customers/${customerId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success) setProfile(data.data);
      });
  }, []);

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
      
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl p-6 mt-6 space-y-4">
        <h2 className="text-xl font-bold mb-2">My Profile</h2>
        <p><strong>Name:</strong> {profile.customer_name}</p>
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

'use client';

import { useEffect, useState } from 'react';
import { getPublisherIdFromToken } from '../../utils/getPublisherId';

export default function PublisherProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const publisherId = getPublisherIdFromToken();
      if (!publisherId) {
        setError('Unauthorized: No publisher ID found.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/publishers/${publisherId}/profile`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to fetch profile.');
          setLoading(false);
          return;
        }

        setProfile(data.data);
      } catch (err) {
        setError('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    // <div className="min-h-screen bg-white-50 flex justify-center pt-8 p-6">
      <div className="bg-gray rounded-xl shadow-lg p-6 flex flex-col md:flex-row max-w-4xl w-full">
        {profile.publisher_img_url && (
          <div className="md:w-1/3 flex justify-center mb-4 md:mb-0">
            <img
              src={profile.publisher_img_url}
              alt={`${profile.publisher_name} Logo`}
              className="w-48 h-48 object-contain rounded-md shadow-sm"
            />
          </div>
        )}

        <div className="md:w-2/3 space-y-4 pl-0 md:pl-6 text-gray-700">
          <h2 className="text-3xl font-bold text-slate-700 mb-4">My Profile</h2>

          <div>
            <span className="font-semibold">Name: </span>
            <span>{profile.publisher_name}</span>
          </div>

          <div>
            <span className="font-semibold">Publisher ID: </span>
            <span>{profile.publisher_id}</span>
          </div>

          <div>
            <span className="font-semibold">Phone Number: </span>
            <span>{profile.phone_no || '-'}</span>
          </div>

          <div>
            <span className="font-semibold">Balance: </span>
            <span>{profile.balance != null ? profile.balance.toFixed(2) : '0.00'}৳ </span>
          </div>

          
        </div>
      </div>
    // </div>
  );
}

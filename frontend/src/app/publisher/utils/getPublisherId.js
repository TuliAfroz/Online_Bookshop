// utils/getPublisherId.js
'use client';

export const getPublisherIdFromToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.id || null; // Correct field
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  }
  return null;
};
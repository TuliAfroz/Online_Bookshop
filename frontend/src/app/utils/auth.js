// utils/auth.js or utils/token.js
export function getAdminIdFromToken() {
    if (typeof window === 'undefined') return null;
  
    const token = sessionStorage.getItem('token');
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // decode JWT
      if (payload.role !== 'admin') return null; // make sure it's an admin token
      return payload?.id || null;
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  }
  
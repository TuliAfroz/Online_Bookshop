export function getCustomerIdFromToken() {
    if (typeof window === 'undefined') return null;
  
    const token = sessionStorage.getItem('token');
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.id || null;
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  }
  
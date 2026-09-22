const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)
        ? `http://${window.location.hostname}:5000`
        : '');

export default API_BASE_URL;

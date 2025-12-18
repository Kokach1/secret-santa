const API_URL = (import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://secret-santa-cek.onrender.com')).trim().replace(/\/+$/, '');
console.log("🔌 API URL Configured as:", API_URL); // DEBUG LOG

export default API_URL;

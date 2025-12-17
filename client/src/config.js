const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
console.log("🔌 API URL Configured as:", API_URL); // DEBUG LOG

export default API_URL;

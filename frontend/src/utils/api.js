import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://electronic-rental-booking-system-1.onrender.com/api',
  headers: {
    'Bypass-Tunnel-Reminder': 'true'
  }
});

export default api;

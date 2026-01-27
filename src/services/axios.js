import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

/* =========================
   ATTACH JWT TOKEN
========================= */
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // 🔑 where you store JWT

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default instance;

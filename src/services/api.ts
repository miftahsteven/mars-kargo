import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cargo.marscargo.net/api.php';
const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN || 'KODE_RAHASIA_DASHBOARD_123';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: API_AUTH_TOKEN,
  },
  timeout: 10000,
});

// Interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('marscargo_token') || API_AUTH_TOKEN;
    if (token && config.headers) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('marscargo_token');
      localStorage.removeItem('marscargo_user');
    }
    return Promise.reject(error);
  }
);

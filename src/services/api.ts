import axios from 'axios';
import { secureStorage } from '../utils/secureStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cargo.marscargo.net/api.php';
const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN || 'KODE_RAHASIA_DASHBOARD_123';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: API_AUTH_TOKEN,
  },
  timeout: 30000,
  transformResponse: [
    (data) => {
      if (typeof data === 'string') {
        const jsonStartIndex = data.indexOf('{');
        if (jsonStartIndex !== -1) {
          try {
            return JSON.parse(data.substring(jsonStartIndex));
          } catch (e) {
            console.warn('Failed to parse sanitized response:', e);
          }
        }
      }
      return data;
    },
  ],
});

// Interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    let token = secureStorage.getItem<string>('marscargo_token');
    if (!token || typeof token !== 'string' || token.includes('[object') || token.trim().length < 5) {
      token = API_AUTH_TOKEN;
    }
    if (config.headers) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling & PHP warning HTML sanitization
apiClient.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string') {
      const jsonStartIndex = response.data.indexOf('{');
      if (jsonStartIndex !== -1) {
        try {
          response.data = JSON.parse(response.data.substring(jsonStartIndex));
        } catch (e) {
          console.warn('Failed to parse sanitized JSON response:', e);
        }
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      secureStorage.removeItem('marscargo_token');
      secureStorage.removeItem('marscargo_user');
      secureStorage.removeItem('marscargo_raw_user_data');
    }
    return Promise.reject(error);
  }
);


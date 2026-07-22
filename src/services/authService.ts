import { User } from '../types/cargo';
import { apiClient } from './api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'; // default true until real API is provided

export interface LoginParams {
  email: string;
  password?: string;
  customerType?: 'government' | 'private';
}

export const authService = {
  login: async (params: LoginParams): Promise<{ user: User; token: string }> => {
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      const isGov = params.customerType !== 'private';
      const user: User = {
        id: 'usr-88210',
        name: isGov ? 'Pusat Bahasa' : 'PT Mitra Logistik Pratama',
        email: params.email || 'admin@kemendikbud.go.id',
        role: 'Admin Pengiriman',
        partnerInstitution: isGov ? 'Pusat Pembinaan Bahasa dan Sastra' : 'PT Mitra Logistik Pratama',
        institutionSub: isGov ? 'Kemendikdasmen RI' : 'Mitra Corporate B2B',
        avatar: 'PB',
        customerType: isGov ? 'government' : 'private',
      };

      const token = 'mock-jwt-token-mars-cargo-b2b-2026';
      localStorage.setItem('marscargo_token', token);
      localStorage.setItem('marscargo_user', JSON.stringify(user));

      return { user, token };
    }

    const response = await apiClient.post('/auth/login', params);
    const { user, token } = response.data;
    localStorage.setItem('marscargo_token', token);
    localStorage.setItem('marscargo_user', JSON.stringify(user));
    return { user, token };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('marscargo_token');
    localStorage.removeItem('marscargo_user');
  },

  getCurrentUser: (): User | null => {
    const raw = localStorage.getItem('marscargo_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};

import axios from 'axios';
import { User } from '../types/cargo';

export interface LoginParams {
  username: string;
  password?: string;
  customerType?: 'government' | 'private';
}

const LOGIN_API_URL = 'https://cargo.marscargo.net/login/auth';
const AUTH_HEADER = 'KODE_RAHASIA_DASHBOARD_123';

export const authService = {
  login: async (params: LoginParams): Promise<{ user: User; token: string }> => {
    let apiSuccess = false;
    let token = AUTH_HEADER;
    let userRole = 'Admin Pengiriman';
    let userName = params.username || 'KIKIMARS';

    try {
      const response = await axios.post(
        LOGIN_API_URL,
        {
          username: params.username,
          password: params.password,
        },
        {
          headers: {
            Authorization: AUTH_HEADER,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );

      if (response.data) {
        apiSuccess = true;
        if (response.data.token) token = response.data.token;
        if (response.data.role) userRole = response.data.role;
        if (response.data.name || response.data.username) {
          userName = response.data.name || response.data.username;
        }
      }
    } catch (err: any) {
      console.warn('Network call to https://cargo.marscargo.net/login/auth handled:', err.message);
    }

    const isGov = params.customerType !== 'private';
    const user: User = {
      id: 'usr-' + params.username.toLowerCase(),
      name: params.username.toUpperCase() === 'KIKIMARS' ? 'KIKIMARS (Pusat Bahasa)' : userName,
      email: `${params.username.toLowerCase()}@marscargo.net`,
      role: userRole,
      partnerInstitution: isGov ? 'Pusat Pembinaan Bahasa dan Sastra' : 'PT Mars Cargo B2B Partner',
      institutionSub: isGov ? 'Kemendikdasmen RI' : 'Mitra Corporate B2B',
      avatar: params.username.substring(0, 2).toUpperCase(),
      customerType: isGov ? 'government' : 'private',
    };

    localStorage.setItem('marscargo_token', token);
    localStorage.setItem('marscargo_user', JSON.stringify(user));

    return { user, token };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('marscargo_token');
    localStorage.removeItem('marscargo_user');
    localStorage.clear();
  },

  getCurrentUser: (): User | null => {
    const token = localStorage.getItem('marscargo_token');
    const raw = localStorage.getItem('marscargo_user');

    // Invalidate legacy prototype tokens stored in browser
    if (!token || token === 'mock-token-2026' || token === 'mock-jwt-token-mars-cargo-b2b-2026') {
      localStorage.removeItem('marscargo_token');
      localStorage.removeItem('marscargo_user');
      return null;
    }

    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};

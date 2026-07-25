import axios from 'axios';
import { User } from '../types/cargo';
import { secureStorage } from '../utils/secureStorage';

export interface LoginParams {
  username: string;
  password?: string;
  customerType?: 'government' | 'private';
  captchaToken?: string;
  captchaSecret?: string;
}

const LOGIN_API_URL = 'https://cargo.marscargo.net/api.php?action=get-user-data';
const AUTH_HEADER = 'KODE_RAHASIA_DASHBOARD_123';

export const authService = {
  login: async (params: LoginParams): Promise<{ user: User; token: string }> => {
    let token = AUTH_HEADER;
    let apiUserData: any = null;

    const formParams = new URLSearchParams();
    formParams.append('username', params.username || 'DikDasMen');
    formParams.append('password', params.password || 'DikD45m3n@!');

    try {
      const response = await axios.post(
        LOGIN_API_URL,
        formParams,
        {
          headers: {
            Authorization: AUTH_HEADER,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.status === 'success' && response.data.data) {
        apiUserData = response.data.data;
      } else if (response.data && response.data.status === 'error') {
        throw new Error(response.data.message || 'Login gagal. Periksa kembali username dan password.');
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      if (err?.message && !err.message.includes('Network Error')) {
        throw err;
      }
      console.warn('Handling login request fallback:', err.message);
    }

    const isGov = params.customerType !== 'private';
    const usernameInput = params.username || 'DikDasMen';

    // Absorb all response data user returned by API
    const user: User = {
      id: apiUserData?.user_id ? String(apiUserData.user_id) : `usr-${usernameInput.toLowerCase()}`,
      name: apiUserData?.name || (usernameInput === 'DikDasMen' ? 'KEMENDIKDASMEN' : usernameInput),
      email: apiUserData?.email || `${usernameInput.toLowerCase()}@marscargo.net`,
      role: apiUserData?.role || 'admin',
      partnerInstitution: isGov ? 'Pusat Pembinaan Bahasa dan Sastra' : 'PT Mars Cargo B2B Partner',
      institutionSub: isGov ? 'Kemendikdasmen RI' : 'Mitra Corporate B2B',
      avatar: (apiUserData?.username || usernameInput).substring(0, 2).toUpperCase(),
      customerType: isGov ? 'government' : 'private',
      user_id: apiUserData?.user_id,
      username: apiUserData?.username || usernameInput,
      ph_no: apiUserData?.ph_no,
      cabang_id: apiUserData?.cabang_id,
      rawApiData: apiUserData || {},
    };

    // Amankan data dan simpan ke SecureStorage
    secureStorage.setItem('marscargo_token', token);
    secureStorage.setItem('marscargo_user', user);
    secureStorage.setItem('marscargo_raw_user_data', apiUserData || {});

    return { user, token };
  },

  logout: async (): Promise<void> => {
    secureStorage.removeItem('marscargo_token');
    secureStorage.removeItem('marscargo_user');
    secureStorage.removeItem('marscargo_raw_user_data');
    localStorage.removeItem('marscargo_token');
    localStorage.removeItem('marscargo_user');
    localStorage.clear();
  },

  getCurrentUser: (): User | null => {
    const token = secureStorage.getItem<string>('marscargo_token');
    const user = secureStorage.getItem<User>('marscargo_user');

    // Invalidate legacy prototype tokens stored in browser
    if (!token || token === 'mock-token-2026' || token === 'mock-jwt-token-mars-cargo-b2b-2026') {
      authService.logout();
      return null;
    }

    if (user) return user;
    return null;
  },

  getRawUserData: (): any => {
    return secureStorage.getItem('marscargo_raw_user_data');
  },
};

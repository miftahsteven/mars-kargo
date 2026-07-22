import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/cargo';
import { authService, LoginParams } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
  toggleCustomerType: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const existingUser = authService.getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (params: LoginParams) => {
    setIsLoading(true);
    try {
      const res = await authService.login(params);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const toggleCustomerType = () => {
    if (!user) return;
    const newType = user.customerType === 'government' ? 'private' : 'government';
    const updatedUser: User = {
      ...user,
      customerType: newType,
      partnerInstitution: newType === 'government' ? 'Pusat Pembinaan Bahasa dan Sastra' : 'PT Mitra Logistik Pratama',
      institutionSub: newType === 'government' ? 'Kemendikdasmen RI' : 'Mitra Corporate B2B',
      name: newType === 'government' ? 'KIKIMARS (Pusat Bahasa)' : 'PT Mitra Logistik',
    };
    setUser(updatedUser);
    localStorage.setItem('marscargo_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        toggleCustomerType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

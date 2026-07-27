import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SchoolSettings } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  schoolSettings: SchoolSettings | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  registerSchool: (data: { schoolName: string; email: string; phone?: string; address?: string; principalName?: string; otp: string }) => Promise<void>;
  logout: () => void;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const settings = await api.getSettings();
      setSchoolSettings(settings);
    } catch (e) {
      console.error("Failed to load school settings:", e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await fetchSettings();
      const token = localStorage.getItem('sms_token');
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data.user);
        } catch (e) {
          localStorage.removeItem('sms_token');
          // Default to demo admin if token expired
          await demoLogin('admin');
        }
      } else {
        // Auto demo login as admin for seamless immediate preview experience
        await demoLogin('admin');
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string) => {
    const data = await api.login(email);
    localStorage.setItem('sms_token', data.token);
    setUser(data.user);
  };

  const demoLogin = async (role: UserRole) => {
    try {
      const data = await api.demoLogin(role);
      localStorage.setItem('sms_token', data.token);
      setUser(data.user);
    } catch (e) {
      console.error(`Demo login failed for ${role}:`, e);
    }
  };

  const registerSchool = async (data: { schoolName: string; email: string; phone?: string; address?: string; principalName?: string; otp: string }) => {
    const result = await api.registerSchool(data);
    localStorage.setItem('sms_token', result.token);
    setUser(result.user);
    setSchoolSettings(result.schoolSettings);
  };

  const logout = () => {
    localStorage.removeItem('sms_token');
    setUser(null);
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'admin',
        schoolSettings,
        isLoading,
        login,
        demoLogin,
        registerSchool,
        logout,
        refreshSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

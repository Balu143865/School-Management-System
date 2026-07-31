import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SchoolSettings } from '../types';
import { api } from '../lib/api';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  FirebaseUser,
  updateProfile
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole;
  schoolSettings: SchoolSettings | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  registerSchool: (data: { schoolName: string; email: string; phone?: string; address?: string; principalName?: string; otp: string }) => Promise<void>;
  logout: () => void;
  refreshSettings: () => Promise<void>;
  // Real-time Firebase Auth methods
  signInWithFirebaseEmail: (email: string, pass: string) => Promise<void>;
  signUpWithFirebaseEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  signInWithGoogleFirebase: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const settings = await api.getSettings();
      setSchoolSettings(settings);
    } catch {
      setSchoolSettings({
        name: "BN International Academy",
        code: "BNIA-2026",
        tagline: "Excellence in Education & Character Building",
        address: "Macherla, Palnadu, AP - 522426",
        phone: "+91 63040 45279",
        email: "contact@bnacademy.edu",
        academicYear: "2025-2026",
        logo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=200&q=80",
        principalName: "Dr. Balu Naik, B. Tech",
        isOtpVerified: true
      });
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
          await demoLogin('admin');
        }
      } else {
        await demoLogin('admin');
      }
      setIsLoading(false);
    };

    initAuth();

    // Firebase Real-time Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        try {
          const data = await api.login(fbUser.email);
          localStorage.setItem('sms_token', data.token);
          setUser(data.user);
        } catch (err) {
          // If backend user not found, synthesize logged in profile
          const customUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            role: 'admin', // default real-time authenticated admin
            phone: fbUser.phoneNumber || '+91 63040 45279'
          };
          setUser(customUser);
        }
      }
    });

    return () => unsubscribe();
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

  const logout = async () => {
    localStorage.removeItem('sms_token');
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Firebase signout error:', e);
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  // Real-time Firebase Auth Handlers
  const signInWithFirebaseEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    setFirebaseUser(res.user);
  };

  const signUpWithFirebaseEmail = async (email: string, pass: string, name: string, assignedRole: UserRole = 'admin') => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
    }
    setFirebaseUser(res.user);
    setUser({
      id: res.user.uid,
      name,
      email,
      role: assignedRole,
      phone: '+91 63040 45279'
    });
  };

  const signInWithGoogleFirebase = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    setFirebaseUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        role: user?.role || 'admin',
        schoolSettings,
        isLoading,
        login,
        demoLogin,
        registerSchool,
        logout,
        refreshSettings,
        signInWithFirebaseEmail,
        signUpWithFirebaseEmail,
        signInWithGoogleFirebase
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


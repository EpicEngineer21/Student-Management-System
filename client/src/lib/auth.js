'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await api.auth.me();
      setUser(res.data);
      if (pathname === '/login' || pathname === '/') {
        redirectBasedOnRole(res.data.role);
      }
    } catch (error) {
      setUser(null);
      if (pathname !== '/login') {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    setUser(res.data);
    redirectBasedOnRole(res.data.role);
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const redirectBasedOnRole = (role) => {
    if (role === 'ADMIN') router.push('/admin');
    else if (role === 'TEACHER') router.push('/teacher');
    else if (role === 'STUDENT') router.push('/student');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

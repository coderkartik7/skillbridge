import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { login as apiLogin, signup as apiSignup, registerUnauthorizedHandler } from '../api/client';

const SESSION_STORAGE_KEY = 'sb_session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { token, email } or null
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState('login'); // 'login' | 'signup'
  const afterLoginCallbackRef = useRef(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Load existing session on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.email) {
          setUser(parsed);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  // Listen for 401 unauthorized from axios interceptor
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      showToast({
        type: 'error',
        message: 'Session expired, please log in again',
      });
      setIsAuthModalOpen(true);
      setAuthModalDefaultTab('login');
    });
  }, []);

  const openAuthModal = useCallback((callback = null, defaultTab = 'login') => {
    afterLoginCallbackRef.current = callback;
    setAuthModalDefaultTab(defaultTab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    afterLoginCallbackRef.current = null;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await apiLogin({ email, password });
    const session = { token: data.token, email: data.email };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    setIsAuthModalOpen(false);

    if (typeof afterLoginCallbackRef.current === 'function') {
      const cb = afterLoginCallbackRef.current;
      afterLoginCallbackRef.current = null;
      cb(session);
    }
    return session;
  }, []);

  const signup = useCallback(async ({ email, password }) => {
    const data = await apiSignup({ email, password });
    const session = { token: data.token, email: data.email };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    setIsAuthModalOpen(false);

    if (typeof afterLoginCallbackRef.current === 'function') {
      const cb = afterLoginCallbackRef.current;
      afterLoginCallbackRef.current = null;
      cb(session);
    }
    return session;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    afterLoginCallbackRef.current = null;
  }, []);

  const showToast = useCallback(({ type = 'success', message }) => {
    setToastMessage({ id: Date.now(), type, message });
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user?.token,
    login,
    signup,
    logout,
    openAuthModal,
    closeAuthModal,
    isAuthModalOpen,
    authModalDefaultTab,
    toastMessage,
    showToast,
    clearToast,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

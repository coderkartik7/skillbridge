import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protector wrapper.
 * If user is not authenticated, redirects to "/" and triggers the login modal.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Open auth modal immediately after redirect
    setTimeout(() => {
      openAuthModal();
    }, 50);
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

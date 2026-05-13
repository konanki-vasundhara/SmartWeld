import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import useAuthStore from '../store/useAuthStore';

export default function MainLayout() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const initializeAuth = useAuthStore(state => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-surface-container-lowest">
      <div className="flex-grow flex flex-col">
        <Outlet />
      </div>
      <BottomNavBar />
    </div>
  );
}


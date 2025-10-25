// Protected route component for authenticated routes
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  // Use separate selectors to minimize re-renders
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  
  const location = useLocation();
  const isOnboardingRoute = location.pathname === '/google-onboarding';

  // If authentication is still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
          <p className="text-lg font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs to complete onboarding
  // Don't redirect if we're already on the onboarding route
  if (requireOnboarding && 
      user && 
      user.onboardingCompleted === false && 
      !isOnboardingRoute && 
      location.pathname !== '/onboarding') {
    return <Navigate to="/google-onboarding" replace />;
  }

  // If authenticated and passed all checks, render children
  return children;
};

export default ProtectedRoute;
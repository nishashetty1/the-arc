// src/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ErrorBoundary } from 'react-error-boundary';
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EmailOnboardingPage from "./pages/EmailOnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import OnboardingPage from "./pages/OnboardingPage";
import GoogleOnboardingPage from "./pages/GoogleOnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import PitchVideoPage from "./pages/PitchVideoPage";
import MessagesPage from "./pages/MessagesPage";
import BrowsePage from "./pages/BrowsePage";
import SwipePage from "./pages/SwipePage";
import ConnectionsPage from "./pages/ConnectionsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import useAuthStore from "./stores/authStore";

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-700 mb-4">An error occurred in the application:</p>
        <div className="bg-gray-100 p-4 rounded-md mb-4 overflow-auto">
          <pre className="text-sm text-gray-800">{error.message}</pre>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

const App = () => {
  // Initialize Firebase auth listener
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const authInitialized = useAuthStore((state) => state.authInitialized);
  
  useEffect(() => {
    // Only initialize if not already done
    if (!authInitialized) {
      // Set up the auth listener and store the unsubscribe function
      const unsubscribe = initializeAuth();
      
      // Clean up the listener when the component unmounts
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [initializeAuth, authInitialized]);
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/email-onboarding" element={<EmailOnboardingPage />} />
          <Route 
            path="/dashboard" 
            element={
              <React.Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                </div>
              }>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                </ErrorBoundary>
              </React.Suspense>
            }
          />
          <Route 
            path="/onboarding" 
            element={
              <React.Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                </div>
              }>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                </ErrorBoundary>
              </React.Suspense>
            }
          />
          <Route 
            path="/google-onboarding" 
            element={
              <React.Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                </div>
              }>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ProtectedRoute>
                    <GoogleOnboardingPage />
                  </ProtectedRoute>
                </ErrorBoundary>
              </React.Suspense>
            }
          />
          <Route 
            path="/profile" 
            element={
              <React.Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                </div>
              }>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                </ErrorBoundary>
              </React.Suspense>
            }
          />
          <Route 
            path="/profile/:userId" 
            element={
              <React.Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                </div>
              }>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ProtectedRoute>
                    <PublicProfilePage />
                  </ProtectedRoute>
                </ErrorBoundary>
              </React.Suspense>
            }
          />
          <Route 
            path="/pitch-videos" 
            element={
              <React.Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                </div>
              }>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ProtectedRoute>
                    <PitchVideoPage />
                  </ProtectedRoute>
                </ErrorBoundary>
              </React.Suspense>
            }
          />
          <Route 
            path="/connections" 
            element={
              <React.Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                </div>
              }>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ProtectedRoute>
                    <ConnectionsPage />
                  </ProtectedRoute>
                </ErrorBoundary>
              </React.Suspense>
            }
          />
          <Route 
            path="/messages" 
            element={
              <React.Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                </div>
              }>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                </ErrorBoundary>
              </React.Suspense>
            }
          />
          <Route 
            path="/browse" 
            element={
              <React.Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                </div>
              }>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ProtectedRoute>
                    <BrowsePage />
                  </ProtectedRoute>
                </ErrorBoundary>
              </React.Suspense>
            }
          />
          <Route 
            path="/swipe" 
            element={
              <React.Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                </div>
              }>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ProtectedRoute>
                    <SwipePage />
                  </ProtectedRoute>
                </ErrorBoundary>
              </React.Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;

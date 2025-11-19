// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from './components/layout/AppLayout';

// Import your pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import AllRequestsPage from './pages/AllRequestPage';
import AllTransactionsPage from './pages/AllTransactionsPage';
import NotFoundPage from './pages/NotFoundPage';
import { EngineeringPage } from './pages/EngineeringPage';

/**
 * App Component
 * 
 * Main application router with:
 * - Public routes (login, signup)
 * - Protected routes (dashboard, transactions, etc.)
 * - Error boundary for crash handling
 * - 404 catch-all route
 * 
 * Production-ready with comprehensive error handling.
 */
function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        {/* These routes are accessible to everyone */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/engineering" element={<EngineeringPage />} />

        {/* Protected Routes */}
        {/* These routes are wrapped in the ProtectedRoute component to ensure authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            {/* Additional protected routes */}
            <Route path="/users/:username" element={<UserProfilePage />} />
            <Route path="/requests" element={<AllRequestsPage />} />
            <Route path="/transactions" element={<AllTransactionsPage />} />
          </Route>
        </Route>

        {/* 404 Catch-all Route */}
        {/* This should be last - matches any route not defined above */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;

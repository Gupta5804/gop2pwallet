// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from './components/layout/AppLayout';
// Import your pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import UserProfilePage from './pages/UserProfilePage';




function App() {
  return (
    <>
    <Routes>
      {/* Public Routes */}
      {/* These routes are accessible to everyone */}
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/signup" element={<SignupPage/>}/>

    {/* Protected Routes */}
    {/* These routes are wrapped in the ProtectedRoute component to ensure authentication */}
    <Route element={<ProtectedRoute/>}>
      <Route element={<AppLayout />}>
        <Route index  element={<DashboardPage/>}/>
        {/* We will add more protected routes here later, e.g.: */}
        {/* <Route path="/send" element={<SendMoneyPage />} /> */}
        {/* <Route path="/history" element={<HistoryPage />} /> */}
        {/* <Route path="/users/:username" element={<UserProfilePage />} /> */}
        <Route path="/users/:username" element={<UserProfilePage />} />
        </Route>
      </Route>
    </Routes>
    <Toaster/>
    </>
  )
}

export default App;
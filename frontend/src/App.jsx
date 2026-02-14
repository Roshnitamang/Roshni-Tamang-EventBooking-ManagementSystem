import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Checkout from './pages/Checkout'
import Navbar from './components/Navbar'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import EventDetails from './pages/EventDetails'
import MyBookings from './pages/MyBookings'
import ManageBookings from './pages/ManageBookings'
import OrganizerDashboard from './pages/OrganizerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import AttendeeDashboard from './pages/AttendeeDashboard'
import RequestOrganizer from './pages/RequestOrganizer'
import Profile from './pages/Profile'
import Help from './pages/Help'

const App = () => {
  const { theme } = useTheme()

  return (
    <div className={`${theme} min-h-screen`}>
      <div className="bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
        <Navbar />
        <ToastContainer theme={theme} />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/all-events" element={<Home />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/help" element={<Help />} />

            <Route path="/email-verify" element={<EmailVerify />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/my-bookings" element={
              <ProtectedRoute allowedRoles={['user', 'organizer', 'admin', 'super-admin']}>
                <MyBookings />
              </ProtectedRoute>
            } />

            <Route path="/manage-bookings" element={
              <ProtectedRoute allowedRoles={['organizer', 'super-admin']}>
                <ManageBookings />
              </ProtectedRoute>
            } />

            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/super-admin-dashboard" element={
              <ProtectedRoute allowedRoles={['super-admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/organizer-dashboard" element={
              <ProtectedRoute allowedRoles={['organizer', 'super-admin']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['user', 'super-admin']}>
                <AttendeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/request-organizer" element={
              <ProtectedRoute allowedRoles={['user', 'super-admin']}>
                <RequestOrganizer />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['user', 'organizer', 'admin', 'super-admin']}>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
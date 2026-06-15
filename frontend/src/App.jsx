import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import VendorOnboarding from './pages/VendorOnboarding'
import DocumentManagement from './pages/DocumentManagement'
import ComplianceReport from './pages/ComplianceReport'
import ChatBot from './pages/ChatBot'
import Profile from './pages/Profile'
import AdminVendors from './pages/AdminVendors'

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="onboarding" element={<VendorOnboarding />} />
            <Route path="documents" element={<DocumentManagement />} />
            <Route path="compliance" element={<ComplianceReport />} />
            <Route path="chat" element={<ChatBot />} />
            <Route path="profile" element={<Profile />} />
            <Route path="vendors" element={
              <ProtectedRoute adminOnly>
                <AdminVendors />
              </ProtectedRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:!bg-slate-800 dark:!text-white',
          }}
        />
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App

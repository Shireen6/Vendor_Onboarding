import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const res = await authAPI.verifyToken()
          setUser(res.data.user)
        } catch {
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials)
      const { user: userData, token } = res.data
      setUser(userData)
      localStorage.setItem('token', token)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  }

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData)
      const { user: newUser, token } = res.data
      setUser(newUser)
      localStorage.setItem('token', token)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

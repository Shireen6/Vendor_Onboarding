import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
}

// Vendor APIs
export const vendorAPI = {
  getVendors: () => api.get('/vendors'),
  getVendor: (id) => api.get(`/vendors/${id}`),
  createVendor: (vendorData) => api.post('/vendors', vendorData),
  updateVendor: (id, vendorData) => api.put(`/vendors/${id}`, vendorData),
  deleteVendor: (id) => api.delete(`/vendors/${id}`),
  getVendorStats: () => api.get('/vendors/stats'),
}

// Document APIs
export const documentAPI = {
  uploadDocument: (formData) => api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getDocuments: (vendorId) => api.get(`/documents/vendor/${vendorId}`),
  updateDocumentStatus: (id, status) => api.put(`/documents/${id}/status`, { status }),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  analyzeDocument: (id) => api.post(`/documents/${id}/analyze`),
}

// Compliance APIs
export const complianceAPI = {
  getComplianceReport: (vendorId) => api.get(`/compliance/vendor/${vendorId}`),
  generateComplianceReport: (vendorId) => api.post(`/compliance/generate/${vendorId}`),
  updateComplianceScore: (vendorId, score) => api.put(`/compliance/score/${vendorId}`, { score }),
}

// Risk APIs
export const riskAPI = {
  getRiskAssessment: (vendorId) => api.get(`/risk/vendor/${vendorId}`),
  calculateRiskScore: (vendorId) => api.post(`/risk/calculate/${vendorId}`),
  updateRiskLevel: (vendorId, level) => api.put(`/risk/level/${vendorId}`, { level }),
}

// Chat APIs
export const chatAPI = {
  sendMessage: (message) => api.post('/chat/message', { message }),
  getChatHistory: () => api.get('/chat/history'),
  clearChatHistory: () => api.delete('/chat/history'),
}

// Email APIs
export const emailAPI = {
  generateEmail: (vendorId, missingDocs) => api.post('/email/generate', { vendorId, missingDocs }),
  sendEmail: (emailData) => api.post('/email/send', emailData),
}

export default api

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyToken: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout')
}

export const vendorAPI = {
  getDashboardStats: () => api.get('/vendors/dashboard/stats'),
  getMyVendor: () => api.get('/vendors/me'),
  saveVendor: (data) => api.post('/vendors/me', data),
  runAssessment: () => api.post('/vendors/me/assess'),
  getAllVendors: () => api.get('/vendors'),
  getVendorById: (id) => api.get(`/vendors/${id}`),
  updateStatus: (id, data) => api.patch(`/vendors/${id}/status`, data)
}

export const documentAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyDocuments: () => api.get('/documents/me'),
  analyze: (id) => api.post(`/documents/${id}/analyze`),
  updateStatus: (id, data) => api.patch(`/documents/${id}/status`, data),
  delete: (id) => api.delete(`/documents/${id}`)
}

export const complianceAPI = {
  getMyCompliance: () => api.get('/compliance/me'),
  runCompliance: () => api.post('/compliance/me/run'),
  getHistory: () => api.get('/compliance/me/history')
}

export const riskAPI = {
  getMyRisk: () => api.get('/risk/me'),
  runRisk: () => api.post('/risk/me/run')
}

export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: (sessionId) => api.get('/chat/history', { params: { sessionId } })
}

export const emailAPI = {
  generate: () => api.post('/email/generate'),
  generateForVendor: (vendorId) => api.post(`/email/generate/${vendorId}`)
}

export default api

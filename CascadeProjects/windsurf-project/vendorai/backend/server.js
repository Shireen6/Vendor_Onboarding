const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

// Import routes
const authRoutes = require('./src/routes/auth')
const vendorRoutes = require('./src/routes/vendors')
const documentRoutes = require('./src/routes/documents')
const complianceRoutes = require('./src/routes/compliance')
const riskRoutes = require('./src/routes/risk')
const chatRoutes = require('./src/routes/chat')
const emailRoutes = require('./src/routes/email')

// Initialize Express app
const app = express()

// Security middleware
app.use(helmet())

// Compression middleware
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files
app.use('/uploads', express.static('uploads'))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendorai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB')
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error)
  process.exit(1)
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/compliance', complianceRoutes)
app.use('/api/risk', riskRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/email', emailRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Error:', error)
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => err.message)
    })
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    })
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    })
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}/api`)
})

module.exports = app

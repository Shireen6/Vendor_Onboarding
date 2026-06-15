const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const authRoutes = require('./src/routes/auth')
const vendorRoutes = require('./src/routes/vendors')
const documentRoutes = require('./src/routes/documents')
const complianceRoutes = require('./src/routes/compliance')
const riskRoutes = require('./src/routes/risk')
const chatRoutes = require('./src/routes/chat')
const emailRoutes = require('./src/routes/email')

const app = express()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(compression())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static(uploadsDir))

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendorai')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })

app.use('/api/auth', authRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/compliance', complianceRoutes)
app.use('/api/risk', riskRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/email', emailRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error('Error:', err.message)

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    })
  }

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate field value entered' })
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message })
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app

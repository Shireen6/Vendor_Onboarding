const express = require('express')
const { body } = require('express-validator')
const {
  register,
  login,
  getMe,
  updateProfile,
  verifyToken,
  logout
} = require('../controllers/authController')
const { protect, loginLimiter, registerLimiter } = require('../middleware/auth')

const router = express.Router()

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['vendor', 'admin'])
    .withMessage('Role must be either vendor or admin'),
  
  body('companyName')
    .if(body('role').equals('vendor'))
    .trim()
    .notEmpty()
    .withMessage('Company name is required for vendors')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters')
]

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters')
]

// Routes
router.post('/register', registerLimiter, registerValidation, register)
router.post('/login', loginLimiter, loginValidation, login)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfileValidation, updateProfile)
router.get('/verify', protect, verifyToken)
router.post('/logout', protect, logout)

module.exports = router

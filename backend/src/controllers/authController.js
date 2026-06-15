const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../models/User')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' })

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() })
    }

    const { name, email, password, role, companyName } = req.body

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'vendor',
      companyName: role === 'admin' ? undefined : companyName
    })

    const token = generateToken(user._id)
    await user.updateLastLogin()

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName },
        token
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, message: 'Server error during registration' })
  }
}

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() })
    }

    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' })
    }

    const token = generateToken(user._id)
    await user.updateLastLogin()

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName },
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Server error during login' })
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json({
      success: true,
      data: {
        user: {
          id: user._id, name: user.name, email: user.email, role: user.role,
          companyName: user.companyName, phone: user.phone, lastLogin: user.lastLogin
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

exports.verifyToken = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id, name: req.user.name, email: req.user.email,
        role: req.user.role, companyName: req.user.companyName
      }
    }
  })
}

exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logout successful' })
}

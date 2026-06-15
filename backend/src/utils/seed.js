require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendorai')
    console.log('Connected to MongoDB for seeding')

    const users = [
      { name: 'Admin User', email: 'admin@vendorai.com', password: 'admin123', role: 'admin' },
      { name: 'Demo Vendor', email: 'vendor@vendorai.com', password: 'vendor123', role: 'vendor', companyName: 'Demo Corp' }
    ]

    for (const userData of users) {
      const exists = await User.findOne({ email: userData.email })
      if (!exists) {
        await User.create(userData)
        console.log(`Created user: ${userData.email}`)
      } else {
        console.log(`User already exists: ${userData.email}`)
      }
    }

    console.log('Seeding complete')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seedUsers()

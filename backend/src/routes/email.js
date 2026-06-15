const express = require('express')
const { generateEmail } = require('../controllers/emailController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.post('/generate', generateEmail)
router.post('/generate/:vendorId', authorize('admin'), generateEmail)

module.exports = router

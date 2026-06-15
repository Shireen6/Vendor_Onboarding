const express = require('express')
const {
  getMyCompliance,
  getVendorCompliance,
  runCompliance,
  getComplianceHistory
} = require('../controllers/complianceController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.get('/me', getMyCompliance)
router.get('/me/history', getComplianceHistory)
router.post('/me/run', runCompliance)
router.get('/vendor/:vendorId', authorize('admin'), getVendorCompliance)
router.post('/vendor/:vendorId/run', authorize('admin'), runCompliance)

module.exports = router

const express = require('express')
const {
  getDashboardStats,
  createOrUpdateVendor,
  getMyVendor,
  getAllVendors,
  getVendorById,
  updateVendorStatus,
  runFullAssessment
} = require('../controllers/vendorController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.get('/dashboard/stats', authorize('admin'), getDashboardStats)
router.get('/me', getMyVendor)
router.post('/me', createOrUpdateVendor)
router.put('/me', createOrUpdateVendor)
router.post('/me/assess', runFullAssessment)

router.get('/', authorize('admin'), getAllVendors)
router.get('/:id', authorize('admin'), getVendorById)
router.patch('/:id/status', authorize('admin'), updateVendorStatus)
router.post('/:id/assess', authorize('admin'), runFullAssessment)

module.exports = router

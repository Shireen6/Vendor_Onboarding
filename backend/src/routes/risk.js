const express = require('express')
const { getMyRisk, runRisk } = require('../controllers/riskController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.get('/me', getMyRisk)
router.post('/me/run', runRisk)
router.post('/vendor/:vendorId/run', authorize('admin'), runRisk)

module.exports = router

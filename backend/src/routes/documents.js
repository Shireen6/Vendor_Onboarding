const express = require('express')
const {
  uploadDocument,
  getMyDocuments,
  getVendorDocuments,
  updateDocumentStatus,
  analyzeDocument,
  deleteDocument
} = require('../controllers/documentController')
const upload = require('../middleware/upload')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.post('/upload', upload.single('file'), uploadDocument)
router.get('/me', getMyDocuments)
router.get('/vendor/:vendorId', authorize('admin'), getVendorDocuments)
router.post('/:id/analyze', analyzeDocument)
router.patch('/:id/status', authorize('admin'), updateDocumentStatus)
router.delete('/:id', deleteDocument)

module.exports = router

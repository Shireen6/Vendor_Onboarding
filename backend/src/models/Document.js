const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  documentType: {
    type: String,
    enum: ['gst_certificate', 'pan_card', 'bank_proof', 'address_proof', 'registration_certificate'],
    required: true
  },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['uploaded', 'missing', 'under_review', 'approved', 'rejected'],
    default: 'uploaded'
  },
  extractedData: {
    companyName: String,
    gstNumber: String,
    panNumber: String,
    address: String,
    bankInformation: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      branchName: String
    },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    extractedAt: Date,
    rawText: String
  },
  rejectionReason: String,
  reviewedAt: Date
}, { timestamps: true })

documentSchema.index({ vendor: 1, documentType: 1 })

module.exports = mongoose.model('Document', documentSchema)

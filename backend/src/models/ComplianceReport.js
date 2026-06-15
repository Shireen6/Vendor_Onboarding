const mongoose = require('mongoose')

const complianceReportSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  complianceScore: { type: Number, min: 0, max: 100, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'completed' },
  complianceStatus: {
    type: String,
    enum: ['compliant', 'partially_compliant', 'non_compliant'],
    required: true
  },
  missingDocuments: [String],
  missingFields: [String],
  invalidFields: [String],
  validationFailures: [String],
  documentSummary: [{
    documentType: String,
    label: String,
    status: String,
    isUploaded: Boolean
  }],
  recommendations: [String],
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

complianceReportSchema.index({ vendor: 1, createdAt: -1 })

module.exports = mongoose.model('ComplianceReport', complianceReportSchema)

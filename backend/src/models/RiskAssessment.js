const mongoose = require('mongoose')

const riskAssessmentSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  riskScore: { type: Number, min: 0, max: 100, required: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  deductions: [{
    reason: String,
    points: Number,
    category: { type: String, enum: ['document', 'information', 'validation'] }
  }],
  factors: [String],
  recommendations: [String],
  assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

riskAssessmentSchema.index({ vendor: 1, createdAt: -1 })

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema)

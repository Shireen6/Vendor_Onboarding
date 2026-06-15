const mongoose = require('mongoose')

const vendorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  vendorName: { type: String, required: true, trim: true },
  companyName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  gstNumber: { type: String, required: true, trim: true, uppercase: true },
  panNumber: { type: String, required: true, trim: true, uppercase: true },
  onboardingStatus: {
    type: String,
    enum: ['pending', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  timeline: [{
    stage: String,
    label: String,
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
    completedAt: Date,
    notes: String
  }],
  submittedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  notes: String
}, { timestamps: true })

vendorSchema.index({ onboardingStatus: 1 })
vendorSchema.index({ user: 1 })

module.exports = mongoose.model('Vendor', vendorSchema)

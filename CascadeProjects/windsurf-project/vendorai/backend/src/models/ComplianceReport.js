const mongoose = require('mongoose')

const complianceReportSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  reportType: {
    type: String,
    enum: ['initial', 'periodic', 'renewal', 'ad_hoc'],
    default: 'initial'
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  complianceStatus: {
    type: String,
    enum: ['compliant', 'non_compliant', 'partially_compliant'],
    required: true
  },
  documentCompliance: {
    requiredDocuments: [{
      documentType: String,
      isRequired: {
        type: Boolean,
        default: true
      },
      isUploaded: {
        type: Boolean,
        default: false
      },
      isApproved: {
        type: Boolean,
        default: false
      },
      uploadedAt: Date,
      reviewedAt: Date,
      rejectionReason: String
    }],
    missingDocuments: [String],
    rejectedDocuments: [String],
    pendingDocuments: [String],
    approvedDocuments: [String],
    documentScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  informationCompliance: {
    fields: [{
      fieldName: String,
      isProvided: {
        type: Boolean,
        default: false
      },
      isValid: {
        type: Boolean,
        default: false
      },
      value: String,
      expectedFormat: String,
      validationMessage: String
    }],
    missingFields: [String],
    invalidFields: [String],
    validFields: [String],
    informationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  validationChecks: [{
    checkName: String,
    description: String,
    status: {
      type: String,
      enum: ['passed', 'failed', 'skipped'],
      default: 'skipped'
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    errorMessage: String,
    checkedAt: {
      type: Date,
      default: Date.now
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  riskFactors: [{
    factor: String,
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    description: String,
    impact: Number,
    recommendation: String
  }],
  recommendations: [{
    type: String,
    enum: ['upload_document', 'update_information', 'verify_details', 'contact_support', 'resubmit_document'],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    description: String,
    actionRequired: String,
    deadline: Date,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  nextSteps: [{
    step: String,
    description: String,
    responsible: String,
    deadline: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    completedAt: Date
  }],
  timeline: [{
    stage: String,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending'
    },
    startedAt: Date,
    completedAt: Date,
    duration: Number, // in minutes
    notes: String
  }],
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for compliance percentage
complianceReportSchema.virtual('compliancePercentage').get(function() {
  return this.overallScore
})

// Virtual for grade
complianceReportSchema.virtual('grade').get(function() {
  const score = this.overallScore
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
})

// Virtual for days until expiry
complianceReportSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null
  const today = new Date()
  const expiryDate = new Date(this.expiryDate)
  const diffTime = expiryDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for is expired
complianceReportSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false
  return new Date() > new Date(this.expiryDate)
})

// Indexes for better performance
complianceReportSchema.index({ vendor: 1 })
complianceReportSchema.index({ status: 1 })
complianceReportSchema.index({ complianceStatus: 1 })
complianceReportSchema.index({ overallScore: 1 })
complianceReportSchema.index({ generatedAt: 1 })
complianceReportSchema.index({ expiryDate: 1 })
complianceReportSchema.index({ isArchived: 1 })

// Compound indexes
complianceReportSchema.index({ vendor: 1, status: 1 })
complianceReportSchema.index({ vendor: 1, complianceStatus: 1 })
complianceReportSchema.index({ vendor: 1, generatedAt: -1 })

module.exports = mongoose.model('ComplianceReport', complianceReportSchema)

const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  documentType: {
    type: String,
    enum: [
      'gst_certificate',
      'pan_card',
      'bank_proof',
      'address_proof',
      'registration_certificate',
      'moa_aoa',
      'partnership_deed',
      'llp_agreement',
      'din_pan_directors',
      'board_resolution',
      'cancelled_cheque',
      'others'
    ],
    required: [true, 'Document type is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be at least 1 byte']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'under_review', 'approved', 'rejected', 'missing'],
    default: 'uploaded'
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
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  extractedData: {
    extractedAt: {
      type: Date,
      default: null
    },
    extractedBy: {
      type: String,
      default: 'ai'
    },
    data: {
      companyName: String,
      gstNumber: String,
      panNumber: String,
      address: String,
      bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        branchName: String
      },
      directors: [{
        name: String,
        pan: String,
        din: String
      }],
      registrationDate: Date,
      validityPeriod: {
        from: Date,
        to: Date
      },
      documentNumber: String,
      issuedBy: String,
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    extractionError: {
      type: String,
      default: null
    }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },
  verificationDetails: {
    verifiedAt: {
      type: Date,
      default: null
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    discrepancies: [{
      field: String,
      expected: String,
      actual: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    fileName: String,
    filePath: String,
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for file size in human readable format
documentSchema.virtual('fileSizeReadable').get(function() {
  const bytes = this.fileSize
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
})

// Virtual for download URL
documentSchema.virtual('downloadUrl').get(function() {
  return `/api/documents/download/${this._id}`
})

// Indexes for better performance
documentSchema.index({ vendor: 1 })
documentSchema.index({ documentType: 1 })
documentSchema.index({ status: 1 })
documentSchema.index({ uploadedBy: 1 })
documentSchema.index({ uploadedAt: 1 })
documentSchema.index({ isActive: 1 })
documentSchema.index({ 'extractedData.confidence': 1 })

// Compound indexes
documentSchema.index({ vendor: 1, documentType: 1 })
documentSchema.index({ vendor: 1, status: 1 })

module.exports = mongoose.model('Document', documentSchema)

const mongoose = require('mongoose')

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  legalName: {
    type: String,
    trim: true,
    maxlength: [100, 'Legal name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      maxlength: [20, 'ZIP code cannot exceed 20 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters']
    }
  },
  gstNumber: {
    type: String,
    required: [true, 'GST number is required'],
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
  },
  panNumber: {
    type: String,
    required: [true, 'PAN number is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  bankDetails: {
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
      maxlength: [100, 'Bank name cannot exceed 100 characters']
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
      maxlength: [50, 'Account number cannot exceed 50 characters']
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      required: [true, 'Account type is required']
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
    },
    branchName: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [100, 'Branch name cannot exceed 100 characters']
    }
  },
  businessType: {
    type: String,
    enum: ['proprietorship', 'partnership', 'llp', 'private_limited', 'public_limited', 'others'],
    required: [true, 'Business type is required']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    maxlength: [50, 'Industry cannot exceed 50 characters']
  },
  annualRevenue: {
    type: Number,
    min: [0, 'Annual revenue cannot be negative']
  },
  employeeCount: {
    type: Number,
    min: [1, 'Employee count must be at least 1']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  onboardingStatus: {
    type: String,
    enum: ['pending', 'submitted', 'under_review', 'approved', 'rejected', 'on_hold'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for documents
vendorSchema.virtual('documents', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'vendor'
})

// Virtual for compliance reports
vendorSchema.virtual('complianceReports', {
  ref: 'ComplianceReport',
  localField: '_id',
  foreignField: 'vendor'
})

// Virtual for risk assessments
vendorSchema.virtual('riskAssessments', {
  ref: 'RiskAssessment',
  localField: '_id',
  foreignField: 'vendor'
})

// Indexes for better performance
vendorSchema.index({ user: 1 })
vendorSchema.index({ email: 1 })
vendorSchema.index({ gstNumber: 1 })
vendorSchema.index({ panNumber: 1 })
vendorSchema.index({ onboardingStatus: 1 })
vendorSchema.index({ submittedAt: 1 })
vendorSchema.index({ isActive: 1 })

module.exports = mongoose.model('Vendor', vendorSchema)

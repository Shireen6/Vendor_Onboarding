const mongoose = require('mongoose')

const riskAssessmentSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  overallRiskScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  assessmentType: {
    type: String,
    enum: ['initial', 'periodic', 'event_based', 'renewal'],
    default: 'initial'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'under_review'],
    default: 'pending'
  },
  riskCategories: [{
    category: {
      type: String,
      enum: ['financial', 'operational', 'compliance', 'reputational', 'strategic', 'cyber_security'],
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    weight: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.2
    },
    factors: [{
      factor: String,
      description: String,
      score: {
        type: Number,
        min: 0,
        max: 100,
        required: true
      },
      weight: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      evidence: [String],
      mitigation: String,
      impact: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      likelihood: {
        type: String,
        enum: ['rare', 'unlikely', 'possible', 'likely', 'certain'],
        default: 'possible'
      }
    }],
    assessment: String,
    recommendations: [String]
  }],
  riskFactors: [{
    factor: String,
    description: String,
    category: {
      type: String,
      enum: ['financial', 'operational', 'compliance', 'reputational', 'strategic', 'cyber_security']
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    likelihood: {
      type: String,
      enum: ['rare', 'unlikely', 'possible', 'likely', 'certain'],
      required: true
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    isMitigated: {
      type: Boolean,
      default: false
    },
    mitigationStrategy: String,
    mitigationStatus: {
      type: String,
      enum: ['none', 'planned', 'in_progress', 'completed'],
      default: 'none'
    },
    mitigationCost: {
      type: Number,
      min: 0,
      default: 0
    },
    owner: String,
    deadline: Date,
    lastReviewed: Date
  }],
  mitigationStrategies: [{
    riskFactor: String,
    strategy: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'cancelled'],
      default: 'planned'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    completedDate: Date,
    effectiveness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    cost: {
      type: Number,
      min: 0,
      default: 0
    },
    notes: String
  }],
  historicalData: [{
    assessmentDate: Date,
    riskScore: Number,
    riskLevel: String,
    significantChanges: [String],
    assessor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  keyRiskIndicators: [{
    indicator: String,
    description: String,
    currentValue: Number,
    threshold: Number,
    unit: String,
    trend: {
      type: String,
      enum: ['improving', 'stable', 'deteriorating'],
      default: 'stable'
    },
    lastUpdated: Date,
    alertLevel: {
      type: String,
      enum: ['green', 'yellow', 'amber', 'red'],
      default: 'green'
    }
  }],
  complianceIntegration: {
    complianceScore: Number,
    complianceGrade: String,
    criticalComplianceIssues: [String],
    complianceTrend: {
      type: String,
      enum: ['improving', 'stable', 'deteriorating'],
      default: 'stable'
    }
  },
  documentRiskAnalysis: {
    missingDocumentsRisk: {
      score: Number,
      impact: String,
      description: String
    },
    documentQualityRisk: {
      score: Number,
      impact: String,
      description: String
    },
    verificationRisk: {
      score: Number,
      impact: String,
      description: String
    }
  },
  riskAcceptance: {
    isAccepted: {
      type: Boolean,
      default: false
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acceptedAt: Date,
    justification: String,
    reviewDate: Date
  },
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalatedAt: Date,
    escalationReason: String,
    response: String,
    resolvedAt: Date
  },
  nextAssessmentDate: Date,
  reviewFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'semi_annually', 'annually'],
    default: 'quarterly'
  },
  assessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: Date,
  isActive: {
    type: Boolean,
    default: true
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

// Virtual for risk trend
riskAssessmentSchema.virtual('riskTrend').get(function() {
  if (!this.historicalData || this.historicalData.length < 2) return 'stable'
  
  const recent = this.historicalData.slice(-2)
  const previousScore = recent[0].riskScore
  const currentScore = recent[1].riskScore
  
  if (currentScore > previousScore + 5) return 'deteriorating'
  if (currentScore < previousScore - 5) return 'improving'
  return 'stable'
})

// Virtual for high risk factors count
riskAssessmentSchema.virtual('highRiskFactorsCount').get(function() {
  return this.riskFactors.filter(factor => 
    factor.impact === 'high' || factor.impact === 'critical'
  ).length
})

// Virtual for mitigation progress
riskAssessmentSchema.virtual('mitigationProgress').get(function() {
  if (!this.mitigationStrategies.length) return 0
  
  const completed = this.mitigationStrategies.filter(strategy => 
    strategy.status === 'completed'
  ).length
  
  return Math.round((completed / this.mitigationStrategies.length) * 100)
})

// Virtual for days until next assessment
riskAssessmentSchema.virtual('daysUntilNextAssessment').get(function() {
  if (!this.nextAssessmentDate) return null
  const today = new Date()
  const nextDate = new Date(this.nextAssessmentDate)
  const diffTime = nextDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Indexes for better performance
riskAssessmentSchema.index({ vendor: 1 })
riskAssessmentSchema.index({ riskLevel: 1 })
riskAssessmentSchema.index({ overallRiskScore: 1 })
riskAssessmentSchema.index({ status: 1 })
riskAssessmentSchema.index({ assessedBy: 1 })
riskAssessmentSchema.index({ nextAssessmentDate: 1 })
riskAssessmentSchema.index({ isActive: 1 })

// Compound indexes
riskAssessmentSchema.index({ vendor: 1, status: 1 })
riskAssessmentSchema.index({ vendor: 1, riskLevel: 1 })
riskAssessmentSchema.index({ vendor: 1, nextAssessmentDate: 1 })

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema)

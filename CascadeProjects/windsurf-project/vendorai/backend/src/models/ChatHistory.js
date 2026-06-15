const mongoose = require('mongoose')

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  session: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  messages: [{
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    type: {
      type: String,
      enum: ['user', 'bot', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      intent: String,
      entities: [{
        type: String,
        value: String,
        confidence: Number
      }],
      sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative'],
        default: 'neutral'
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      responseTime: Number, // in milliseconds
      processingTime: Number, // in milliseconds
      modelUsed: String,
      tokensUsed: Number,
      cost: Number
    },
    context: {
      previousMessages: [String],
      relevantDocuments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }],
      vendorData: {
        onboardingStatus: String,
        complianceScore: Number,
        riskLevel: String,
        missingDocuments: [String]
      }
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      isHelpful: {
        type: Boolean,
        default: null
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Feedback comment cannot exceed 500 characters']
      },
      submittedAt: Date
    },
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'document', 'link'],
        required: true
      },
      url: String,
      fileName: String,
      mimeType: String,
      size: Number
    }]
  }],
  intentAnalysis: {
    primaryIntent: String,
    confidence: Number,
    subIntents: [String],
    categories: [{
      category: String,
      confidence: Number
    }],
    language: {
      detected: String,
      confidence: Number
    }
  },
  sessionMetrics: {
    messageCount: {
      type: Number,
      default: 0
    },
    userMessageCount: {
      type: Number,
      default: 0
    },
    botMessageCount: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    totalResponseTime: {
      type: Number,
      default: 0
    },
    sessionDuration: Number, // in seconds
    satisfactionScore: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    resolutionStatus: {
      type: String,
      enum: ['resolved', 'escalated', 'abandoned', 'ongoing'],
      default: 'ongoing'
    },
    escalationReason: String,
    resolvedAt: Date
  },
  contextData: {
    vendorProfile: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    recentDocuments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }],
    complianceStatus: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    riskAssessment: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    userPreferences: {
      language: {
        type: String,
        default: 'en'
      },
      timezone: {
        type: String,
        default: 'UTC'
      },
      notificationLevel: {
        type: String,
        enum: ['all', 'important', 'critical'],
        default: 'important'
      }
    }
  },
  aiModel: {
    name: {
      type: String,
      default: 'gemini-pro'
    },
    version: String,
    provider: {
      type: String,
      default: 'google'
    },
    parameters: {
      temperature: {
        type: Number,
        default: 0.7
      },
      maxTokens: {
        type: Number,
        default: 1000
      },
      topP: {
        type: Number,
        default: 0.9
      },
      topK: {
        type: Number,
        default: 40
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for last message
chatHistorySchema.virtual('lastMessage').get(function() {
  if (!this.messages.length) return null
  return this.messages[this.messages.length - 1]
})

// Virtual for session duration in minutes
chatHistorySchema.virtual('sessionDurationMinutes').get(function() {
  if (!this.messages.length) return 0
  const firstMessage = this.messages[0]
  const lastMessage = this.messages[this.messages.length - 1]
  const duration = lastMessage.timestamp - firstMessage.timestamp
  return Math.round(duration / (1000 * 60))
})

// Virtual for average rating
chatHistorySchema.virtual('averageRating').get(function() {
  const ratings = this.messages
    .filter(msg => msg.feedback && msg.feedback.rating)
    .map(msg => msg.feedback.rating)
  
  if (!ratings.length) return null
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  return Math.round((sum / ratings.length) * 10) / 10
})

// Pre-save middleware to update session metrics
chatHistorySchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.sessionMetrics.messageCount = this.messages.length
    this.sessionMetrics.userMessageCount = this.messages.filter(msg => msg.type === 'user').length
    this.sessionMetrics.botMessageCount = this.messages.filter(msg => msg.type === 'bot').length
    
    if (this.messages.length > 0) {
      const firstMessage = this.messages[0]
      const lastMessage = this.messages[this.messages.length - 1]
      this.sessionMetrics.sessionDuration = (lastMessage.timestamp - firstMessage.timestamp) / 1000
    }
  }
  next()
})

// Indexes for better performance
chatHistorySchema.index({ user: 1 })
chatHistorySchema.index({ vendor: 1 })
chatHistorySchema.index({ session: 1 })
chatHistorySchema.index({ 'messages.timestamp': 1 })
chatHistorySchema.index({ createdAt: 1 })
chatHistorySchema.index({ isActive: 1 })
chatHistorySchema.index({ isArchived: 1 })

// Compound indexes
chatHistorySchema.index({ user: 1, session: 1 })
chatHistorySchema.index({ user: 1, createdAt: -1 })
chatHistorySchema.index({ vendor: 1, createdAt: -1 })

module.exports = mongoose.model('ChatHistory', chatHistorySchema)

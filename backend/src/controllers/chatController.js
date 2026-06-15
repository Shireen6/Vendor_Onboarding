const ChatHistory = require('../models/ChatHistory')
const Vendor = require('../models/Vendor')
const ComplianceReport = require('../models/ComplianceReport')
const RiskAssessment = require('../models/RiskAssessment')
const { chatWithContext } = require('../services/geminiService')

const buildContext = async (userId) => {
  const vendor = await Vendor.findOne({ user: userId })
  if (!vendor) {
    return {
      onboardingStatus: 'not_started',
      message: 'No vendor profile found. Please complete onboarding first.'
    }
  }

  const [compliance, risk] = await Promise.all([
    ComplianceReport.findOne({ vendor: vendor._id }).sort({ createdAt: -1 }),
    RiskAssessment.findOne({ vendor: vendor._id }).sort({ createdAt: -1 })
  ])

  return {
    vendorName: vendor.vendorName,
    companyName: vendor.companyName,
    onboardingStatus: vendor.onboardingStatus,
    complianceScore: compliance?.complianceScore ?? null,
    complianceStatus: compliance?.complianceStatus ?? 'pending',
    missingDocuments: compliance?.missingDocuments ?? [],
    missingFields: compliance?.missingFields ?? [],
    riskLevel: risk?.riskLevel ?? null,
    riskScore: risk?.riskScore ?? null,
    recommendations: compliance?.recommendations ?? []
  }
}

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' })
    }

    const context = await buildContext(req.user._id)
    const reply = await chatWithContext(message, context)

    const vendor = await Vendor.findOne({ user: req.user._id })
    const sid = sessionId || `session-${req.user._id}-${Date.now()}`

    let chat = await ChatHistory.findOne({ user: req.user._id, sessionId: sid })

    const userMsg = { role: 'user', content: message.trim(), timestamp: new Date() }
    const botMsg = { role: 'assistant', content: reply, timestamp: new Date() }

    if (chat) {
      chat.messages.push(userMsg, botMsg)
      await chat.save()
    } else {
      chat = await ChatHistory.create({
        user: req.user._id,
        vendor: vendor?._id,
        sessionId: sid,
        messages: [userMsg, botMsg]
      })
    }

    res.json({
      success: true,
      data: {
        reply,
        sessionId: sid,
        context
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ success: false, message: 'Failed to process message' })
  }
}

exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.query
    const query = { user: req.user._id }
    if (sessionId) query.sessionId = sessionId

    const history = await ChatHistory.find(query).sort({ updatedAt: -1 }).limit(10)
    res.json({ success: true, data: { history } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat history' })
  }
}

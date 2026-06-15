const Vendor = require('../models/Vendor')
const Document = require('../models/Document')
const ComplianceReport = require('../models/ComplianceReport')
const RiskAssessment = require('../models/RiskAssessment')
const { runComplianceCheck, buildTimeline } = require('../services/complianceService')
const { runRiskAssessment } = require('../services/riskService')
const { ONBOARDING_TIMELINE } = require('../config/constants')

const getVendorForUser = async (userId) => Vendor.findOne({ user: userId })

exports.getDashboardStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected, underReview] = await Promise.all([
      Vendor.countDocuments(),
      Vendor.countDocuments({ onboardingStatus: { $in: ['pending', 'submitted'] } }),
      Vendor.countDocuments({ onboardingStatus: 'approved' }),
      Vendor.countDocuments({ onboardingStatus: 'rejected' }),
      Vendor.countDocuments({ onboardingStatus: 'under_review' })
    ])

    const recentVendors = await Vendor.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')

    const statusBreakdown = [
      { name: 'Approved', value: approved, color: '#22c55e' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Under Review', value: underReview, color: '#3b82f6' },
      { name: 'Rejected', value: rejected, color: '#ef4444' }
    ]

    res.json({
      success: true,
      data: { total, pending, approved, rejected, underReview, recentVendors, statusBreakdown }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' })
  }
}

exports.createOrUpdateVendor = async (req, res) => {
  try {
    const { vendorName, companyName, email, phone, address, gstNumber, panNumber } = req.body

    let vendor = await getVendorForUser(req.user._id)

    const data = {
      user: req.user._id,
      vendorName,
      companyName,
      email,
      phone,
      address,
      gstNumber: gstNumber?.toUpperCase(),
      panNumber: panNumber?.toUpperCase(),
      onboardingStatus: 'submitted',
      submittedAt: new Date(),
      timeline: ONBOARDING_TIMELINE.map(s => ({ ...s, status: s.stage === 'submitted' ? 'completed' : 'pending' }))
    }

    if (vendor) {
      vendor = await Vendor.findByIdAndUpdate(vendor._id, data, { new: true, runValidators: true })
    } else {
      vendor = await Vendor.create(data)
    }

    res.json({ success: true, message: 'Vendor profile saved', data: { vendor } })
  } catch (error) {
    console.error('Vendor save error:', error)
    res.status(500).json({ success: false, message: error.message || 'Failed to save vendor profile' })
  }
}

exports.getMyVendor = async (req, res) => {
  try {
    const vendor = await getVendorForUser(req.user._id)
    if (!vendor) {
      return res.json({ success: true, data: { vendor: null } })
    }

    const [documents, compliance, risk] = await Promise.all([
      Document.find({ vendor: vendor._id }),
      ComplianceReport.findOne({ vendor: vendor._id }).sort({ createdAt: -1 }),
      RiskAssessment.findOne({ vendor: vendor._id }).sort({ createdAt: -1 })
    ])

    const timeline = buildTimeline(
      vendor,
      compliance?.complianceScore || 0,
      risk?.riskLevel
    )

    res.json({
      success: true,
      data: { vendor, documents, compliance, risk, timeline }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendor profile' })
  }
}

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: { vendors } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendors' })
  }
}

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email')
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' })
    }

    const [documents, compliance, risk] = await Promise.all([
      Document.find({ vendor: vendor._id }),
      ComplianceReport.findOne({ vendor: vendor._id }).sort({ createdAt: -1 }),
      RiskAssessment.findOne({ vendor: vendor._id }).sort({ createdAt: -1 })
    ])

    const timeline = buildTimeline(vendor, compliance?.complianceScore || 0, risk?.riskLevel)

    res.json({ success: true, data: { vendor, documents, compliance, risk, timeline } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendor' })
  }
}

exports.updateVendorStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body
    const update = { onboardingStatus: status }

    if (status === 'approved') update.approvedAt = new Date()
    if (status === 'rejected') {
      update.rejectedAt = new Date()
      update.rejectionReason = rejectionReason
    }

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' })
    }

    res.json({ success: true, message: `Vendor ${status}`, data: { vendor } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update vendor status' })
  }
}

exports.runFullAssessment = async (req, res) => {
  try {
    let vendor

    if (req.user.role === 'admin' && req.params.id) {
      vendor = await Vendor.findById(req.params.id)
    } else {
      vendor = await getVendorForUser(req.user._id)
    }

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' })
    }

    const compliance = await runComplianceCheck(vendor, req.user._id)
    const risk = await runRiskAssessment(vendor, compliance, req.user._id)

    if (compliance.complianceScore >= 80 && compliance.missingDocuments.length === 0) {
      vendor.onboardingStatus = 'under_review'
    } else {
      vendor.onboardingStatus = 'submitted'
    }
    await vendor.save()

    const timeline = buildTimeline(vendor, compliance.complianceScore, risk.riskLevel)
    vendor.timeline = timeline
    await vendor.save()

    res.json({
      success: true,
      message: 'Assessment completed',
      data: { compliance, risk, timeline }
    })
  } catch (error) {
    console.error('Assessment error:', error)
    res.status(500).json({ success: false, message: 'Assessment failed' })
  }
}

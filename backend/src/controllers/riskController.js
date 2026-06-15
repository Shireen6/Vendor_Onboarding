const RiskAssessment = require('../models/RiskAssessment')
const Vendor = require('../models/Vendor')
const ComplianceReport = require('../models/ComplianceReport')
const { runRiskAssessment } = require('../services/riskService')

exports.getMyRisk = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id })
    if (!vendor) {
      return res.json({ success: true, data: { assessment: null } })
    }

    const assessment = await RiskAssessment.findOne({ vendor: vendor._id }).sort({ createdAt: -1 })
    res.json({ success: true, data: { assessment } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch risk assessment' })
  }
}

exports.runRisk = async (req, res) => {
  try {
    let vendor

    if (req.user.role === 'admin' && req.params.vendorId) {
      vendor = await Vendor.findById(req.params.vendorId)
    } else {
      vendor = await Vendor.findOne({ user: req.user._id })
    }

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' })
    }

    const compliance = await ComplianceReport.findOne({ vendor: vendor._id }).sort({ createdAt: -1 })
    const assessment = await runRiskAssessment(vendor, compliance, req.user._id)

    res.json({ success: true, message: 'Risk assessment completed', data: { assessment } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Risk assessment failed' })
  }
}

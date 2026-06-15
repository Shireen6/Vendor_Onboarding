const ComplianceReport = require('../models/ComplianceReport')
const Vendor = require('../models/Vendor')
const { runComplianceCheck } = require('../services/complianceService')

exports.getMyCompliance = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id })
    if (!vendor) {
      return res.json({ success: true, data: { report: null } })
    }

    const report = await ComplianceReport.findOne({ vendor: vendor._id }).sort({ createdAt: -1 })
    res.json({ success: true, data: { report } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch compliance report' })
  }
}

exports.getVendorCompliance = async (req, res) => {
  try {
    const report = await ComplianceReport.findOne({ vendor: req.params.vendorId }).sort({ createdAt: -1 })
    res.json({ success: true, data: { report } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch compliance report' })
  }
}

exports.runCompliance = async (req, res) => {
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

    const report = await runComplianceCheck(vendor, req.user._id)
    res.json({ success: true, message: 'Compliance check completed', data: { report } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Compliance check failed' })
  }
}

exports.getComplianceHistory = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id })
    if (!vendor) {
      return res.json({ success: true, data: { reports: [] } })
    }

    const reports = await ComplianceReport.find({ vendor: vendor._id }).sort({ createdAt: -1 })
    res.json({ success: true, data: { reports } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history' })
  }
}

const Vendor = require('../models/Vendor')
const ComplianceReport = require('../models/ComplianceReport')
const RiskAssessment = require('../models/RiskAssessment')
const { generateFollowUpEmail } = require('../services/geminiService')

const buildEmailContext = (vendor, compliance, risk) => {
  const missingDocuments = compliance?.missingDocuments?.length
    ? compliance.missingDocuments
    : []

  const complianceFindings = [
    ...(compliance?.missingFields?.map(f => `Missing field: ${f}`) || []),
    ...(compliance?.invalidFields?.map(f => `Invalid field: ${f}`) || []),
    ...(compliance?.validationFailures || [])
  ]

  const riskFindings = [
    ...(risk?.factors || []),
    ...(risk?.deductions?.map(d => d.reason) || [])
  ]

  return {
    missingDocuments,
    complianceFindings,
    riskFindings,
    complianceScore: compliance?.complianceScore,
    riskLevel: risk?.riskLevel,
    riskScore: risk?.riskScore,
    recommendations: compliance?.recommendations || []
  }
}

exports.generateEmail = async (req, res) => {
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

    const [compliance, risk] = await Promise.all([
      ComplianceReport.findOne({ vendor: vendor._id }).sort({ createdAt: -1 }),
      RiskAssessment.findOne({ vendor: vendor._id }).sort({ createdAt: -1 })
    ])

    const context = buildEmailContext(vendor, compliance, risk)
    const emailBody = await generateFollowUpEmail(vendor, context)

    const hasIssues = context.missingDocuments.length > 0
      || context.complianceFindings.length > 0
      || context.riskFindings.length > 0

    res.json({
      success: true,
      data: {
        subject: hasIssues
          ? 'Additional Documents Required for Vendor Onboarding'
          : `Vendor Onboarding Update - ${vendor.companyName}`,
        body: emailBody,
        to: vendor.email,
        missingDocuments: context.missingDocuments,
        context: {
          vendorName: vendor.vendorName,
          companyName: vendor.companyName,
          complianceScore: context.complianceScore,
          riskLevel: context.riskLevel,
          complianceFindings: context.complianceFindings,
          riskFindings: context.riskFindings
        }
      }
    })
  } catch (error) {
    console.error('Email generation error:', error)
    res.status(500).json({ success: false, message: 'Failed to generate email' })
  }
}

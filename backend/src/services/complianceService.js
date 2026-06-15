const ComplianceReport = require('../models/ComplianceReport')
const Document = require('../models/Document')
const { REQUIRED_DOCUMENTS, REQUIRED_FIELDS, ONBOARDING_TIMELINE } = require('../config/constants')

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

const validateField = (field, value) => {
  if (!value || !String(value).trim()) return { valid: false, message: 'Field is empty' }

  if (field === 'gstNumber' && !GST_REGEX.test(String(value).toUpperCase())) {
    return { valid: false, message: 'Invalid GST number format' }
  }
  if (field === 'panNumber' && !PAN_REGEX.test(String(value).toUpperCase())) {
    return { valid: false, message: 'Invalid PAN number format' }
  }
  if (field === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
    return { valid: false, message: 'Invalid email format' }
  }

  return { valid: true }
}

const runComplianceCheck = async (vendor, userId) => {
  const documents = await Document.find({ vendor: vendor._id })
  const uploadedTypes = documents.map(d => d.documentType)

  const documentSummary = REQUIRED_DOCUMENTS.map(req => {
    const doc = documents.find(d => d.documentType === req.type)
    return {
      documentType: req.type,
      label: req.label,
      status: doc ? doc.status : 'missing',
      isUploaded: !!doc
    }
  })

  const missingDocuments = documentSummary
    .filter(d => !d.isUploaded)
    .map(d => d.label)

  const missingFields = []
  const invalidFields = []
  const validationFailures = []

  for (const field of REQUIRED_FIELDS) {
    const value = vendor[field]
    if (!value || !String(value).trim()) {
      missingFields.push(field)
    } else {
      const validation = validateField(field, value)
      if (!validation.valid) {
        invalidFields.push(field)
        validationFailures.push(`${field}: ${validation.message}`)
      }
    }
  }

  // Cross-validate extracted data from documents
  for (const doc of documents) {
    if (doc.extractedData?.gstNumber && vendor.gstNumber) {
      if (doc.extractedData.gstNumber.toUpperCase() !== vendor.gstNumber.toUpperCase()) {
        validationFailures.push(`GST mismatch in ${doc.documentType}`)
      }
    }
    if (doc.extractedData?.panNumber && vendor.panNumber) {
      if (doc.extractedData.panNumber.toUpperCase() !== vendor.panNumber.toUpperCase()) {
        validationFailures.push(`PAN mismatch in ${doc.documentType}`)
      }
    }
  }

  let score = 100
  score -= missingDocuments.length * 12
  score -= missingFields.length * 8
  score -= invalidFields.length * 10
  score -= validationFailures.length * 5
  score = Math.max(0, Math.min(100, score))

  let complianceStatus = 'compliant'
  if (score < 50) complianceStatus = 'non_compliant'
  else if (score < 80) complianceStatus = 'partially_compliant'

  const recommendations = []
  if (missingDocuments.length) {
    recommendations.push(`Upload missing documents: ${missingDocuments.join(', ')}`)
  }
  if (missingFields.length) {
    recommendations.push(`Complete missing fields: ${missingFields.join(', ')}`)
  }
  if (invalidFields.length) {
    recommendations.push(`Correct invalid fields: ${invalidFields.join(', ')}`)
  }
  if (validationFailures.length) {
    recommendations.push('Resolve document validation mismatches')
  }
  if (score >= 80 && !missingDocuments.length) {
    recommendations.push('Ready for final review and approval')
  }

  const report = await ComplianceReport.create({
    vendor: vendor._id,
    complianceScore: score,
    status: 'completed',
    complianceStatus,
    missingDocuments,
    missingFields,
    invalidFields,
    validationFailures,
    documentSummary,
    recommendations,
    generatedBy: userId
  })

  return report
}

const buildTimeline = (vendor, complianceScore, riskLevel) => {
  const timeline = ONBOARDING_TIMELINE.map(stage => ({ ...stage, status: 'pending', completedAt: null }))

  if (vendor.submittedAt || vendor.onboardingStatus !== 'pending') {
    timeline[0].status = 'completed'
    timeline[0].completedAt = vendor.submittedAt || vendor.createdAt
  }

  const hasDocuments = vendor.onboardingStatus !== 'pending'
  if (hasDocuments) {
    timeline[1].status = complianceScore > 0 ? 'completed' : 'in_progress'
    if (complianceScore > 0) timeline[1].completedAt = new Date()
  }

  if (complianceScore >= 50) {
    timeline[2].status = 'completed'
    timeline[2].completedAt = new Date()
  } else if (complianceScore > 0) {
    timeline[2].status = 'in_progress'
  }

  if (riskLevel) {
    timeline[3].status = 'completed'
    timeline[3].completedAt = new Date()
  }

  if (vendor.onboardingStatus === 'approved') {
    timeline[4].status = 'completed'
    timeline[4].completedAt = vendor.approvedAt || new Date()
  } else if (vendor.onboardingStatus === 'rejected') {
    timeline[4].status = 'failed'
  } else if (complianceScore >= 80) {
    timeline[4].status = 'in_progress'
  }

  return timeline
}

module.exports = { runComplianceCheck, buildTimeline, validateField }

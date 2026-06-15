const RiskAssessment = require('../models/RiskAssessment')

const calculateRiskLevel = (score) => {
  if (score >= 70) return 'low'
  if (score >= 40) return 'medium'
  return 'high'
}

const runRiskAssessment = async (vendor, complianceReport, userId) => {
  let score = 100
  const deductions = []
  const factors = []

  if (complianceReport) {
    const missingDocs = complianceReport.missingDocuments?.length || 0
    if (missingDocs > 0) {
      const points = missingDocs * 15
      score -= points
      deductions.push({ reason: `${missingDocs} missing document(s)`, points, category: 'document' })
      factors.push('Missing required documents')
    }

    const missingFields = complianceReport.missingFields?.length || 0
    if (missingFields > 0) {
      const points = missingFields * 10
      score -= points
      deductions.push({ reason: `${missingFields} incomplete field(s)`, points, category: 'information' })
      factors.push('Incomplete vendor information')
    }

    const invalidFields = complianceReport.invalidFields?.length || 0
    if (invalidFields > 0) {
      const points = invalidFields * 12
      score -= points
      deductions.push({ reason: `${invalidFields} validation failure(s)`, points, category: 'validation' })
      factors.push('Invalid or mismatched information')
    }

    const failures = complianceReport.validationFailures?.length || 0
    if (failures > 0) {
      const points = failures * 8
      score -= points
      deductions.push({ reason: `${failures} cross-validation issue(s)`, points, category: 'validation' })
      factors.push('Document data mismatch with submitted information')
    }
  } else {
    score -= 30
    deductions.push({ reason: 'No compliance report available', points: 30, category: 'validation' })
    factors.push('Compliance check not completed')
  }

  score = Math.max(0, Math.min(100, score))
  const riskLevel = calculateRiskLevel(score)

  const recommendations = []
  if (riskLevel === 'high') {
    recommendations.push('Immediate review required before approval')
    recommendations.push('Request all missing documents urgently')
  } else if (riskLevel === 'medium') {
    recommendations.push('Additional verification recommended')
    recommendations.push('Follow up on pending items within 48 hours')
  } else {
    recommendations.push('Vendor meets standard risk criteria')
    recommendations.push('Proceed with approval workflow')
  }

  const assessment = await RiskAssessment.create({
    vendor: vendor._id,
    riskScore: score,
    riskLevel,
    deductions,
    factors,
    recommendations,
    assessedBy: userId
  })

  return assessment
}

module.exports = { runRiskAssessment, calculateRiskLevel }

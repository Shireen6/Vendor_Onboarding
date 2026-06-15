const REQUIRED_DOCUMENTS = [
  { type: 'gst_certificate', label: 'GST Certificate' },
  { type: 'pan_card', label: 'PAN Card' },
  { type: 'bank_proof', label: 'Bank Proof' },
  { type: 'address_proof', label: 'Address Proof' },
  { type: 'registration_certificate', label: 'Registration Certificate' }
]

const REQUIRED_FIELDS = [
  'vendorName',
  'companyName',
  'email',
  'phone',
  'address',
  'gstNumber',
  'panNumber'
]

const ONBOARDING_TIMELINE = [
  { stage: 'submitted', label: 'Submitted' },
  { stage: 'documents_reviewed', label: 'Documents Reviewed' },
  { stage: 'compliance_check', label: 'Compliance Check' },
  { stage: 'risk_assessment', label: 'Risk Assessment' },
  { stage: 'approved', label: 'Approved' }
]

module.exports = {
  REQUIRED_DOCUMENTS,
  REQUIRED_FIELDS,
  ONBOARDING_TIMELINE
}

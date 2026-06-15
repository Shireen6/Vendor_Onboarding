const { GoogleGenerativeAI } = require('@google/generative-ai')
const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')
const OpenAI = require('openai')

let genAI = null

const nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
})

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

const extractTextFromFile = async (filePath, mimeType) => {
  const buffer = fs.readFileSync(filePath)

  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer)
    return data.text || ''
  }

  if (mimeType.startsWith('image/')) {
    return '[Image document - visual analysis will be performed by Gemini]'
  }

  return buffer.toString('utf-8')
}

const analyzeDocument = async (filePath, mimeType, documentType) => {
  try {
    const ai = getGenAI()
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const text = await extractTextFromFile(filePath, mimeType)

    const prompt = `You are a document analysis AI for vendor onboarding compliance.
Analyze this ${documentType.replace(/_/g, ' ')} document and extract information.

Document text/content:
${text.substring(0, 8000)}

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "companyName": "extracted company name or null",
  "gstNumber": "extracted GST number or null",
  "panNumber": "extracted PAN number or null",
  "address": "extracted address or null",
  "bankInformation": {
    "bankName": "bank name or null",
    "accountNumber": "account number or null",
    "ifscCode": "IFSC code or null",
    "branchName": "branch name or null"
  },
  "confidence": 85,
  "documentValid": true,
  "notes": "any relevant observations"
}`

    let result

    if (mimeType.startsWith('image/')) {
      const imageData = fs.readFileSync(filePath)
      const base64 = imageData.toString('base64')
      result = await model.generateContent([
        prompt,
        { inlineData: { data: base64, mimeType } }
      ])
    } else {
      result = await model.generateContent(prompt)
    }

    const responseText = result.response.text()
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return getFallbackExtraction(documentType)
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Gemini analysis error:', error.message)
    return getFallbackExtraction(documentType)
  }
}

const getFallbackExtraction = (documentType) => ({
  companyName: null,
  gstNumber: null,
  panNumber: null,
  address: null,
  bankInformation: { bankName: null, accountNumber: null, ifscCode: null, branchName: null },
  confidence: 0,
  documentValid: false,
  notes: `AI analysis unavailable for ${documentType}. Manual review required.`
})

const generateFollowUpEmail = async (vendor, context = {}) => {
  const {
    missingDocuments = [],
    complianceFindings = [],
    riskFindings = [],
    complianceScore,
    riskLevel,
    recommendations = []
  } = context

  try {
    const ai = getGenAI()
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a professional vendor compliance officer. Draft a follow-up email for vendor onboarding.

Vendor Name: ${vendor.vendorName}
Company Name: ${vendor.companyName}
Compliance Score: ${complianceScore ?? 'N/A'}/100
Risk Level: ${riskLevel ?? 'N/A'}

Missing Documents:
${missingDocuments.length ? missingDocuments.map(d => `- ${d}`).join('\n') : '- None listed'}

Compliance Findings:
${complianceFindings.length ? complianceFindings.map(f => `- ${f}`).join('\n') : '- No additional findings'}

Risk Findings:
${riskFindings.length ? riskFindings.map(f => `- ${f}`).join('\n') : '- No risk flags'}

Recommendations:
${recommendations.length ? recommendations.map(r => `- ${r}`).join('\n') : '- Complete pending items'}

Write a formal, courteous email from "Vendor Compliance Team".
- Address the vendor by name
- Reference the company name
- List missing items clearly with bullet points
- Mention compliance review context briefly
- Request submission at earliest convenience
- Professional closing

Return ONLY the email body text. No subject line. No markdown.`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (error) {
    console.error('Email generation error:', error.message)
    return getDefaultFollowUpEmail(vendor, context)
  }
}

const getDefaultFollowUpEmail = (vendor, context = {}) => {
  const { missingDocuments = [], complianceFindings = [], riskFindings = [] } = context
  const items = [
    ...missingDocuments.map(d => `• ${d}`),
    ...complianceFindings.map(f => `• ${f}`),
    ...riskFindings.map(f => `• ${f}`)
  ]

  return `Dear ${vendor.vendorName},

During our compliance review of your onboarding submission for ${vendor.companyName}, we identified the following items that require your attention:

${items.length ? items.join('\n') : '• Additional verification may be required'}

Please submit the requested documents and information through your VendorAI portal at your earliest convenience so we may continue processing your application.

If you have any questions, please don't hesitate to reach out.

Regards,
Vendor Compliance Team`
}

// Backward-compatible alias
const generateMissingDocumentEmail = (vendor, missingDocuments) =>
  generateFollowUpEmail(vendor, { missingDocuments })

const chatWithContext = async (message, context) => {
  try {
    const completion = await nvidiaClient.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',

      messages: [
        {
          role: 'system',
          content: `
You are VendorAI, an intelligent vendor onboarding assistant.

You help with:
- Vendor onboarding
- Compliance status
- Missing documents
- Risk assessment
- Application status
- General business questions
- Technology questions
- AI-related questions

Current Vendor Context:

${JSON.stringify(context, null, 2)}

Rules:
1. Use vendor context whenever relevant.
2. If user asks about compliance, onboarding, risk, or documents, answer from context.
3. If user asks a general question, answer normally.
4. Be professional, concise, and helpful.
`
        },
        {
          role: 'user',
          content: message
        }
      ],

      temperature: 0.7,
      max_tokens: 1024
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('NVIDIA Chat Error:', error)
    return getFallbackChatResponse(message, context)
  }
}
const getFallbackChatResponse = (message, context) => {
  const lower = message.toLowerCase()

  if (lower.includes('missing') && lower.includes('document')) {
    const missing = context.missingDocuments?.length
      ? context.missingDocuments.join(', ')
      : 'No missing documents detected'
    return `Based on your profile, the following documents are missing or pending: ${missing}. Please upload them in the Documents section.`
  }

  if (lower.includes('compliance') && lower.includes('score')) {
    return `Your current compliance score is ${context.complianceScore ?? 'not yet calculated'}/100. Status: ${context.complianceStatus ?? 'pending'}.`
  }

  if (lower.includes('pending') || lower.includes('why')) {
    return `Your application status is "${context.onboardingStatus}". ${context.missingDocuments?.length ? `Pending items: ${context.missingDocuments.join(', ')}.` : 'All required documents appear to be submitted.'}`
  }

  return `Your onboarding status is ${context.onboardingStatus}. Compliance score: ${context.complianceScore ?? 'N/A'}/100. Risk level: ${context.riskLevel ?? 'N/A'}. How can I help you further?`
}

module.exports = {
  analyzeDocument,
  generateMissingDocumentEmail,
  generateFollowUpEmail,
  chatWithContext,
  extractTextFromFile
}

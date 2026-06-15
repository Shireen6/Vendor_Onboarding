const path = require('path')
const fs = require('fs')
const Document = require('../models/Document')
const Vendor = require('../models/Vendor')
const { analyzeDocument } = require('../services/geminiService')
const { runComplianceCheck } = require('../services/complianceService')
const { runRiskAssessment } = require('../services/riskService')
const { REQUIRED_DOCUMENTS } = require('../config/constants')

const getVendorForUser = async (userId) => Vendor.findOne({ user: userId })

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const { documentType } = req.body
    if (!documentType) {
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ success: false, message: 'Document type is required' })
    }

    let vendor = await getVendorForUser(req.user._id)
    if (!vendor) {
      return res.status(400).json({ success: false, message: 'Please complete vendor onboarding form first' })
    }

    // Replace existing document of same type
    const existing = await Document.findOne({ vendor: vendor._id, documentType })
    if (existing) {
      if (fs.existsSync(existing.filePath)) fs.unlinkSync(existing.filePath)
      await Document.findByIdAndDelete(existing._id)
    }

    const doc = await Document.create({
      vendor: vendor._id,
      documentType,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      status: 'under_review'
    })

    // AI analysis (async but we await for immediate feedback)
    try {
      const extracted = await analyzeDocument(req.file.path, req.file.mimetype, documentType)
      doc.extractedData = {
        ...extracted,
        extractedAt: new Date()
      }
      doc.status = extracted.documentValid !== false ? 'uploaded' : 'under_review'
      await doc.save()
    } catch (aiError) {
      console.error('AI extraction failed:', aiError.message)
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded and analyzed',
      data: { document: doc }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ success: false, message: 'Failed to upload document' })
  }
}

exports.getMyDocuments = async (req, res) => {
  try {
    const vendor = await getVendorForUser(req.user._id)
    if (!vendor) {
      return res.json({ success: true, data: { documents: [], summary: REQUIRED_DOCUMENTS } })
    }

    const documents = await Document.find({ vendor: vendor._id }).sort({ createdAt: -1 })

    const summary = REQUIRED_DOCUMENTS.map(req => {
      const doc = documents.find(d => d.documentType === req.type)
      return {
        ...req,
        status: doc ? doc.status : 'missing',
        document: doc || null
      }
    })

    res.json({ success: true, data: { documents, summary } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents' })
  }
}

exports.getVendorDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ vendor: req.params.vendorId }).sort({ createdAt: -1 })
    res.json({ success: true, data: { documents } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents' })
  }
}

exports.updateDocumentStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason, reviewedAt: new Date() },
      { new: true }
    )

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' })
    }

    res.json({ success: true, data: { document: doc } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update document' })
  }
}

exports.analyzeDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' })
    }

    const extracted = await analyzeDocument(doc.filePath, doc.mimeType, doc.documentType)
    doc.extractedData = { ...extracted, extractedAt: new Date() }
    await doc.save()

    res.json({ success: true, message: 'Document analyzed', data: { document: doc } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Analysis failed' })
  }
}

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' })
    }

    if (fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath)
    await doc.deleteOne()

    res.json({ success: true, message: 'Document deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete document' })
  }
}

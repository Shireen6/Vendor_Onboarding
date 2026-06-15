import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FileText } from 'lucide-react'
import { documentAPI } from '../services/api'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import DropZone from '../components/ui/DropZone'
import StatusBadge from '../components/ui/StatusBadge'
import { DashboardSkeleton } from '../components/ui/Skeleton'

const DOC_LABELS = {
  gst_certificate: 'GST Certificate',
  pan_card: 'PAN Card',
  bank_proof: 'Bank Proof',
  address_proof: 'Address Proof',
  registration_certificate: 'Registration Certificate',
}

const DocumentManagement = () => {
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingType, setUploadingType] = useState(null)

  const fetchDocuments = async () => {
    try {
      const res = await documentAPI.getMyDocuments()
      setSummary(res.data.summary || [])
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocuments() }, [])

  const handleUpload = async (documentType, file) => {
    setUploadingType(documentType)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)
    try {
      await documentAPI.upload(formData)
      toast.success('Document uploaded & analyzed by AI')
      fetchDocuments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingType(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await documentAPI.delete(id)
      toast.success('Document deleted')
      fetchDocuments()
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) return <DashboardSkeleton />

  const uploaded = summary.filter(s => s.document).length
  const total = summary.length
  const progress = total ? Math.round((uploaded / total) * 100) : 0

  return (
    <div className="page-container">
      <PageHeader
        title="Document Management"
        description="Upload and manage your onboarding documents with AI-powered extraction"
        badge={<span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">{uploaded}/{total} uploaded</span>}
      />

      <Card className="!p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Progress</span>
          </div>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {summary.map((item) => (
          <DropZone
            key={item.type}
            label={item.label || DOC_LABELS[item.type]}
            doc={item.document}
            uploading={uploadingType === item.type}
            onUpload={(file) => handleUpload(item.type, file)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Card title="Status Guide" subtitle="Document lifecycle states">
        <div className="flex flex-wrap gap-2">
          {['uploaded', 'under_review', 'approved', 'rejected', 'missing'].map(s => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          Documents are automatically analyzed by Gemini AI upon upload. Extracted data powers compliance validation.
        </p>
      </Card>
    </div>
  )
}

export default DocumentManagement

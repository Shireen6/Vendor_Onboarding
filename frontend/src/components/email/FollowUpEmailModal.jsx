import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  Mail, Copy, RefreshCw, Download, Send, Sparkles, User, Building2
} from 'lucide-react'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import { emailAPI } from '../../services/api'

const FollowUpEmailModal = ({ open, onClose, vendorId = null }) => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [to, setTo] = useState('')

  const generate = async () => {
    setLoading(true)
    try {
      const res = vendorId
        ? await emailAPI.generateForVendor(vendorId)
        : await emailAPI.generate()
      setEmail(res.data)
      setSubject(res.data.subject)
      setBody(res.data.body)
      setTo(res.data.to)
      toast.success('Follow-up email generated')
    } catch {
      toast.error('Failed to generate email')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      generate()
    } else {
      setEmail(null)
      setSubject('')
      setBody('')
      setTo('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vendorId])

  const handleCopy = async () => {
    const text = `Subject: ${subject}\n\n${body}`
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const margin = 20
    let y = margin

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`To: ${to}`, margin, y)
    y += 8
    doc.text(`Subject: ${subject}`, margin, y)
    y += 12

    doc.setFontSize(11)
    doc.setTextColor(0)
    const lines = doc.splitTextToSize(body, 170)
    lines.forEach((line) => {
      if (y > 270) { doc.addPage(); y = margin }
      doc.text(line, margin, y)
      y += 6
    })

    doc.save(`vendor-followup-${Date.now()}.pdf`)
    toast.success('PDF downloaded')
  }

  const handleSend = () => {
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto, '_blank')
    toast.success('Opening email client...')
  }

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button onClick={generate} disabled={loading} className="btn btn-ghost text-sm">
        {loading ? <Spinner size="sm" /> : <><RefreshCw className="w-4 h-4" /> Regenerate</>}
      </button>
      <div className="flex flex-wrap gap-2">
        <button onClick={handleCopy} disabled={!body} className="btn btn-secondary text-sm">
          <Copy className="w-4 h-4" /> Copy
        </button>
        <button onClick={handleDownloadPDF} disabled={!body} className="btn btn-secondary text-sm">
          <Download className="w-4 h-4" /> Download PDF
        </button>
        <button onClick={handleSend} disabled={!body || !to} className="btn btn-primary text-sm">
          <Send className="w-4 h-4" /> Send Email
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="AI Vendor Follow-up Email"
      subtitle="Professional follow-up generated from compliance review"
      size="xl"
      footer={footer}
    >
      {loading && !email ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="p-4 rounded-2xl bg-primary-500/10">
            <Sparkles className="w-8 h-8 text-primary-600 animate-pulse-soft" />
          </div>
          <p className="text-sm text-slate-500">Gemini is drafting your follow-up email...</p>
          <Spinner size="md" />
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          {email?.context && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Vendor:</span>
                <span className="font-medium text-slate-900 dark:text-white">{email.context.vendorName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Company:</span>
                <span className="font-medium text-slate-900 dark:text-white">{email.context.companyName}</span>
              </div>
              {email.missingDocuments?.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Missing Items</p>
                  <div className="flex flex-wrap gap-1.5">
                    {email.missingDocuments.map((d) => (
                      <span key={d} className="badge bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">To</label>
            <input value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input font-medium" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              className="input font-sans leading-relaxed resize-y min-h-[280px]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Mail className="w-3.5 h-3.5" />
            Edit content above before sending. Powered by Google Gemini.
          </div>
        </div>
      )}
    </Modal>
  )
}

export default FollowUpEmailModal

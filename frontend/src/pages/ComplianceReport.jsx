import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw, Mail, AlertTriangle, CheckCircle, FileX, Sparkles } from 'lucide-react'
import { complianceAPI, riskAPI } from '../services/api'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import ScoreRing from '../components/ui/ScoreRing'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { DashboardSkeleton } from '../components/ui/Skeleton'
import FollowUpEmailModal from '../components/email/FollowUpEmailModal'

const ComplianceReport = () => {
  const [report, setReport] = useState(null)
  const [risk, setRisk] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [compRes, riskRes] = await Promise.all([
        complianceAPI.getMyCompliance(),
        riskAPI.getMyRisk()
      ])
      setReport(compRes.data.report)
      setRisk(riskRes.data.assessment)
    } catch {
      toast.error('Failed to load compliance data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleRunCompliance = async () => {
    setRunning(true)
    try {
      const compRes = await complianceAPI.runCompliance()
      setReport(compRes.data.report)
      const riskRes = await riskAPI.runRisk()
      setRisk(riskRes.data.assessment)
      toast.success('Compliance check completed')
    } catch {
      toast.error('Compliance check failed')
    } finally {
      setRunning(false)
    }
  }

  const hasIssues = report && (
    report.missingDocuments?.length > 0 ||
    report.missingFields?.length > 0 ||
    report.validationFailures?.length > 0
  )

  if (loading) return <DashboardSkeleton />

  if (!report) {
    return (
      <div className="page-container">
        <Card glass>
          <EmptyState
            icon={AlertTriangle}
            title="No Compliance Report Yet"
            description="Complete your profile, upload documents, then run a compliance check."
            action={
              <button onClick={handleRunCompliance} disabled={running} className="btn btn-primary">
                {running ? <><Spinner size="sm" /> Running...</> : 'Run Compliance Check'}
              </button>
            }
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Compliance Report"
        description={`Last generated ${new Date(report.createdAt).toLocaleString()}`}
        badge={<StatusBadge status={report.complianceStatus} />}
        actions={
          <>
            <button onClick={handleRunCompliance} disabled={running} className="btn btn-secondary">
              {running ? <Spinner size="sm" /> : <><RefreshCw className="w-4 h-4" /> Re-run Check</>}
            </button>
            <button onClick={() => setEmailModalOpen(true)} className="btn btn-primary">
              <Mail className="w-4 h-4" /> Generate Follow-up Email
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-hover p-6 flex flex-col items-center">
          <ScoreRing score={report.complianceScore} label="Compliance Score" />
        </div>
        <Card className="!p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overall Status</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 capitalize">
            {report.complianceScore >= 80 ? 'On Track' : report.complianceScore >= 50 ? 'Needs Attention' : 'Critical'}
          </p>
          <div className="mt-3"><StatusBadge status={report.complianceStatus} /></div>
        </Card>
        <Card className="!p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Risk Assessment</p>
          {risk ? (
            <>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{risk.riskScore}<span className="text-lg text-slate-400">/100</span></p>
              <div className="mt-3"><StatusBadge status={risk.riskLevel} label={`${risk.riskLevel} risk`} /></div>
            </>
          ) : (
            <p className="text-slate-400 mt-4 text-sm">Run assessment to calculate risk</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Document Compliance" subtitle="Required document status">
          <div className="space-y-1">
            {(report.documentSummary || []).map((doc) => (
              <div key={doc.documentType} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{doc.label}</span>
                <StatusBadge status={doc.isUploaded ? doc.status : 'missing'} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Issues & Findings" subtitle={hasIssues ? 'Action required' : 'All clear'}>
          {report.missingDocuments?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <FileX className="w-3.5 h-3.5" /> Missing Documents
              </p>
              <ul className="space-y-1.5">
                {report.missingDocuments.map((doc) => (
                  <li key={doc} className="text-sm text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-red-300 dark:border-red-800">{doc}</li>
                ))}
              </ul>
            </div>
          )}
          {report.missingFields?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Missing Fields</p>
              <ul className="space-y-1">{report.missingFields.map((f) => <li key={f} className="text-sm text-slate-600 dark:text-slate-400">• {f}</li>)}</ul>
            </div>
          )}
          {report.validationFailures?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Validation Failures</p>
              <ul className="space-y-1">{report.validationFailures.map((f, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-400">• {f}</li>)}</ul>
            </div>
          )}
          {!hasIssues && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">All compliance checks passed</span>
            </div>
          )}
        </Card>
      </div>

      {report.recommendations?.length > 0 && (
        <Card title="AI Recommendations" subtitle="Suggested next steps" action={<Sparkles className="w-4 h-4 text-primary-500" />}>
          <div className="grid gap-2">
            {report.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <p className="text-sm text-slate-600 dark:text-slate-400">{rec}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {risk?.deductions?.length > 0 && (
        <Card title="Risk Score Breakdown">
          <div className="space-y-1">
            {risk.deductions.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className="text-sm text-slate-600 dark:text-slate-400">{d.reason}</span>
                <span className="text-sm font-semibold text-red-500">-{d.points} pts</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <FollowUpEmailModal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </div>
  )
}

export default ComplianceReport

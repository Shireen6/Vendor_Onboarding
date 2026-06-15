import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Clock, CheckCircle, XCircle, ArrowRight, RefreshCw,
  Shield, AlertTriangle, Activity, Mail, TrendingUp
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { vendorAPI } from '../services/api'
import Card from '../components/ui/Card'
import KPICard from '../components/ui/KPICard'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import ScoreRing from '../components/ui/ScoreRing'
import Timeline from '../components/ui/Timeline'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { DashboardSkeleton } from '../components/ui/Skeleton'
import FollowUpEmailModal from '../components/email/FollowUpEmailModal'

const CHART_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ef4444']

const Dashboard = () => {
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [vendorData, setVendorData] = useState(null)
  const [assessing, setAssessing] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (isAdmin) {
        const res = await vendorAPI.getDashboardStats()
        setStats(res.data)
      } else {
        const res = await vendorAPI.getMyVendor()
        setVendorData(res.data)
      }
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [isAdmin])

  const handleRunAssessment = async () => {
    setAssessing(true)
    try {
      await vendorAPI.runAssessment()
      toast.success('Assessment completed')
      fetchData()
    } catch {
      toast.error('Assessment failed')
    } finally {
      setAssessing(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  if (isAdmin) {
    return (
      <div className="page-container">
        <PageHeader
          title="Admin Dashboard"
          description="Vendor onboarding overview and compliance analytics"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard title="Total Vendors" value={stats?.total || 0} icon={Users} color="primary" subtitle="All registered" />
          <KPICard title="Pending Review" value={stats?.pending || 0} icon={Clock} color="warning" />
          <KPICard title="Approved" value={stats?.approved || 0} icon={CheckCircle} color="success" trend={{ positive: true, label: 'Active vendors' }} />
          <KPICard title="Rejected" value={stats?.rejected || 0} icon={XCircle} color="danger" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Status Distribution" subtitle="Vendor pipeline breakdown">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats?.statusBreakdown || []}
                  dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  paddingAngle={3}
                >
                  {(stats?.statusBreakdown || []).map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Volume by Status">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.statusBreakdown || []} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card
          title="Recent Activity"
          subtitle="Latest vendor submissions"
          action={
            <Link to="/vendors" className="btn btn-ghost text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          }
        >
          <div className="overflow-x-auto -mx-6">
            <table className="table-premium w-full">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentVendors || []).map((v) => (
                  <tr key={v._id}>
                    <td className="font-semibold text-slate-900 dark:text-white">{v.companyName}</td>
                    <td className="text-slate-500 dark:text-slate-400">{v.email}</td>
                    <td><StatusBadge status={v.onboardingStatus} /></td>
                    <td className="text-slate-500">{v.submittedAt ? new Date(v.submittedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!stats?.recentVendors?.length && (
              <EmptyState icon={Users} title="No vendors yet" description="Vendors will appear here once they register." />
            )}
          </div>
        </Card>

        <Card title="Quick Actions" className="glass">
          <div className="flex flex-wrap gap-3">
            <Link to="/vendors" className="btn btn-primary"><Users className="w-4 h-4" /> Manage Vendors</Link>
            <Link to="/vendors" className="btn btn-secondary"><Mail className="w-4 h-4" /> Vendor Follow-up Emails</Link>
          </div>
        </Card>
      </div>
    )
  }

  const { vendor, compliance, risk, timeline } = vendorData || {}
  const hasIssues = compliance?.missingDocuments?.length > 0

  return (
    <div className="page-container">
      <PageHeader
        title={`Welcome back${vendor ? `, ${vendor.vendorName}` : ''}`}
        description="Track your onboarding progress and compliance status"
        actions={vendor && (
          <>
            {hasIssues && (
              <button onClick={() => setEmailModalOpen(true)} className="btn btn-secondary">
                <Mail className="w-4 h-4" /> Generate Follow-up Email
              </button>
            )}
            <button onClick={handleRunAssessment} disabled={assessing} className="btn btn-primary">
              {assessing ? <><Spinner size="sm" /> Running...</> : <><RefreshCw className="w-4 h-4" /> Run Assessment</>}
            </button>
          </>
        )}
      />

      {!vendor ? (
        <Card glass>
          <EmptyState
            icon={Users}
            title="Start Your Onboarding"
            description="Complete your vendor profile to begin the AI-powered compliance process."
            action={<Link to="/onboarding" className="btn btn-primary">Begin Onboarding <ArrowRight className="w-4 h-4" /></Link>}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard
              title="Onboarding Status"
              value={vendor.onboardingStatus?.replace(/_/g, ' ') || '—'}
              icon={Activity}
              color="info"
              subtitle={<StatusBadge status={vendor.onboardingStatus} />}
            />
            <div className="card-hover p-6 flex flex-col items-center justify-center">
              <ScoreRing score={compliance?.complianceScore || 0} label="Compliance" />
            </div>
            <KPICard
              title="Risk Level"
              value={risk ? `${risk.riskScore}/100` : '—'}
              icon={AlertTriangle}
              color={risk?.riskLevel === 'high' ? 'danger' : risk?.riskLevel === 'medium' ? 'warning' : 'success'}
              subtitle={risk ? <StatusBadge status={risk.riskLevel} label={`${risk.riskLevel} risk`} /> : 'Not assessed'}
            />
            <KPICard
              title="Documents"
              value={`${(compliance?.documentSummary || []).filter(d => d.isUploaded).length || 0}/5`}
              icon={Shield}
              color="primary"
              subtitle="Uploaded & verified"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Onboarding Timeline" className="lg:col-span-1">
              <Timeline steps={timeline || []} />
            </Card>

            <Card title="Recent Activity" className="lg:col-span-1">
              <div className="space-y-4">
                {[
                  { label: 'Profile submitted', done: !!vendor.submittedAt, date: vendor.submittedAt },
                  { label: 'Compliance checked', done: !!compliance, date: compliance?.createdAt },
                  { label: 'Risk assessed', done: !!risk, date: risk?.createdAt },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.done ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      {item.date && <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Quick Actions" className="lg:col-span-1">
              <div className="space-y-2">
                {[
                  { to: '/documents', label: 'Upload Documents', icon: TrendingUp },
                  { to: '/compliance', label: 'Compliance Report', icon: Shield },
                  { to: '/chat', label: 'AI Assistant', icon: Activity },
                ].map((item) => (
                  <Link key={item.to} to={item.to}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80
                               hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all group">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      <FollowUpEmailModal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </div>
  )
}

export default Dashboard

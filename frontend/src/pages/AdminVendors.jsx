import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Eye, Mail, Building2 } from 'lucide-react'
import { vendorAPI } from '../services/api'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import ScoreRing from '../components/ui/ScoreRing'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonTable } from '../components/ui/Skeleton'
import Spinner from '../components/ui/Spinner'
import FollowUpEmailModal from '../components/email/FollowUpEmailModal'

const AdminVendors = () => {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)

  useEffect(() => {
    vendorAPI.getAllVendors()
      .then(res => setVendors(res.data.vendors || []))
      .catch(() => toast.error('Failed to load vendors'))
      .finally(() => setLoading(false))
  }, [])

  const viewVendor = async (id) => {
    setSelected(id)
    setDetailLoading(true)
    try {
      const res = await vendorAPI.getVendorById(id)
      setDetail(res.data)
    } catch {
      toast.error('Failed to load vendor details')
    } finally {
      setDetailLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await vendorAPI.updateStatus(id, { status })
      toast.success(`Vendor ${status}`)
      const res = await vendorAPI.getAllVendors()
      setVendors(res.data.vendors || [])
      if (selected === id) viewVendor(id)
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <SkeletonTable rows={6} />
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Vendor Review"
        description={`${vendors.length} vendors in the onboarding pipeline`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="All Vendors" className="xl:col-span-2" noPadding>
          <div className="overflow-x-auto">
            <table className="table-premium w-full">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>GST Number</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v._id} className={selected === v._id ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''}>
                    <td>
                      <p className="font-semibold text-slate-900 dark:text-white">{v.companyName}</p>
                      <p className="text-xs text-slate-500">{v.email}</p>
                    </td>
                    <td className="font-mono text-xs text-slate-500">{v.gstNumber}</td>
                    <td><StatusBadge status={v.onboardingStatus} /></td>
                    <td>
                      <button onClick={() => viewVendor(v._id)} className="btn btn-ghost p-2">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!vendors.length && (
              <EmptyState icon={Building2} title="No vendors registered" description="Vendors will appear here once they sign up." />
            )}
          </div>
        </Card>

        <Card title="Vendor Details" subtitle={detail ? detail.vendor.companyName : 'Select a vendor'}>
          {!selected ? (
            <EmptyState icon={Eye} title="No vendor selected" description="Click the view icon to review a vendor." className="py-8" />
          ) : detailLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : detail ? (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Contact</p>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{detail.vendor.vendorName}</p>
                  <p className="text-sm text-slate-500">{detail.vendor.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</p>
                  <div className="mt-1"><StatusBadge status={detail.vendor.onboardingStatus} /></div>
                </div>
              </div>

              {detail.compliance && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <ScoreRing score={detail.compliance.complianceScore} size={90} />
                  <div>
                    <p className="text-xs text-slate-400">Compliance</p>
                    <StatusBadge status={detail.compliance.complianceStatus} />
                  </div>
                </div>
              )}

              {detail.risk && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-400 mb-1">Risk Level</p>
                  <StatusBadge status={detail.risk.riskLevel} label={`${detail.risk.riskLevel} — ${detail.risk.riskScore}/100`} />
                </div>
              )}

              <button onClick={() => setEmailModalOpen(true)} className="btn btn-primary w-full">
                <Mail className="w-4 h-4" /> Generate Follow-up Email
              </button>

              <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => updateStatus(selected, 'approved')} className="btn btn-primary flex-1 text-sm">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => updateStatus(selected, 'rejected')} className="btn btn-danger flex-1 text-sm">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <FollowUpEmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        vendorId={selected}
      />
    </div>
  )
}

export default AdminVendors

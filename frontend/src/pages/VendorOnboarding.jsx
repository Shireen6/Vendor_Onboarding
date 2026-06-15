import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Save, Building2, User, MapPin, Hash } from 'lucide-react'
import { vendorAPI } from '../services/api'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'
import { DashboardSkeleton } from '../components/ui/Skeleton'

const VendorOnboarding = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await vendorAPI.getMyVendor()
        if (res.data.vendor) reset(res.data.vendor)
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [reset])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await vendorAPI.saveVendor(data)
      toast.success('Vendor profile saved successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="page-container max-w-3xl">
      <PageHeader
        title="Vendor Onboarding"
        description="Provide your company details for AI-powered compliance verification"
      />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-200/80 dark:border-slate-700/80">
            <div className="p-2.5 rounded-xl bg-primary-500/10">
              <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Company Information</h3>
              <p className="text-xs text-slate-500">All fields are required for compliance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Vendor Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('vendorName', { required: 'Required' })} className="input pl-10" placeholder="Contact person" />
              </div>
              {errors.vendorName && <p className="text-sm text-red-500 mt-1">{errors.vendorName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('companyName', { required: 'Required' })} className="input pl-10" placeholder="Legal name" />
              </div>
              {errors.companyName && <p className="text-sm text-red-500 mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} type="email" className="input" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
              <input {...register('phone', { required: 'Required' })} className="input" placeholder="+91 98765 43210" />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <textarea {...register('address', { required: 'Required' })} rows={3} className="input pl-10 resize-none" placeholder="Full business address" />
              </div>
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">GST Number</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('gstNumber', { required: 'Required' })} className="input pl-10 uppercase font-mono" placeholder="22AAAAA0000A1Z5" />
              </div>
              {errors.gstNumber && <p className="text-sm text-red-500 mt-1">{errors.gstNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">PAN Number</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('panNumber', { required: 'Required' })} className="input pl-10 uppercase font-mono" placeholder="AAAAA0000A" />
              </div>
              {errors.panNumber && <p className="text-sm text-red-500 mt-1">{errors.panNumber.message}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-5 border-t border-slate-200/80 dark:border-slate-700/80">
            <button type="submit" disabled={saving} className="btn btn-primary px-6">
              {saving ? <><Spinner size="sm" /> Saving...</> : <><Save className="w-4 h-4" /> Save & Continue</>}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Next Steps" glass>
        <ol className="space-y-3">
          {['Upload required documents', 'Run compliance assessment', 'Review score & risk level', 'Use AI Assistant for questions'].map((step, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  )
}

export default VendorOnboarding

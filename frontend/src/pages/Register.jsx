import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Shield, Mail, Lock, User, Building2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Spinner from '../components/ui/Spinner'

const Register = () => {
  const { register: registerUser } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState('vendor')
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    const result = await registerUser({ ...data, role })
    if (result.success) {
      toast.success('Account created!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6 gradient-mesh">
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="btn btn-ghost text-sm">{dark ? '☀️' : '🌙'}</button>
      </div>

      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8 shadow-elevated">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center shadow-glow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">VendorAI</span>
              <p className="text-xs text-slate-400">Create your account</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Get started</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Already registered? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('name', { required: 'Name is required' })} className="input pl-10" placeholder="John Doe" />
              </div>
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                  type="email" className="input pl-10" placeholder="you@company.com"
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={showPassword ? 'text' : 'password'} className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Account Type</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {role === 'vendor' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input {...register('companyName', { required: role === 'vendor' ? 'Required' : false })} className="input pl-10" placeholder="Acme Corp" />
                </div>
                {errors.companyName && <p className="text-sm text-red-500 mt-1">{errors.companyName.message}</p>}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3 mt-2">
              {isLoading ? <><Spinner size="sm" /> Creating...</> : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Spinner from '../components/ui/Spinner'

const Login = () => {
  const { login } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    const result = await login(data)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      <div className="hidden lg:flex lg:w-[55%] gradient-hero relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">VendorAI</span>
        </div>
        <div className="relative space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-white/90 text-sm">
            <Sparkles className="w-4 h-4" /> AI-Powered Compliance
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
            Enterprise vendor onboarding, reimagined
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Autonomous document validation, compliance scoring, and risk assessment — built for modern compliance teams.
          </p>
        </div>
        <p className="relative text-indigo-200/80 text-sm">© VendorAI Enterprise Platform</p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-4">
          <button onClick={toggleTheme} className="btn btn-ghost text-sm">
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-slide-up">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-9 h-9 gradient-hero rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold dark:text-white">VendorAI</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5">
              Sign in to your account or{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">create one</Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                    type="email" className="input pl-10" placeholder="you@company.com"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    type={showPassword ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1.5">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3 text-base">
                {isLoading ? <><Spinner size="sm" /> Signing in...</> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Demo Access</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Admin: admin@vendorai.com / admin123</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Vendor: vendor@vendorai.com / vendor123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

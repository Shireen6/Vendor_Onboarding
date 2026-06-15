import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, Shield, MessageSquare,
  User, LogOut, Menu, X, Building2, Moon, Sun, Bell, Search
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Layout = () => {
  const { user, logout, isAdmin } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(isAdmin ? [] : [{ name: 'Onboarding', href: '/onboarding', icon: Users }]),
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Compliance', href: '/compliance', icon: Shield },
    { name: 'AI Assistant', href: '/chat', icon: MessageSquare },
    ...(isAdmin ? [{ name: 'All Vendors', href: '/vendors', icon: Building2 }] : []),
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const isActive = (href) => location.pathname === href
  const currentPage = navigation.find(item => isActive(item.href))?.name || 'Dashboard'

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col
        bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800
        transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 h-16 px-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="w-9 h-9 gradient-hero rounded-xl flex items-center justify-center shadow-glow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-base font-bold text-slate-900 dark:text-white">VendorAI</span>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Enterprise</p>
          </div>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Menu</p>
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                  ${active
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 shadow-soft'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                {item.name}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-200/80 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 dark:text-slate-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-4 lg:px-8
                           bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
                           border-b border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{currentPage}</h1>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 w-56">
            <Search className="w-4 h-4" />
            <span className="text-sm">Search...</span>
          </div>

          <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto gradient-mesh min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

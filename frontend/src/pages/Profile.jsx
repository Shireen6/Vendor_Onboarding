import React from 'react'
import { User, Mail, Shield, Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'

const Profile = () => {
  const { user } = useAuth()

  return (
    <div className="page-container max-w-2xl">
      <PageHeader title="Profile" description="Your account information and role" />

      <Card>
        <div className="flex items-center gap-5 pb-6 border-b border-slate-200/80 dark:border-slate-700/80">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <div className="mt-1.5"><StatusBadge status={user?.role} label={user?.role} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          {[
            { icon: Mail, label: 'Email', value: user?.email },
            user?.companyName && { icon: Building2, label: 'Company', value: user.companyName },
            { icon: Shield, label: 'Role', value: user?.role, capitalize: true },
          ].filter(Boolean).map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-soft">
                <item.icon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{item.label}</p>
                <p className={`text-sm font-semibold text-slate-900 dark:text-white ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Profile

import {
   LayoutDashboard, Users, CalendarDays, Stethoscope, FlaskConical,
   Pill, CreditCard, BedDouble, UserCog, Package, Scan,
   ShieldCheck, BarChart3, Bell, AlertTriangle, Droplets,
   Scissors, Baby, Video, FolderOpen, ClipboardList,
   UserCircle, Building2, DollarSign, FileText, Zap, Database, Wallet,
 } from 'lucide-react'
import { useHMS } from '../../store/HMSContext'
import type { ModuleKey } from '../../types'

interface NavItem {
  key: ModuleKey
  label: string
  icon: React.ReactNode
  roles?: string[]
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { key: 'patients', label: 'Patient Management', icon: <Users size={18} /> },
  { key: 'appointments', label: 'Appointments', icon: <CalendarDays size={18} /> },
  { key: 'doctors', label: 'Doctors', icon: <Stethoscope size={18} /> },
  { key: 'emr', label: 'EMR', icon: <FileText size={18} /> },
  { key: 'laboratory', label: 'Laboratory', icon: <FlaskConical size={18} /> },
  { key: 'pharmacy', label: 'Pharmacy', icon: <Pill size={18} /> },
  { key: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
  { key: 'inpatient', label: 'Inpatient', icon: <BedDouble size={18} /> },
  { key: 'staff', label: 'Staff', icon: <UserCog size={18} /> },
  { key: 'inventory', label: 'Inventory', icon: <Package size={18} /> },
  { key: 'radiology', label: 'Radiology', icon: <Scan size={18} /> },
  { key: 'insurance', label: 'Insurance', icon: <ShieldCheck size={18} /> },
  { key: 'financials', label: 'Financials', icon: <DollarSign size={18} /> },
  { key: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  { key: 'emergency', label: 'Emergency', icon: <AlertTriangle size={18} /> },
  { key: 'bloodbank', label: 'Blood Bank', icon: <Droplets size={18} /> },
  { key: 'ot', label: 'OT / Surgery', icon: <Scissors size={18} /> },
  { key: 'maternity', label: 'Maternity', icon: <Baby size={18} /> },
  { key: 'telemedicine', label: 'Telemedicine', icon: <Video size={18} /> },
  { key: 'documents', label: 'Documents', icon: <FolderOpen size={18} /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { key: 'security', label: 'Security', icon: <ShieldCheck size={18} /> },
  { key: 'audit', label: 'Audit', icon: <ClipboardList size={18} /> },

  { key: 'portal', label: 'Patient Portal', icon: <UserCircle size={18} />, roles: ['Patient', 'Admin'] },
  { key: 'myprofile', label: 'My Profile', icon: <UserCircle size={18} /> },
  { key: 'stellarbilling', label: 'Stellar / XLM', icon: <Zap size={18} /> },
  { key: 'wallet', label: 'Wallet Manager', icon: <Wallet size={18} /> },
  { key: 'onduty', label: 'Staff on Duty', icon: <ShieldCheck size={18} /> },
  { key: 'centraldb', label: 'Central DB', icon: <Database size={18} />, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'LabTechnician', 'Radiologist'] },
  { key: 'settings', label: 'Settings', icon: <Building2 size={18} />, roles: ['Admin'] },
]

// Role-based access map
const ROLE_ACCESS: Record<string, ModuleKey[]> = {
  Admin: NAV_ITEMS.map(i => i.key),
   Doctor: ['dashboard', 'patients', 'appointments', 'emr', 'laboratory', 'radiology', 'telemedicine', 'notifications', 'myprofile', 'stellarbilling', 'centraldb', 'onduty'],
   Nurse: ['dashboard', 'patients', 'emr', 'inpatient', 'notifications', 'myprofile', 'centraldb', 'onduty'],
   Pharmacist: ['dashboard', 'pharmacy', 'patients', 'notifications', 'myprofile', 'stellarbilling', 'centraldb', 'onduty'],
   Cashier: ['dashboard', 'billing', 'patients', 'notifications', 'myprofile', 'stellarbilling', 'wallet', 'centraldb', 'onduty'],
   LabTechnician: ['dashboard', 'laboratory', 'patients', 'notifications', 'myprofile', 'centraldb', 'onduty'],
   Radiologist: ['dashboard', 'radiology', 'patients', 'notifications', 'myprofile', 'centraldb', 'onduty'],
   Receptionist: ['dashboard', 'patients', 'appointments', 'notifications', 'myprofile', 'centraldb', 'onduty'],
  Patient: ['portal', 'notifications', 'stellarbilling'],
}

export function Sidebar() {
  const { currentUser, activeModule, setActiveModule, state } = useHMS()
  const role = currentUser?.role ?? 'Patient'
  const allowed = ROLE_ACCESS[role] ?? ['dashboard']
  const unreadNotifs = state.notifications.filter(n => n.status === 'Pending' || n.status === 'Sent').length

  const visibleItems = NAV_ITEMS.filter(item => allowed.includes(item.key))

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-icon">🏥</span>
        <span className="sidebar__brand-name">Sameds Hospital</span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {visibleItems.map(item => (
          <button
            key={item.key}
            type="button"
            className={`sidebar__item${activeModule === item.key ? ' sidebar__item--active' : ''}`}
            onClick={() => setActiveModule(item.key)}
            aria-current={activeModule === item.key ? 'page' : undefined}
          >
            <span className="sidebar__item-icon">{item.icon}</span>
            <span className="sidebar__item-label">{item.label}</span>
            {item.key === 'notifications' && unreadNotifs > 0 && (
              <span className="sidebar__badge">{unreadNotifs}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  )
}

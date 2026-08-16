import { useHMS } from './store/HMSContext'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './components/auth/LoginPage'
import { Dashboard } from './modules/Dashboard'
import { Patients } from './modules/Patients'
import { Appointments } from './modules/Appointments'
import { Doctors } from './modules/Doctors'
import { EMR } from './modules/EMR'
import { Laboratory } from './modules/Laboratory'
import { Pharmacy } from './modules/Pharmacy'
import { Billing } from './modules/Billing'
import { Inpatient } from './modules/Inpatient'
import { Staff } from './modules/Staff'
import { Inventory } from './modules/Inventory'
import { Radiology } from './modules/Radiology'
import { Insurance } from './modules/Insurance'
import { Financials } from './modules/Financials'
import { Reports } from './modules/Reports'
import { Security } from './modules/Security'
import { Notifications } from './modules/Notifications'
import { Emergency } from './modules/Emergency'
import { BloodBank } from './modules/BloodBank'
import { OperationTheatre } from './modules/OperationTheatre'
import { Audit } from './modules/Audit'
import { Maternity } from './modules/Maternity'
import { Telemedicine } from './modules/Telemedicine'
import { Documents } from './modules/Documents'
import { PatientPortal } from './modules/PatientPortal'
import { StaffProfile } from './modules/StaffProfile'
import { StellarBilling } from './modules/StellarBilling'
import { WalletManager } from './modules/WalletManager'
import { StaffOnDuty } from './modules/StaffOnDuty'
import { CentralDatabase } from './modules/CentralDatabase'

export function App() {
  const { currentUser, activeModule } = useHMS()

  if (!currentUser) return <LoginPage />

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />
      case 'patients': return <Patients />
      case 'appointments': return <Appointments />
      case 'doctors': return <Doctors />
      case 'emr': return <EMR />
      case 'laboratory': return <Laboratory />
      case 'pharmacy': return <Pharmacy />
      case 'billing': return <Billing />
      case 'inpatient': return <Inpatient />
      case 'staff': return <Staff />
      case 'inventory': return <Inventory />
      case 'radiology': return <Radiology />
      case 'insurance': return <Insurance />
      case 'financials': return <Financials />
      case 'reports': return <Reports />
      case 'security': return <Security />
      case 'notifications': return <Notifications />
      case 'emergency': return <Emergency />
      case 'bloodbank': return <BloodBank />
      case 'ot': return <OperationTheatre />
      case 'audit': return <Audit />
      case 'maternity': return <Maternity />
      case 'telemedicine': return <Telemedicine />
      case 'documents': return <Documents />
      case 'portal': return <PatientPortal />
      case 'myprofile': return <StaffProfile />
       case 'stellarbilling': return <StellarBilling />
      case 'wallet': return <WalletManager />
      case 'onduty': return <StaffOnDuty />
       case 'centraldb': return <CentralDatabase />
       default: return <Dashboard />
    }
  }

  return <Layout>{renderModule()}</Layout>
}

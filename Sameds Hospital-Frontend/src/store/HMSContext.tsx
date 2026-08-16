import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import type {
   HMSState, UserAccount, Patient, Appointment, MedicalRecord, Diagnosis,
   Prescription, VitalSign, Immunization, LabTest, LabResult, Medicine,
   PrescriptionDispense, RadiologyRequest, RadiologyReport, Invoice, Payment,
   InsurancePolicy, InsuranceClaim, Expense, InventoryItem, Supplier,
   BloodDonor, BloodUnit, BloodRequest, Surgery, EmergencyCase, Ambulance,
   MaternityRecord, TelemedicineSession, Notification, AuditLog, Document,
   Staff, Doctor, Nurse, Ward, Bed, Admission, ModuleKey, StellarPayment,
   StaffProfile, CentralRecord,
 } from '../types'
import { initialHMSState, seedUserAccounts } from '../data/seeds'

const STORAGE_KEY = 'hms-state-v4'
const AUTH_KEY = 'hms-auth-v4'
const THEME_KEY = 'hms-theme-v1'

// ─── Action Types ─────────────────────────────────────────────────────────────
type Action =
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'ADD_MEDICAL_RECORD'; payload: MedicalRecord }
  | { type: 'ADD_DIAGNOSIS'; payload: Diagnosis }
  | { type: 'ADD_PRESCRIPTION'; payload: Prescription }
  | { type: 'UPDATE_PRESCRIPTION'; payload: Prescription }
  | { type: 'ADD_VITAL_SIGN'; payload: VitalSign }
  | { type: 'ADD_IMMUNIZATION'; payload: Immunization }
  | { type: 'ADD_LAB_TEST'; payload: LabTest }
  | { type: 'UPDATE_LAB_TEST'; payload: LabTest }
  | { type: 'ADD_LAB_RESULT'; payload: LabResult }
  | { type: 'ADD_MEDICINE'; payload: Medicine }
  | { type: 'UPDATE_MEDICINE'; payload: Medicine }
  | { type: 'ADD_DISPENSE'; payload: PrescriptionDispense }
  | { type: 'ADD_RADIOLOGY_REQUEST'; payload: RadiologyRequest }
  | { type: 'UPDATE_RADIOLOGY_REQUEST'; payload: RadiologyRequest }
  | { type: 'ADD_RADIOLOGY_REPORT'; payload: RadiologyReport }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'ADD_INSURANCE_POLICY'; payload: InsurancePolicy }
  | { type: 'ADD_INSURANCE_CLAIM'; payload: InsuranceClaim }
  | { type: 'UPDATE_INSURANCE_CLAIM'; payload: InsuranceClaim }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'ADD_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'ADD_BLOOD_DONOR'; payload: BloodDonor }
  | { type: 'ADD_BLOOD_UNIT'; payload: BloodUnit }
  | { type: 'UPDATE_BLOOD_UNIT'; payload: BloodUnit }
  | { type: 'ADD_BLOOD_REQUEST'; payload: BloodRequest }
  | { type: 'UPDATE_BLOOD_REQUEST'; payload: BloodRequest }
  | { type: 'ADD_SURGERY'; payload: Surgery }
  | { type: 'UPDATE_SURGERY'; payload: Surgery }
  | { type: 'ADD_EMERGENCY_CASE'; payload: EmergencyCase }
  | { type: 'UPDATE_EMERGENCY_CASE'; payload: EmergencyCase }
  | { type: 'ADD_AMBULANCE'; payload: Ambulance }
  | { type: 'ADD_MATERNITY_RECORD'; payload: MaternityRecord }
  | { type: 'UPDATE_MATERNITY_RECORD'; payload: MaternityRecord }
  | { type: 'ADD_TELEMEDICINE_SESSION'; payload: TelemedicineSession }
  | { type: 'UPDATE_TELEMEDICINE_SESSION'; payload: TelemedicineSession }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLog }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'ADD_STAFF'; payload: Staff }
  | { type: 'UPDATE_STAFF'; payload: Staff }
  | { type: 'ADD_DOCTOR'; payload: Doctor }
  | { type: 'ADD_NURSE'; payload: Nurse }
  | { type: 'ADD_WARD'; payload: Ward }
  | { type: 'ADD_BED'; payload: Bed }
  | { type: 'UPDATE_BED'; payload: Bed }
  | { type: 'ADD_ADMISSION'; payload: Admission }
  | { type: 'UPDATE_ADMISSION'; payload: Admission }
  | { type: 'ADD_USER_ACCOUNT'; payload: UserAccount }
  | { type: 'UPDATE_USER_ACCOUNT'; payload: UserAccount }
  | { type: 'UPDATE_STAFF_PROFILE'; payload: { userId: string; profile: StaffProfile } }
   | { type: 'ADD_STELLAR_PAYMENT'; payload: StellarPayment }
   | { type: 'UPDATE_STELLAR_PAYMENT'; payload: StellarPayment }
   | { type: 'ADD_CENTRAL_RECORD'; payload: CentralRecord }
   | { type: 'UPDATE_CENTRAL_RECORD'; payload: CentralRecord }
   | { type: 'LOAD_STATE'; payload: HMSState }

function reducer(state: HMSState, action: Action): HMSState {
  switch (action.type) {
    case 'LOAD_STATE': return action.payload
    case 'ADD_PATIENT': return { ...state, patients: [action.payload, ...state.patients] }
    case 'UPDATE_PATIENT': return { ...state, patients: state.patients.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'ADD_APPOINTMENT': return { ...state, appointments: [action.payload, ...state.appointments] }
    case 'UPDATE_APPOINTMENT': return { ...state, appointments: state.appointments.map(a => a.id === action.payload.id ? action.payload : a) }
    case 'ADD_MEDICAL_RECORD': return { ...state, medicalRecords: [action.payload, ...state.medicalRecords] }
    case 'ADD_DIAGNOSIS': return { ...state, diagnoses: [action.payload, ...state.diagnoses] }
    case 'ADD_PRESCRIPTION': return { ...state, prescriptions: [action.payload, ...state.prescriptions] }
    case 'UPDATE_PRESCRIPTION': return { ...state, prescriptions: state.prescriptions.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'ADD_VITAL_SIGN': return { ...state, vitalSigns: [action.payload, ...state.vitalSigns] }
    case 'ADD_IMMUNIZATION': return { ...state, immunizations: [action.payload, ...state.immunizations] }
    case 'ADD_LAB_TEST': return { ...state, labTests: [action.payload, ...state.labTests] }
    case 'UPDATE_LAB_TEST': return { ...state, labTests: state.labTests.map(t => t.id === action.payload.id ? action.payload : t) }
    case 'ADD_LAB_RESULT': return { ...state, labResults: [action.payload, ...state.labResults] }
    case 'ADD_MEDICINE': return { ...state, medicines: [action.payload, ...state.medicines] }
    case 'UPDATE_MEDICINE': return { ...state, medicines: state.medicines.map(m => m.id === action.payload.id ? action.payload : m) }
    case 'ADD_DISPENSE': return { ...state, dispenses: [action.payload, ...state.dispenses] }
    case 'ADD_RADIOLOGY_REQUEST': return { ...state, radiologyRequests: [action.payload, ...state.radiologyRequests] }
    case 'UPDATE_RADIOLOGY_REQUEST': return { ...state, radiologyRequests: state.radiologyRequests.map(r => r.id === action.payload.id ? action.payload : r) }
    case 'ADD_RADIOLOGY_REPORT': return { ...state, radiologyReports: [action.payload, ...state.radiologyReports] }
    case 'ADD_INVOICE': return { ...state, invoices: [action.payload, ...state.invoices] }
    case 'UPDATE_INVOICE': return { ...state, invoices: state.invoices.map(i => i.id === action.payload.id ? action.payload : i) }
    case 'ADD_PAYMENT': return { ...state, payments: [action.payload, ...state.payments] }
    case 'ADD_INSURANCE_POLICY': return { ...state, insurancePolicies: [action.payload, ...state.insurancePolicies] }
    case 'ADD_INSURANCE_CLAIM': return { ...state, insuranceClaims: [action.payload, ...state.insuranceClaims] }
    case 'UPDATE_INSURANCE_CLAIM': return { ...state, insuranceClaims: state.insuranceClaims.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'ADD_EXPENSE': return { ...state, expenses: [action.payload, ...state.expenses] }
    case 'ADD_INVENTORY_ITEM': return { ...state, inventoryItems: [action.payload, ...state.inventoryItems] }
    case 'UPDATE_INVENTORY_ITEM': return { ...state, inventoryItems: state.inventoryItems.map(i => i.id === action.payload.id ? action.payload : i) }
    case 'ADD_SUPPLIER': return { ...state, suppliers: [action.payload, ...state.suppliers] }
    case 'ADD_BLOOD_DONOR': return { ...state, bloodDonors: [action.payload, ...state.bloodDonors] }
    case 'ADD_BLOOD_UNIT': return { ...state, bloodUnits: [action.payload, ...state.bloodUnits] }
    case 'UPDATE_BLOOD_UNIT': return { ...state, bloodUnits: state.bloodUnits.map(b => b.id === action.payload.id ? action.payload : b) }
    case 'ADD_BLOOD_REQUEST': return { ...state, bloodRequests: [action.payload, ...state.bloodRequests] }
    case 'UPDATE_BLOOD_REQUEST': return { ...state, bloodRequests: state.bloodRequests.map(r => r.id === action.payload.id ? action.payload : r) }
    case 'ADD_SURGERY': return { ...state, surgeries: [action.payload, ...state.surgeries] }
    case 'UPDATE_SURGERY': return { ...state, surgeries: state.surgeries.map(s => s.id === action.payload.id ? action.payload : s) }
    case 'ADD_EMERGENCY_CASE': return { ...state, emergencyCases: [action.payload, ...state.emergencyCases] }
    case 'UPDATE_EMERGENCY_CASE': return { ...state, emergencyCases: state.emergencyCases.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'ADD_AMBULANCE': return { ...state, ambulances: [action.payload, ...state.ambulances] }
    case 'ADD_MATERNITY_RECORD': return { ...state, maternityRecords: [action.payload, ...state.maternityRecords] }
    case 'UPDATE_MATERNITY_RECORD': return { ...state, maternityRecords: state.maternityRecords.map(m => m.id === action.payload.id ? action.payload : m) }
    case 'ADD_TELEMEDICINE_SESSION': return { ...state, telemedicineSessions: [action.payload, ...state.telemedicineSessions] }
    case 'UPDATE_TELEMEDICINE_SESSION': return { ...state, telemedicineSessions: state.telemedicineSessions.map(s => s.id === action.payload.id ? action.payload : s) }
    case 'ADD_NOTIFICATION': return { ...state, notifications: [action.payload, ...state.notifications] }
    case 'MARK_NOTIFICATION_READ': return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, status: 'Read' as const } : n) }
    case 'ADD_AUDIT_LOG': return { ...state, auditLogs: [action.payload, ...state.auditLogs] }
    case 'ADD_DOCUMENT': return { ...state, documents: [action.payload, ...state.documents] }
    case 'ADD_STAFF': return { ...state, staff: [action.payload, ...state.staff] }
    case 'UPDATE_STAFF': return { ...state, staff: state.staff.map(s => s.id === action.payload.id ? action.payload : s) }
    case 'ADD_DOCTOR': return { ...state, doctors: [action.payload, ...state.doctors] }
    case 'ADD_NURSE': return { ...state, nurses: [action.payload, ...state.nurses] }
    case 'ADD_WARD': return { ...state, wards: [action.payload, ...state.wards] }
    case 'ADD_BED': return { ...state, beds: [action.payload, ...state.beds] }
    case 'UPDATE_BED': return { ...state, beds: state.beds.map(b => b.id === action.payload.id ? action.payload : b) }
    case 'ADD_ADMISSION': return { ...state, admissions: [action.payload, ...state.admissions] }
    case 'UPDATE_ADMISSION': return { ...state, admissions: state.admissions.map(a => a.id === action.payload.id ? action.payload : a) }
    case 'ADD_USER_ACCOUNT': return { ...state, userAccounts: [action.payload, ...state.userAccounts] }
    case 'UPDATE_USER_ACCOUNT': return { ...state, userAccounts: state.userAccounts.map(u => u.id === action.payload.id ? action.payload : u) }
    case 'UPDATE_STAFF_PROFILE': return {
      ...state,
      userAccounts: state.userAccounts.map(u =>
        u.id === action.payload.userId ? { ...u, staffProfile: action.payload.profile } : u
      ),
    }
     case 'ADD_STELLAR_PAYMENT': return { ...state, stellarPayments: [action.payload, ...state.stellarPayments] }
     case 'UPDATE_STELLAR_PAYMENT': return { ...state, stellarPayments: state.stellarPayments.map(p => p.id === action.payload.id ? action.payload : p) }
     case 'ADD_CENTRAL_RECORD': return { ...state, centralRecords: [action.payload, ...state.centralRecords] }
     case 'UPDATE_CENTRAL_RECORD': return { ...state, centralRecords: state.centralRecords.map(record => record.id === action.payload.id ? action.payload : record) }
     default: return state
  }
}

// ─── Signup ───────────────────────────────────────────────────────────────────
export interface SignupData {
  name: string
  username: string
  email: string
  phone: string
  password: string
  role: UserAccount['role']
  department: string
  branchId: string
}

// ─── Context shape ────────────────────────────────────────────────────────────
interface HMSContextValue {
  state: HMSState
  dispatch: React.Dispatch<Action>
  currentUser: UserAccount | null
  setCurrentUser: (u: UserAccount | null) => void
  login: (username: string, password: string) => boolean
  logout: () => void
  signup: (data: SignupData) => { ok: boolean; error?: string }
  activeModule: ModuleKey
  setActiveModule: (m: ModuleKey) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
   addAuditLog: (action: string, module: string, target: string) => void
   nextId: (prefix: string, list: { id: string }[]) => string
   addCentralRecord: (record: Omit<CentralRecord, 'id' | 'submittedAt'>) => void
   updateCentralRecord: (record: CentralRecord) => void
 }

const HMSContext = createContext<HMSContextValue | null>(null)

export function HMSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialHMSState)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard')
  const [loaded, setLoaded] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      return stored === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  // Load persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as HMSState
        // ensure stellarPayments exists for older stored states
        if (!parsed.stellarPayments) parsed.stellarPayments = []
        dispatch({ type: 'LOAD_STATE', payload: parsed })
      }
      // Do not auto-restore authentication on page load. Require users to sign in
      // explicitly so the LoginPage is shown first when the site opens.
      // The saved auth remains in localStorage for optional future use.
    } catch { /* ignore corrupt storage */ }
    setLoaded(true)
  }, [])

  // Persist state changes
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, loaded])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  function login(username: string, password: string): boolean {
    const allAccounts = [...state.userAccounts, ...seedUserAccounts]
    // deduplicate by username (state takes priority)
    const seen = new Set<string>()
    const accounts = allAccounts.filter(u => {
      if (seen.has(u.username.toLowerCase())) return false
      seen.add(u.username.toLowerCase())
      return true
    })
    const found = accounts.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )
    if (!found) return false
    // refresh from state if exists (picks up profile edits)
    const fresh = state.userAccounts.find(u => u.id === found.id) ?? found
    setCurrentUser(fresh)
    setActiveModule(roleDefaultModule(fresh.role))
    localStorage.setItem(AUTH_KEY, JSON.stringify(fresh))
    // audit log after currentUser is set via useEffect would be async, call directly
    const log: AuditLog = {
      id: `AUD-${Date.now()}`,
      userId: fresh.id,
      userName: fresh.username,
      role: fresh.role,
      action: 'LOGIN',
      module: 'Auth',
      target: 'System',
      ipAddress: '192.168.1.x',
      timestamp: new Date().toISOString(),
      result: 'Success',
    }
    dispatch({ type: 'ADD_AUDIT_LOG', payload: log })
    return true
  }

  function logout() {
    setCurrentUser(null)
    setActiveModule('dashboard')
    localStorage.removeItem(AUTH_KEY)
  }

  function toggleTheme() {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  function signup(data: SignupData): { ok: boolean; error?: string } {
    const allAccounts = [...state.userAccounts, ...seedUserAccounts]
    const exists = allAccounts.find(u => u.username.toLowerCase() === data.username.toLowerCase())
    if (exists) return { ok: false, error: 'Username already taken. Choose a different one.' }
    const emailExists = allAccounts.find(u => u.email.toLowerCase() === data.email.toLowerCase())
    if (emailExists) return { ok: false, error: 'Email address already registered.' }

    const newUser: UserAccount = {
      id: `USR-${Date.now()}`,
      username: data.username.trim(),
      password: data.password,
      role: data.role,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      department: data.department.trim(),
      lastLogin: '',
      isActive: true,
      mfaEnabled: false,
      branchId: data.branchId,
      createdAt: new Date().toISOString(),
      staffProfile: {
        bio: '',
        specialization: '',
        officeLocation: '',
        workPhone: data.phone,
        emergencyContact: '',
        notes: '',
        stellarAddress: '',
      },
    }
    dispatch({ type: 'ADD_USER_ACCOUNT', payload: newUser })
    setCurrentUser(newUser)
    setActiveModule(roleDefaultModule(newUser.role))
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser))
    // also add to staff list
    const newStaff: Staff = {
      id: `STF-${Date.now()}`,
      employeeId: `EMP-${Date.now()}`,
      name: data.name.trim(),
      role: data.role,
      department: data.department.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      hireDate: new Date().toISOString().slice(0, 10),
      salary: 0,
      attendance: 'Present',
      status: 'Active',
      branchId: data.branchId,
    }
    dispatch({ type: 'ADD_STAFF', payload: newStaff })
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: `AUD-${Date.now()}`,
        userId: newUser.id,
        userName: newUser.username,
        role: newUser.role,
        action: 'SIGNUP',
        module: 'Auth',
        target: 'System',
        ipAddress: '192.168.1.x',
        timestamp: new Date().toISOString(),
        result: 'Success',
      },
    })
    return { ok: true }
  }

  function addAuditLog(action: string, module: string, target: string) {
    if (!currentUser) return
    const log: AuditLog = {
      id: `AUD-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.username,
      role: currentUser.role,
      action,
      module,
      target,
      ipAddress: '192.168.1.x',
      timestamp: new Date().toISOString(),
      result: 'Success',
    }
    dispatch({ type: 'ADD_AUDIT_LOG', payload: log })
  }

   function nextId(prefix: string, list: { id: string }[]): string {
     return `${prefix}-${String(list.length + 1).padStart(3, '0')}-${Date.now().toString(36).toUpperCase().slice(-4)}`
   }

   function addCentralRecord(record: Omit<CentralRecord, 'id' | 'submittedAt'>) {
     const centralRecord: CentralRecord = {
       ...record,
       id: `CR-${Date.now()}`,
       submittedAt: new Date().toISOString(),
     }
     dispatch({ type: 'ADD_CENTRAL_RECORD', payload: centralRecord })
   }

   function updateCentralRecord(record: CentralRecord) {
     dispatch({ type: 'UPDATE_CENTRAL_RECORD', payload: record })
   }

   return (
     <HMSContext.Provider value={{ state, dispatch, currentUser, setCurrentUser, login, logout, signup, activeModule, setActiveModule, theme, toggleTheme, addAuditLog, nextId, addCentralRecord, updateCentralRecord }}>
      {children}
    </HMSContext.Provider>
  )
}

export function useHMS(): HMSContextValue {
  const ctx = useContext(HMSContext)
  if (!ctx) throw new Error('useHMS must be used within HMSProvider')
  return ctx
}

function roleDefaultModule(role: UserAccount['role']): ModuleKey {
  switch (role) {
    case 'Doctor': return 'emr'
    case 'Nurse': return 'inpatient'
    case 'Pharmacist': return 'pharmacy'
    case 'Cashier': return 'billing'
    case 'LabTechnician': return 'laboratory'
    case 'Radiologist': return 'radiology'
    case 'Receptionist': return 'patients'
    case 'Patient': return 'portal'
    default: return 'dashboard'
  }
}

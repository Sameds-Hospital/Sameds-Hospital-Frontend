// ─── Core Roles & Auth ───────────────────────────────────────────────────────

export type Role =
  | 'Admin'
  | 'Doctor'
  | 'Nurse'
  | 'Receptionist'
  | 'Pharmacist'
  | 'Cashier'
  | 'LabTechnician'
  | 'Radiologist'
  | 'Patient'

export interface StaffProfile {
  bio: string
  specialization: string
  officeLocation: string
  workPhone: string
  emergencyContact: string
  notes: string          // private — only visible to that staff member
  stellarAddress: string // XLM wallet for payroll / personal use
}

export interface UserAccount {
  id: string
  username: string
  password: string
  role: Role
  name: string
  email: string
  phone: string
  department: string
  lastLogin: string
  isActive: boolean
  mfaEnabled: boolean
  branchId: string
  staffProfile: StaffProfile
  createdAt: string
}

// ─── Stellar / XLM ───────────────────────────────────────────────────────────

export interface StellarPayment {
  id: string
  invoiceId: string
  patientId: string
  patientName: string
  amountXLM: string
  amountUSD: string
  xlmToUSDRate: string
  senderAddress: string
  receiverAddress: string
  memo: string
  txHash: string
  network: 'testnet' | 'mainnet'
  status: 'Pending' | 'Submitted' | 'Confirmed' | 'Failed'
  createdAt: string
  confirmedAt: string
}

// ─── Organisation ─────────────────────────────────────────────────────────────

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email: string
  timezone: string
  status: 'Active' | 'Inactive'
}

export interface Department {
  id: string
  name: string
  head: string
  floor: string
  phone: string
  branchId: string
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export interface Staff {
  id: string
  employeeId: string
  name: string
  role: Role
  department: string
  email: string
  phone: string
  hireDate: string
  salary: number
  attendance: 'Present' | 'Absent' | 'Leave'
  status: 'Active' | 'Inactive'
  branchId: string
}

export interface Doctor {
  id: string
  staffId: string
  name: string
  specialty: string
  department: string
  license: string
  phone: string
  email: string
  qualification: string
  experience: number
  status: 'Active' | 'On call' | 'Away'
  consultationFee: number
}

export interface Nurse {
  id: string
  staffId: string
  name: string
  department: string
  ward: string
  shift: 'Day' | 'Night' | 'Off'
  registration: string
  phone: string
  status: 'Active' | 'Off duty'
}

// ─── Patient ──────────────────────────────────────────────────────────────────

export interface Patient {
   id: string
   barcode: string
   name: string
   age: number
   dob: string
   gender: 'Male' | 'Female' | 'Other'
   bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
   phone: string
   email: string
   address: string
   emergencyContact: string
   emergencyPhone: string
   allergies: string
   insuranceId: string
   branchId: string
   registeredAt: string
   status: 'Active' | 'In review' | 'Admitted' | 'Discharged' | 'Emergency'
   userId?: string
   assignedDoctorId?: string
   assignedDoctorName?: string
   assignedNurseId?: string
   assignedNurseName?: string
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  department: string
  date: string
  time: string
  type: 'Consultation' | 'Follow-up' | 'Lab' | 'Scan' | 'Procedure'
  priority: 'Routine' | 'Urgent' | 'Emergency'
  notes: string
  status: 'Booked' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show'
}

// ─── Admissions & Ward ────────────────────────────────────────────────────────

export interface Ward {
  id: string
  name: string
  department: string
  floor: string
  capacity: number
  type: 'General' | 'ICU' | 'Pediatric' | 'Maternity' | 'Surgical' | 'Isolation'
}

export interface Bed {
  id: string
  wardId: string
  wardName: string
  room: string
  number: string
  type: 'General' | 'ICU' | 'Isolation'
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance'
}

export interface Admission {
  id: string
  patientId: string
  patientName: string
  wardId: string
  wardName: string
  bedId: string
  bedNumber: string
  attendingDoctor: string
  diagnosis: string
  admittedAt: string
  dischargePlanned: string
  dischargedAt: string
  nursingNotes: string
  status: 'Admitted' | 'Discharged' | 'Transferred'
}

// ─── EMR ──────────────────────────────────────────────────────────────────────

export interface MedicalRecord {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  visitType: 'OPD' | 'IPD' | 'Emergency' | 'Telemedicine'
  chiefComplaint: string
  diagnosis: string
  treatment: string
  vitals: string
  clinicalNotes: string
  followUpDate: string
  createdAt: string
  attachments?: string[]
}

export interface Diagnosis {
  id: string
  patientId: string
  recordId: string
  doctorName: string
  icdCode: string
  description: string
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical'
  recordedAt: string
  status: 'Active' | 'Resolved' | 'Chronic'
}

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  prescribedAt: string
  status: 'Active' | 'Dispensed' | 'Completed' | 'Cancelled'
}

export interface VitalSign {
  id: string
  patientId: string
  recordedBy: string
  temperature: string
  bloodPressure: string
  heartRate: string
  respiratoryRate: string
  oxygenSaturation: string
  weight: string
  height: string
  recordedAt: string
}

export interface Immunization {
  id: string
  patientId: string
  patientName: string
  vaccine: string
  dose: string
  administeredBy: string
  site: string
  lotNumber: string
  administeredAt: string
  nextDueDate: string
  status: 'Administered' | 'Due' | 'Overdue'
}

// ─── Laboratory ───────────────────────────────────────────────────────────────

export interface LabTest {
  id: string
  patientId: string
  patientName: string
  requestedBy: string
  testName: string
  category: string
  priority: 'Routine' | 'Urgent' | 'STAT'
  sampleType: string
  collectedAt: string
  status: 'Requested' | 'Sample Collected' | 'In Progress' | 'Completed' | 'Cancelled'
}

export interface LabResult {
  id: string
  testId: string
  patientId: string
  patientName: string
  testName: string
  result: string
  unit: string
  referenceRange: string
  abnormal: boolean
  remarks: string
  reportedBy: string
  reportedAt: string
}

// ─── Pharmacy ─────────────────────────────────────────────────────────────────

export interface Medicine {
  id: string
  name: string
  genericName: string
  brand: string
  category: string
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Drops' | 'Inhaler'
  dosage: string
  unit: string
  stock: number
  reorderLevel: number
  expiryDate: string
  supplier: string
  purchasePrice: number
  sellingPrice: number
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired'
}

export interface PrescriptionDispense {
  id: string
  prescriptionId: string
  patientId: string
  patientName: string
  medicineId: string
  medicineName: string
  quantity: number
  dispensedBy: string
  dispensedAt: string
  status: 'Pending' | 'Dispensed' | 'Partially Dispensed'
}

// ─── Radiology ────────────────────────────────────────────────────────────────

export interface RadiologyRequest {
  id: string
  patientId: string
  patientName: string
  requestedBy: string
  examType: 'X-ray' | 'CT Scan' | 'MRI' | 'Ultrasound' | 'PET Scan' | 'Mammography'
  bodyPart: string
  priority: 'Routine' | 'Urgent' | 'STAT'
  clinicalInfo: string
  scheduledAt: string
  status: 'Requested' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
}

export interface RadiologyReport {
  id: string
  requestId: string
  patientId: string
  patientName: string
  examType: string
  findings: string
  impression: string
  recommendation: string
  reportedBy: string
  reportedAt: string
}

// ─── Billing & Finance ────────────────────────────────────────────────────────

export interface Invoice {
  id: string
  patientId: string
  patientName: string
  department: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  insuranceCoverage: number
  amountDue: number
  currency: string
  status: 'Draft' | 'Issued' | 'Paid' | 'Partial' | 'Overdue' | 'Cancelled'
  issuedAt: string
  dueAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Payment {
  id: string
  invoiceId: string
  patientId: string
  patientName: string
  amount: number
  method: 'Cash' | 'Card' | 'Bank Transfer' | 'Insurance' | 'Stellar/XLM'
  reference: string
  processedBy: string
  paidAt: string
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded'
}

export interface InsurancePolicy {
  id: string
  provider: string
  patientId: string
  patientName: string
  policyNumber: string
  groupNumber: string
  coverageType: string
  coverageLimit: number
  deductible: number
  copay: number
  validFrom: string
  validTo: string
  status: 'Active' | 'Expired' | 'Suspended' | 'Pending'
}

export interface InsuranceClaim {
  id: string
  policyId: string
  patientId: string
  patientName: string
  invoiceId: string
  provider: string
  claimAmount: number
  approvedAmount: number
  submittedAt: string
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid'
}

export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  department: string
  paidTo: string
  approvedBy: string
  date: string
  status: 'Pending' | 'Approved' | 'Paid'
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string
  name: string
  category: 'Medical Supply' | 'Equipment' | 'PPE' | 'Consumable' | 'Furniture'
  quantity: number
  unit: string
  reorderLevel: number
  location: string
  supplier: string
  unitCost: number
  lastRestocked: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

export interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  category: string
  items: string
  rating: number
  status: 'Active' | 'Inactive'
}

// ─── Blood Bank ───────────────────────────────────────────────────────────────

export interface BloodDonor {
  id: string
  name: string
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  phone: string
  email: string
  lastDonated: string
  totalDonations: number
  status: 'Eligible' | 'Deferred' | 'Inactive'
}

export interface BloodUnit {
  id: string
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  component: 'Whole Blood' | 'RBC' | 'Plasma' | 'Platelets' | 'Cryoprecipitate'
  donorId: string
  donorName: string
  collectedAt: string
  expiryDate: string
  bagNumber: string
  status: 'Available' | 'Reserved' | 'Issued' | 'Expired' | 'Discarded'
}

export interface BloodRequest {
  id: string
  patientId: string
  patientName: string
  bloodType: string
  component: string
  unitsRequired: number
  requestedBy: string
  requestedAt: string
  urgency: 'Routine' | 'Urgent' | 'Emergency'
  status: 'Pending' | 'Approved' | 'Issued' | 'Completed' | 'Rejected'
}

// ─── Operation Theatre ────────────────────────────────────────────────────────

export interface Surgery {
  id: string
  patientId: string
  patientName: string
  procedure: string
  surgeonId: string
  surgeonName: string
  anesthetist: string
  otRoom: string
  scheduledAt: string
  duration: string
  preOpNotes: string
  postOpNotes: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Postponed'
}

// ─── Emergency ────────────────────────────────────────────────────────────────

export interface EmergencyCase {
  id: string
  patientId: string
  patientName: string
  arrivalMode: 'Walk-in' | 'Ambulance' | 'Referred' | 'Police'
  triageLevel: 'P1 - Critical' | 'P2 - Urgent' | 'P3 - Less Urgent' | 'P4 - Non-urgent'
  chiefComplaint: string
  attendingDoctor: string
  treatmentStarted: string
  disposition: 'Admitted' | 'Discharged' | 'Transferred' | 'Deceased' | 'Pending'
  notes: string
  registeredAt: string
}

export interface Ambulance {
  id: string
  vehicleNumber: string
  driver: string
  paramedic: string
  patientId: string
  patientName: string
  pickup: string
  destination: string
  dispatchedAt: string
  arrivedAt: string
  status: 'Available' | 'Dispatched' | 'En Route' | 'At Scene' | 'Returning'
}

// ─── Maternity ────────────────────────────────────────────────────────────────

export interface MaternityRecord {
  id: string
  patientId: string
  patientName: string
  lmp: string
  edd: string
  gravida: number
  para: number
  gestationalAge: string
  riskLevel: 'Low' | 'Medium' | 'High'
  attendingOb: string
  antenatalVisits: number
  deliveryType: 'Normal' | 'C-Section' | 'Assisted' | 'Pending'
  deliveredAt: string
  babyWeight: string
  babyGender: 'Male' | 'Female' | 'Unknown'
  status: 'Antenatal' | 'In Labour' | 'Postnatal' | 'Discharged'
}

// ─── Telemedicine ─────────────────────────────────────────────────────────────

export interface TelemedicineSession {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  scheduledAt: string
  platform: 'Video Call' | 'Phone Call' | 'Chat'
  chiefComplaint: string
  notes: string
  prescriptionIssued: boolean
  duration: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Missed'
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  recipient: string
  recipientId: string
  channel: 'SMS' | 'Email' | 'In-app'
  type: 'Appointment' | 'Lab Result' | 'Prescription' | 'Billing' | 'Emergency' | 'General'
  subject: string
  body: string
  sentAt: string
  status: 'Sent' | 'Pending' | 'Failed' | 'Read'
}

// ─── Audit & Documents ────────────────────────────────────────────────────────

export interface AuditLog {
  id: string
  userId: string
  userName: string
  role: Role
  action: string
  module: string
  target: string
  ipAddress: string
  timestamp: string
  result: 'Success' | 'Failed' | 'Warning'
}

export interface Document {
  id: string
  patientId: string
  patientName: string
  title: string
  type: 'Lab Report' | 'Scan' | 'Consent Form' | 'Discharge Summary' | 'Referral' | 'Insurance'
  fileName: string
  uploadedBy: string
  uploadedAt: string
  size: string
   status: 'Active' | 'Archived'
 }

// ─── Central Database ──────────────────────────────────

export interface CentralRecord {
   id: string
   patientId: string
   patientName: string
   patientBarcode: string
   recordType: 'MedicalRecord' | 'Appointment' | 'Invoice' | 'LabResult' | 'Prescription' | 'Diagnosis' | 'VitalSign' | 'Admission' | 'Document'
   recordId: string
   summary: string
   submittedBy: string
   submittedByName: string
   submittedAt: string
   branchId: string
   isShared: boolean
 }

// ─── HMS App State ────────────────────────────────────────────────────────────

export interface HMSState {
  branches: Branch[]
  departments: Department[]
  staff: Staff[]
  doctors: Doctor[]
  nurses: Nurse[]
  userAccounts: UserAccount[]
  patients: Patient[]
  appointments: Appointment[]
  wards: Ward[]
  beds: Bed[]
  admissions: Admission[]
  medicalRecords: MedicalRecord[]
  diagnoses: Diagnosis[]
  prescriptions: Prescription[]
  vitalSigns: VitalSign[]
  immunizations: Immunization[]
  labTests: LabTest[]
  labResults: LabResult[]
  medicines: Medicine[]
  dispenses: PrescriptionDispense[]
  radiologyRequests: RadiologyRequest[]
  radiologyReports: RadiologyReport[]
  invoices: Invoice[]
  payments: Payment[]
  insurancePolicies: InsurancePolicy[]
  insuranceClaims: InsuranceClaim[]
  expenses: Expense[]
  inventoryItems: InventoryItem[]
  suppliers: Supplier[]
  bloodDonors: BloodDonor[]
  bloodUnits: BloodUnit[]
  bloodRequests: BloodRequest[]
  surgeries: Surgery[]
  emergencyCases: EmergencyCase[]
  ambulances: Ambulance[]
  maternityRecords: MaternityRecord[]
  telemedicineSessions: TelemedicineSession[]
  notifications: Notification[]
  auditLogs: AuditLog[]
   documents: Document[]
   stellarPayments: StellarPayment[]
   centralRecords: CentralRecord[]
 }

export type ModuleKey =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'doctors'
  | 'emr'
  | 'laboratory'
  | 'pharmacy'
  | 'billing'
  | 'inpatient'
  | 'staff'
  | 'inventory'
  | 'radiology'
  | 'insurance'
  | 'financials'
  | 'reports'
  | 'security'
  | 'notifications'
  | 'emergency'
  | 'bloodbank'
  | 'ot'
  | 'maternity'
  | 'telemedicine'
  | 'documents'
  | 'audit'
  | 'portal'
  | 'settings'
   | 'myprofile'
   | 'stellarbilling'
  | 'wallet'
  | 'onduty'
   | 'centraldb'


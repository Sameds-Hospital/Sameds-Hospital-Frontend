import type {
  Branch, Department, Staff, Doctor, Nurse, UserAccount,
  Patient, Appointment, Ward, Bed, Admission,
  MedicalRecord, Diagnosis, Prescription, VitalSign, Immunization,
  LabTest, LabResult, Medicine, PrescriptionDispense,
  RadiologyRequest, RadiologyReport,
  Invoice, Payment, InsurancePolicy, InsuranceClaim, Expense,
  InventoryItem, Supplier,
  BloodDonor, BloodUnit, BloodRequest,
  Surgery, EmergencyCase, Ambulance,
  MaternityRecord, TelemedicineSession,
  Notification, AuditLog, Document, StellarPayment, CentralRecord,
} from '../types'

// ─── Branches ─────────────────────────────────────────────────────────────────
export const seedBranches: Branch[] = [
  { id: 'BR-001', name: 'Main Campus – Accra', address: '14 Hospital Road, Accra', phone: '+233 30 277 1000', email: 'main@gmail.com', timezone: 'Africa/Accra', status: 'Active' },
  { id: 'BR-002', name: 'Kumasi Annex', address: '22 Ashanti Ring Road, Kumasi', phone: '+233 32 201 4500', email: 'kumasi@gmail.com', timezone: 'Africa/Accra', status: 'Active' },
]

// ─── Departments ──────────────────────────────────────────────────────────────
export const seedDepartments: Department[] = [
  { id: 'DEP-01', name: 'General Medicine', head: 'Dr. Kofi Mensah', floor: '2', phone: '+233 30 277 1010', branchId: 'BR-001' },
  { id: 'DEP-02', name: 'Surgery', head: 'Dr. Ama Boateng', floor: '3', phone: '+233 30 277 1020', branchId: 'BR-001' },
  { id: 'DEP-03', name: 'Pediatrics', head: 'Dr. Yaw Asante', floor: '1', phone: '+233 30 277 1030', branchId: 'BR-001' },
  { id: 'DEP-04', name: 'Obstetrics & Gynecology', head: 'Dr. Akosua Dankwa', floor: '4', phone: '+233 30 277 1040', branchId: 'BR-001' },
  { id: 'DEP-05', name: 'Radiology', head: 'Dr. Nana Appiah', floor: 'B1', phone: '+233 30 277 1050', branchId: 'BR-001' },
  { id: 'DEP-06', name: 'Laboratory', head: 'Dr. Kweku Agyei', floor: 'B1', phone: '+233 30 277 1060', branchId: 'BR-001' },
  { id: 'DEP-07', name: 'Pharmacy', head: 'Pharm. Grace Tetteh', floor: 'G', phone: '+233 30 277 1070', branchId: 'BR-001' },
  { id: 'DEP-08', name: 'Emergency', head: 'Dr. Samuel Owusu', floor: 'G', phone: '+233 30 277 1080', branchId: 'BR-001' },
  { id: 'DEP-09', name: 'Cardiology', head: 'Dr. Abena Frimpong', floor: '2', phone: '+233 30 277 1090', branchId: 'BR-001' },
  { id: 'DEP-10', name: 'ICU', head: 'Dr. Kwame Darko', floor: '3', phone: '+233 30 277 1100', branchId: 'BR-001' },
]

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const seedDoctors: Doctor[] = [
  { id: 'DOC-001', staffId: 'STF-001', name: 'Dr. Kofi Mensah', specialty: 'Internal Medicine', department: 'General Medicine', license: 'GH-MED-4421', phone: '+233 24 500 1001', email: 'k.mensah@gmail.com', qualification: 'MBChB, FGCP', experience: 14, status: 'Active', consultationFee: 80 },
  { id: 'DOC-002', staffId: 'STF-002', name: 'Dr. Ama Boateng', specialty: 'General Surgery', department: 'Surgery', license: 'GH-MED-3387', phone: '+233 24 500 1002', email: 'a.boateng@gmail.com', qualification: 'MBChB, FWACS', experience: 11, status: 'Active', consultationFee: 120 },
  { id: 'DOC-003', staffId: 'STF-003', name: 'Dr. Yaw Asante', specialty: 'Pediatrics', department: 'Pediatrics', license: 'GH-MED-5512', phone: '+233 24 500 1003', email: 'y.asante@gmail.com', qualification: 'MBChB, DCH', experience: 9, status: 'On call', consultationFee: 90 },
  { id: 'DOC-004', staffId: 'STF-004', name: 'Dr. Akosua Dankwa', specialty: 'Obstetrics & Gynecology', department: 'Obstetrics & Gynecology', license: 'GH-MED-6634', phone: '+233 24 500 1004', email: 'a.dankwa@gmail.com', qualification: 'MBChB, FWACS', experience: 16, status: 'Active', consultationFee: 110 },
  { id: 'DOC-005', staffId: 'STF-005', name: 'Dr. Nana Appiah', specialty: 'Radiology', department: 'Radiology', license: 'GH-MED-7741', phone: '+233 24 500 1005', email: 'n.appiah@gmail.com', qualification: 'MBChB, FRCR', experience: 12, status: 'Active', consultationFee: 150 },
  { id: 'DOC-006', staffId: 'STF-006', name: 'Dr. Abena Frimpong', specialty: 'Cardiology', department: 'Cardiology', license: 'GH-MED-8854', phone: '+233 24 500 1006', email: 'a.frimpong@gmail.com', qualification: 'MBChB, FACC', experience: 18, status: 'Active', consultationFee: 160 },
  { id: 'DOC-007', staffId: 'STF-007', name: 'Dr. Kwame Darko', specialty: 'Critical Care', department: 'ICU', license: 'GH-MED-9967', phone: '+233 24 500 1007', email: 'k.darko@gmail.com', qualification: 'MBChB, FCCM', experience: 10, status: 'On call', consultationFee: 200 },
  { id: 'DOC-008', staffId: 'STF-008', name: 'Dr. Samuel Owusu', specialty: 'Emergency Medicine', department: 'Emergency', license: 'GH-MED-1123', phone: '+233 24 500 1008', email: 's.owusu@gmail.com', qualification: 'MBChB, FCEM', experience: 8, status: 'Active', consultationFee: 100 },
]

// ─── Nurses ───────────────────────────────────────────────────────────────────
export const seedNurses: Nurse[] = [
  { id: 'NUR-001', staffId: 'STF-011', name: 'Nurse Efua Asare', department: 'General Medicine', ward: 'Ward A', shift: 'Day', registration: 'GHN-2019-441', phone: '+233 20 600 2001', status: 'Active' },
  { id: 'NUR-002', staffId: 'STF-012', name: 'Nurse Adjoa Mensah', department: 'Pediatrics', ward: 'Ward C', shift: 'Night', registration: 'GHN-2020-552', phone: '+233 20 600 2002', status: 'Active' },
  { id: 'NUR-003', staffId: 'STF-013', name: 'Nurse Kojo Amoah', department: 'ICU', ward: 'ICU', shift: 'Day', registration: 'GHN-2018-334', phone: '+233 20 600 2003', status: 'Active' },
  { id: 'NUR-004', staffId: 'STF-014', name: 'Nurse Abena Sarpong', department: 'Obstetrics & Gynecology', ward: 'Maternity', shift: 'Night', registration: 'GHN-2021-663', phone: '+233 20 600 2004', status: 'Off duty' },
]

// ─── Staff ────────────────────────────────────────────────────────────────────
export const seedStaff: Staff[] = [
  { id: 'STF-001', employeeId: 'EMP-10001', name: 'Dr. Kofi Mensah', role: 'Doctor', department: 'General Medicine', email: 'k.mensah@gmail.com', phone: '+233 24 500 1001', hireDate: '2010-03-15', salary: 8500, attendance: 'Present', status: 'Active', branchId: 'BR-001' },
  { id: 'STF-002', employeeId: 'EMP-10002', name: 'Dr. Ama Boateng', role: 'Doctor', department: 'Surgery', email: 'a.boateng@gmail.com', phone: '+233 24 500 1002', hireDate: '2013-07-01', salary: 9000, attendance: 'Present', status: 'Active', branchId: 'BR-001' },
  { id: 'STF-003', employeeId: 'EMP-10003', name: 'Dr. Yaw Asante', role: 'Doctor', department: 'Pediatrics', email: 'y.asante@gmail.com', phone: '+233 24 500 1003', hireDate: '2015-01-20', salary: 8200, attendance: 'Present', status: 'Active', branchId: 'BR-001' },
  { id: 'STF-011', employeeId: 'EMP-10011', name: 'Nurse Efua Asare', role: 'Nurse', department: 'General Medicine', email: 'e.asare@gmail.com', phone: '+233 20 600 2001', hireDate: '2019-06-01', salary: 3200, attendance: 'Present', status: 'Active', branchId: 'BR-001' },
  { id: 'STF-012', employeeId: 'EMP-10012', name: 'Nurse Adjoa Mensah', role: 'Nurse', department: 'Pediatrics', email: 'adj.mensah@gmail.com', phone: '+233 20 600 2002', hireDate: '2020-02-15', salary: 3100, attendance: 'Absent', status: 'Active', branchId: 'BR-001' },
  { id: 'STF-020', employeeId: 'EMP-10020', name: 'Pharm. Grace Tetteh', role: 'Pharmacist', department: 'Pharmacy', email: 'g.tetteh@gmail.com', phone: '+233 20 700 3001', hireDate: '2017-09-01', salary: 5500, attendance: 'Present', status: 'Active', branchId: 'BR-001' },
  { id: 'STF-021', employeeId: 'EMP-10021', name: 'Daniel Osei', role: 'Cashier', department: 'Billing', email: 'd.osei@gmail.com', phone: '+233 20 700 3002', hireDate: '2018-11-01', salary: 2800, attendance: 'Present', status: 'Active', branchId: 'BR-001' },
  { id: 'STF-022', employeeId: 'EMP-10022', name: 'Rebecca Amponsah', role: 'Receptionist', department: 'Administration', email: 'r.amponsah@gmail.com', phone: '+233 20 700 3003', hireDate: '2021-04-01', salary: 2600, attendance: 'Present', status: 'Active', branchId: 'BR-001' },
]

const defaultProfile = { bio: '', specialization: '', officeLocation: '', workPhone: '', emergencyContact: '', notes: '', stellarAddress: '' }

// ─── User Accounts ────────────────────────────────────────────────────────────
export const seedUserAccounts: UserAccount[] = [
  { id: 'USR-001', username: 'admin', password: 'admin123', role: 'Admin', name: 'System Administrator', email: 'admin@gmail.com', phone: '+233 30 277 1000', department: 'Administration', lastLogin: '2026-08-02T08:00:00Z', isActive: true, mfaEnabled: true, branchId: 'BR-001', createdAt: '2024-01-01T00:00:00Z', staffProfile: { ...defaultProfile, bio: 'System administrator for Sameds Hospital HMS.', officeLocation: 'Admin Block', stellarAddress: 'GDEMO...ADMIN' } },
  { id: 'USR-002', username: 'doctor', password: 'doctor123', role: 'Doctor', name: 'Dr. Kofi Mensah', email: 'k.mensah@gmail.com', phone: '+233 24 500 1001', department: 'General Medicine', lastLogin: '2026-08-02T07:30:00Z', isActive: true, mfaEnabled: false, branchId: 'BR-001', createdAt: '2024-03-15T00:00:00Z', staffProfile: { ...defaultProfile, bio: 'Internal medicine specialist with 14 years experience.', specialization: 'Internal Medicine', officeLocation: 'Floor 2, Room 204', workPhone: '+233 30 277 1201', stellarAddress: 'GDEMO...DOC001' } },
  { id: 'USR-003', username: 'nurse', password: 'nurse123', role: 'Nurse', name: 'Nurse Efua Asare', email: 'e.asare@gmail.com', phone: '+233 20 600 2001', department: 'General Medicine', lastLogin: '2026-08-02T07:45:00Z', isActive: true, mfaEnabled: false, branchId: 'BR-001', createdAt: '2024-06-01T00:00:00Z', staffProfile: { ...defaultProfile, specialization: 'General Nursing', officeLocation: 'Ward A, Nursing Station', workPhone: '+233 30 277 1301' } },
  { id: 'USR-004', username: 'pharmacist', password: 'pharmacist123', role: 'Pharmacist', name: 'Pharm. Grace Tetteh', email: 'g.tetteh@gmail.com', phone: '+233 20 700 3001', department: 'Pharmacy', lastLogin: '2026-08-01T09:00:00Z', isActive: true, mfaEnabled: false, branchId: 'BR-001', createdAt: '2024-09-01T00:00:00Z', staffProfile: { ...defaultProfile, specialization: 'Clinical Pharmacy', officeLocation: 'Ground Floor, Pharmacy', workPhone: '+233 30 277 1401' } },
  { id: 'USR-005', username: 'cashier', password: 'cashier123', role: 'Cashier', name: 'Daniel Osei', email: 'd.osei@gmail.com', phone: '+233 20 700 3002', department: 'Billing', lastLogin: '2026-08-02T08:15:00Z', isActive: true, mfaEnabled: false, branchId: 'BR-001', createdAt: '2024-11-01T00:00:00Z', staffProfile: { ...defaultProfile, officeLocation: 'Ground Floor, Billing Desk' } },
  { id: 'USR-006', username: 'lab', password: 'lab123', role: 'LabTechnician', name: 'Tech. Kweku Agyei', email: 'k.agyei@gmail.com', phone: '+233 20 700 3003', department: 'Laboratory', lastLogin: '2026-08-02T06:50:00Z', isActive: true, mfaEnabled: false, branchId: 'BR-001', createdAt: '2024-06-01T00:00:00Z', staffProfile: { ...defaultProfile, specialization: 'Haematology & Biochemistry', officeLocation: 'Basement, Lab B1' } },
  { id: 'USR-007', username: 'radiologist', password: 'radio123', role: 'Radiologist', name: 'Dr. Nana Appiah', email: 'n.appiah@gmail.com', phone: '+233 24 500 1005', department: 'Radiology', lastLogin: '2026-08-01T14:00:00Z', isActive: true, mfaEnabled: false, branchId: 'BR-001', createdAt: '2024-03-01T00:00:00Z', staffProfile: { ...defaultProfile, specialization: 'Diagnostic Radiology', officeLocation: 'Basement, Radiology B1' } },
  { id: 'USR-008', username: 'receptionist', password: 'recept123', role: 'Receptionist', name: 'Rebecca Amponsah', email: 'r.amponsah@gmail.com', phone: '+233 20 700 3004', department: 'Administration', lastLogin: '2026-08-02T07:00:00Z', isActive: true, mfaEnabled: false, branchId: 'BR-001', createdAt: '2025-04-01T00:00:00Z', staffProfile: { ...defaultProfile, officeLocation: 'Main Reception' } },
  { id: 'USR-009', username: 'patient', password: 'patient123', role: 'Patient', name: 'Patient Portal', email: 'portal@gmail.com', phone: '', department: '', lastLogin: '2026-08-02T10:00:00Z', isActive: true, mfaEnabled: false, branchId: 'BR-001', createdAt: '2026-01-01T00:00:00Z', staffProfile: { ...defaultProfile } },
]

// ─── Patients ─────────────────────────────────────────────────────────────────
export const seedPatients: Patient[] = [
   { id: 'PT-1001', barcode: 'HP-4M2K7P9N', name: 'Amina Nkrumah', age: 31, dob: '1995-03-14', gender: 'Female', bloodGroup: 'O+', phone: '+233 20 111 2233', email: 'amina.n@email.com', address: '12 Osu Road, Accra', emergencyContact: 'Mary Nkrumah', emergencyPhone: '+233 20 111 2234', allergies: 'Penicillin', insuranceId: 'INS-P001', branchId: 'BR-001', registeredAt: '2026-01-10T09:00:00Z', status: 'Active', userId: 'USR-009' },
   { id: 'PT-1002', barcode: 'HP-8C1Q3R5D', name: 'Kwame Boateng', age: 45, dob: '1981-07-22', gender: 'Male', bloodGroup: 'B+', phone: '+233 20 222 3344', email: 'kwame.b@email.com', address: '5 Labone Crescent, Accra', emergencyContact: 'Martha Boateng', emergencyPhone: '+233 20 222 3345', allergies: 'None', insuranceId: 'INS-P002', branchId: 'BR-001', registeredAt: '2026-02-20T10:30:00Z', status: 'In review', userId: '' },
   { id: 'PT-1003', barcode: 'HP-9Z4T8W2M', name: 'Esi Ansah', age: 28, dob: '1998-11-05', gender: 'Female', bloodGroup: 'A+', phone: '+233 20 333 4455', email: 'esi.a@email.com', address: '7 East Legon Ave, Accra', emergencyContact: 'Kojo Ansah', emergencyPhone: '+233 20 333 4456', allergies: 'Sulfa drugs', insuranceId: 'INS-P003', branchId: 'BR-001', registeredAt: '2026-03-05T14:00:00Z', status: 'Admitted', userId: '' },
   { id: 'PT-1004', barcode: 'HP-1B6N5K3P', name: 'Kofi Asante', age: 62, dob: '1964-05-18', gender: 'Male', bloodGroup: 'AB-', phone: '+233 20 444 5566', email: 'kofi.as@email.com', address: '22 Tema Motorway, Accra', emergencyContact: 'Akua Asante', emergencyPhone: '+233 20 444 5567', allergies: 'Aspirin', insuranceId: 'INS-P004', branchId: 'BR-001', registeredAt: '2026-03-18T08:00:00Z', status: 'Active', userId: '' },
   { id: 'PT-1005', barcode: 'HP-3J7L4Q8R', name: 'Abena Oppong', age: 34, dob: '1992-09-30', gender: 'Female', bloodGroup: 'B-', phone: '+233 20 555 6677', email: 'abena.o@email.com', address: '44 Adabraka, Accra', emergencyContact: 'Yaw Oppong', emergencyPhone: '+233 20 555 6678', allergies: 'Latex', insuranceId: '', branchId: 'BR-001', registeredAt: '2026-04-12T11:00:00Z', status: 'Emergency', userId: '' },
   { id: 'PT-1006', barcode: 'HP-5H2M9D6T', name: 'Nana Kweku Darko', age: 50, dob: '1976-12-03', gender: 'Male', bloodGroup: 'O-', phone: '+233 20 666 7788', email: 'nkdarko@email.com', address: '8 Cantonments Road, Accra', emergencyContact: 'Akosua Darko', emergencyPhone: '+233 20 666 7789', allergies: 'None', insuranceId: 'INS-P005', branchId: 'BR-001', registeredAt: '2026-05-01T09:30:00Z', status: 'Active', userId: '' },
   { id: 'PT-1007', barcode: 'HP-7G3P1N4W', name: 'Yaa Mensah', age: 7, dob: '2019-06-15', gender: 'Female', bloodGroup: 'A-', phone: '+233 20 777 8899', email: '', address: '3 Airport Res, Accra', emergencyContact: 'Kweku Mensah', emergencyPhone: '+233 20 777 8890', allergies: 'Peanuts', insuranceId: 'INS-P006', branchId: 'BR-001', registeredAt: '2026-06-10T14:15:00Z', status: 'Active', userId: '' },
   { id: 'PT-1008', barcode: 'HP-2T8K6P5S', name: 'Joseph Agyemang', age: 38, dob: '1988-02-28', gender: 'Male', bloodGroup: 'O+', phone: '+233 20 888 9900', email: 'j.agyemang@email.com', address: '15 North Ridge, Accra', emergencyContact: 'Mary Agyemang', emergencyPhone: '+233 20 888 9901', allergies: 'None', insuranceId: 'INS-P007', branchId: 'BR-001', registeredAt: '2026-07-01T08:45:00Z', status: 'Discharged', userId: '' },
]

// ─── Appointments ─────────────────────────────────────────────────────────────
export const seedAppointments: Appointment[] = [
  { id: 'AP-2001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', doctorId: 'DOC-001', doctorName: 'Dr. Kofi Mensah', department: 'General Medicine', date: '2026-08-03', time: '09:30', type: 'Consultation', priority: 'Routine', notes: 'Annual checkup', status: 'Confirmed' },
  { id: 'AP-2002', patientId: 'PT-1002', patientName: 'Kwame Boateng', doctorId: 'DOC-001', doctorName: 'Dr. Kofi Mensah', department: 'General Medicine', date: '2026-08-03', time: '11:00', type: 'Follow-up', priority: 'Routine', notes: 'BP monitoring follow-up', status: 'Booked' },
  { id: 'AP-2003', patientId: 'PT-1003', patientName: 'Esi Ansah', doctorId: 'DOC-004', doctorName: 'Dr. Akosua Dankwa', department: 'Obstetrics & Gynecology', date: '2026-08-03', time: '13:00', type: 'Consultation', priority: 'Urgent', notes: 'Antenatal visit', status: 'In Progress' },
  { id: 'AP-2004', patientId: 'PT-1004', patientName: 'Kofi Asante', doctorId: 'DOC-006', doctorName: 'Dr. Abena Frimpong', department: 'Cardiology', date: '2026-08-04', time: '10:00', type: 'Consultation', priority: 'Urgent', notes: 'Chest pain investigation', status: 'Confirmed' },
  { id: 'AP-2005', patientId: 'PT-1006', patientName: 'Nana Kweku Darko', doctorId: 'DOC-002', doctorName: 'Dr. Ama Boateng', department: 'Surgery', date: '2026-08-05', time: '08:00', type: 'Procedure', priority: 'Routine', notes: 'Pre-op assessment', status: 'Booked' },
  { id: 'AP-2006', patientId: 'PT-1007', patientName: 'Yaa Mensah', doctorId: 'DOC-003', doctorName: 'Dr. Yaw Asante', department: 'Pediatrics', date: '2026-08-02', time: '14:30', type: 'Follow-up', priority: 'Routine', notes: 'Vaccination follow-up', status: 'Completed' },
  { id: 'AP-2007', patientId: 'PT-1008', patientName: 'Joseph Agyemang', doctorId: 'DOC-001', doctorName: 'Dr. Kofi Mensah', department: 'General Medicine', date: '2026-08-01', time: '09:00', type: 'Consultation', priority: 'Routine', notes: 'Discharge follow-up', status: 'Completed' },
]

// ─── Wards & Beds ─────────────────────────────────────────────────────────────
export const seedWards: Ward[] = [
  { id: 'WRD-01', name: 'Ward A – General', department: 'General Medicine', floor: '2', capacity: 20, type: 'General' },
  { id: 'WRD-02', name: 'Ward B – Surgical', department: 'Surgery', floor: '3', capacity: 15, type: 'Surgical' },
  { id: 'WRD-03', name: 'Ward C – Pediatric', department: 'Pediatrics', floor: '1', capacity: 12, type: 'Pediatric' },
  { id: 'WRD-04', name: 'Ward D – Maternity', department: 'Obstetrics & Gynecology', floor: '4', capacity: 10, type: 'Maternity' },
  { id: 'WRD-05', name: 'ICU', department: 'ICU', floor: '3', capacity: 8, type: 'ICU' },
  { id: 'WRD-06', name: 'Isolation Ward', department: 'General Medicine', floor: '2', capacity: 6, type: 'Isolation' },
]

export const seedBeds: Bed[] = [
  { id: 'BED-001', wardId: 'WRD-01', wardName: 'Ward A – General', room: 'A101', number: '1', type: 'General', status: 'Occupied' },
  { id: 'BED-002', wardId: 'WRD-01', wardName: 'Ward A – General', room: 'A101', number: '2', type: 'General', status: 'Available' },
  { id: 'BED-003', wardId: 'WRD-01', wardName: 'Ward A – General', room: 'A102', number: '3', type: 'General', status: 'Available' },
  { id: 'BED-004', wardId: 'WRD-02', wardName: 'Ward B – Surgical', room: 'B201', number: '1', type: 'General', status: 'Reserved' },
  { id: 'BED-005', wardId: 'WRD-05', wardName: 'ICU', room: 'ICU-1', number: '1', type: 'ICU', status: 'Occupied' },
  { id: 'BED-006', wardId: 'WRD-05', wardName: 'ICU', room: 'ICU-1', number: '2', type: 'ICU', status: 'Available' },
  { id: 'BED-007', wardId: 'WRD-03', wardName: 'Ward C – Pediatric', room: 'C301', number: '1', type: 'General', status: 'Occupied' },
  { id: 'BED-008', wardId: 'WRD-04', wardName: 'Ward D – Maternity', room: 'D401', number: '1', type: 'General', status: 'Occupied' },
]

// ─── Admissions ───────────────────────────────────────────────────────────────
export const seedAdmissions: Admission[] = [
  { id: 'ADM-001', patientId: 'PT-1003', patientName: 'Esi Ansah', wardId: 'WRD-04', wardName: 'Ward D – Maternity', bedId: 'BED-008', bedNumber: 'D401-1', attendingDoctor: 'Dr. Akosua Dankwa', diagnosis: 'High-risk pregnancy', admittedAt: '2026-08-01T10:00:00Z', dischargePlanned: '2026-08-07', dischargedAt: '', nursingNotes: 'Vitals stable. CTG monitoring ongoing.', status: 'Admitted' },
  { id: 'ADM-002', patientId: 'PT-1001', patientName: 'Amina Nkrumah', wardId: 'WRD-01', wardName: 'Ward A – General', bedId: 'BED-001', bedNumber: 'A101-1', attendingDoctor: 'Dr. Kofi Mensah', diagnosis: 'Acute bronchitis', admittedAt: '2026-07-28T08:00:00Z', dischargePlanned: '2026-08-02', dischargedAt: '', nursingNotes: 'Responded well to treatment. Ready for discharge.', status: 'Admitted' },
  { id: 'ADM-003', patientId: 'PT-1008', patientName: 'Joseph Agyemang', wardId: 'WRD-02', wardName: 'Ward B – Surgical', bedId: 'BED-004', bedNumber: 'B201-1', attendingDoctor: 'Dr. Ama Boateng', diagnosis: 'Appendicitis – post-operative', admittedAt: '2026-07-20T14:00:00Z', dischargePlanned: '2026-07-25', dischargedAt: '2026-07-25T10:00:00Z', nursingNotes: 'Post-op recovery normal. Discharged on oral antibiotics.', status: 'Discharged' },
]

// ─── Medical Records ──────────────────────────────────────────────────────────
export const seedMedicalRecords: MedicalRecord[] = [
  { id: 'MR-4001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', doctorId: 'DOC-001', doctorName: 'Dr. Kofi Mensah', visitType: 'IPD', chiefComplaint: 'Persistent cough, fever', diagnosis: 'Acute bronchitis', treatment: 'Azithromycin 500mg OD x5, Salbutamol inhaler', vitals: 'Temp 38.1°C, BP 118/76, HR 88, SpO2 97%', clinicalNotes: 'Patient presents with 4-day history of productive cough. Chest auscultation: bilateral wheeze.', followUpDate: '2026-08-09', createdAt: '2026-07-28T09:00:00Z' },
  { id: 'MR-4002', patientId: 'PT-1002', patientName: 'Kwame Boateng', doctorId: 'DOC-001', doctorName: 'Dr. Kofi Mensah', visitType: 'OPD', chiefComplaint: 'Headache, elevated BP', diagnosis: 'Hypertension stage 2', treatment: 'Amlodipine 10mg OD, lifestyle modification', vitals: 'Temp 36.8°C, BP 158/98, HR 82, SpO2 99%', clinicalNotes: 'Known hypertensive. Non-compliant with medication. Counselled on compliance.', followUpDate: '2026-08-17', createdAt: '2026-08-03T11:15:00Z' },
  { id: 'MR-4003', patientId: 'PT-1004', patientName: 'Kofi Asante', doctorId: 'DOC-006', doctorName: 'Dr. Abena Frimpong', visitType: 'OPD', chiefComplaint: 'Chest pain, exertional dyspnoea', diagnosis: 'Stable angina – coronary artery disease', treatment: 'Nitrate therapy, aspirin 75mg, beta-blocker', vitals: 'Temp 36.5°C, BP 142/88, HR 76, SpO2 98%', clinicalNotes: 'ECG shows ST depression in V4-V6. Referred for stress echo and angiogram.', followUpDate: '2026-08-11', createdAt: '2026-08-04T10:30:00Z' },
]

// ─── Diagnoses ────────────────────────────────────────────────────────────────
export const seedDiagnoses: Diagnosis[] = [
  { id: 'DX-001', patientId: 'PT-1001', recordId: 'MR-4001', doctorName: 'Dr. Kofi Mensah', icdCode: 'J20.9', description: 'Acute bronchitis, unspecified', severity: 'Moderate', recordedAt: '2026-07-28T09:05:00Z', status: 'Active' },
  { id: 'DX-002', patientId: 'PT-1002', recordId: 'MR-4002', doctorName: 'Dr. Kofi Mensah', icdCode: 'I10', description: 'Essential (primary) hypertension', severity: 'Moderate', recordedAt: '2026-08-03T11:20:00Z', status: 'Chronic' },
  { id: 'DX-003', patientId: 'PT-1004', recordId: 'MR-4003', doctorName: 'Dr. Abena Frimpong', icdCode: 'I20.9', description: 'Angina pectoris, unspecified', severity: 'Moderate', recordedAt: '2026-08-04T10:35:00Z', status: 'Active' },
  { id: 'DX-004', patientId: 'PT-1003', recordId: 'MR-4001', doctorName: 'Dr. Akosua Dankwa', icdCode: 'O09.5', description: 'Supervision of elderly multigravida', severity: 'Moderate', recordedAt: '2026-08-01T10:10:00Z', status: 'Active' },
]

// ─── Prescriptions ────────────────────────────────────────────────────────────
export const seedPrescriptions: Prescription[] = [
  { id: 'RX-001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', doctorName: 'Dr. Kofi Mensah', medication: 'Azithromycin 500mg', dosage: '500mg', frequency: 'Once daily', duration: '5 days', instructions: 'Take with food. Avoid antacids.', prescribedAt: '2026-07-28T09:10:00Z', status: 'Dispensed' },
  { id: 'RX-002', patientId: 'PT-1001', patientName: 'Amina Nkrumah', doctorName: 'Dr. Kofi Mensah', medication: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'As needed', duration: '14 days', instructions: '2 puffs when breathless. Shake before use.', prescribedAt: '2026-07-28T09:11:00Z', status: 'Active' },
  { id: 'RX-003', patientId: 'PT-1002', patientName: 'Kwame Boateng', doctorName: 'Dr. Kofi Mensah', medication: 'Amlodipine 10mg', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take at the same time each day.', prescribedAt: '2026-08-03T11:25:00Z', status: 'Active' },
  { id: 'RX-004', patientId: 'PT-1004', patientName: 'Kofi Asante', doctorName: 'Dr. Abena Frimpong', medication: 'Aspirin 75mg', dosage: '75mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take after meals to reduce gastric upset.', prescribedAt: '2026-08-04T10:40:00Z', status: 'Active' },
]

// ─── Vital Signs ──────────────────────────────────────────────────────────────
export const seedVitalSigns: VitalSign[] = [
  { id: 'VS-001', patientId: 'PT-1001', recordedBy: 'Nurse Efua Asare', temperature: '38.1', bloodPressure: '118/76', heartRate: '88', respiratoryRate: '18', oxygenSaturation: '97', weight: '62', height: '164', recordedAt: '2026-07-28T08:45:00Z' },
  { id: 'VS-002', patientId: 'PT-1002', recordedBy: 'Nurse Adjoa Mensah', temperature: '36.8', bloodPressure: '158/98', heartRate: '82', respiratoryRate: '16', oxygenSaturation: '99', weight: '85', height: '178', recordedAt: '2026-08-03T11:00:00Z' },
  { id: 'VS-003', patientId: 'PT-1003', recordedBy: 'Nurse Abena Sarpong', temperature: '37.2', bloodPressure: '110/70', heartRate: '92', respiratoryRate: '20', oxygenSaturation: '98', weight: '71', height: '162', recordedAt: '2026-08-01T09:45:00Z' },
  { id: 'VS-004', patientId: 'PT-1004', recordedBy: 'Nurse Kojo Amoah', temperature: '36.5', bloodPressure: '142/88', heartRate: '76', respiratoryRate: '17', oxygenSaturation: '98', weight: '90', height: '175', recordedAt: '2026-08-04T10:00:00Z' },
]

// ─── Immunizations ────────────────────────────────────────────────────────────
export const seedImmunizations: Immunization[] = [
  { id: 'IMM-001', patientId: 'PT-1007', patientName: 'Yaa Mensah', vaccine: 'Pentavalent (DPT-HepB-Hib)', dose: 'Dose 3', administeredBy: 'Nurse Adjoa Mensah', site: 'Left thigh', lotNumber: 'LOT-2026-004', administeredAt: '2026-08-02T14:30:00Z', nextDueDate: '2026-11-02', status: 'Administered' },
  { id: 'IMM-002', patientId: 'PT-1007', patientName: 'Yaa Mensah', vaccine: 'Pneumococcal (PCV13)', dose: 'Dose 2', administeredBy: 'Nurse Adjoa Mensah', site: 'Right thigh', lotNumber: 'LOT-2026-007', administeredAt: '2026-08-02T14:35:00Z', nextDueDate: '2026-11-02', status: 'Administered' },
  { id: 'IMM-003', patientId: 'PT-1001', patientName: 'Amina Nkrumah', vaccine: 'Influenza', dose: 'Annual', administeredBy: 'Nurse Efua Asare', site: 'Left deltoid', lotNumber: 'LOT-2026-014', administeredAt: '2026-03-01T10:00:00Z', nextDueDate: '2027-03-01', status: 'Administered' },
]

// ─── Lab Tests & Results ──────────────────────────────────────────────────────
export const seedLabTests: LabTest[] = [
  { id: 'LT-001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', requestedBy: 'Dr. Kofi Mensah', testName: 'Complete Blood Count (CBC)', category: 'Haematology', priority: 'Routine', sampleType: 'Venous blood', collectedAt: '2026-07-28T10:00:00Z', status: 'Completed' },
  { id: 'LT-002', patientId: 'PT-1001', patientName: 'Amina Nkrumah', requestedBy: 'Dr. Kofi Mensah', testName: 'C-Reactive Protein (CRP)', category: 'Biochemistry', priority: 'Urgent', sampleType: 'Serum', collectedAt: '2026-07-28T10:05:00Z', status: 'Completed' },
  { id: 'LT-003', patientId: 'PT-1002', patientName: 'Kwame Boateng', requestedBy: 'Dr. Kofi Mensah', testName: 'Lipid Profile', category: 'Biochemistry', priority: 'Routine', sampleType: 'Serum (fasting)', collectedAt: '2026-08-03T08:00:00Z', status: 'In Progress' },
  { id: 'LT-004', patientId: 'PT-1004', patientName: 'Kofi Asante', requestedBy: 'Dr. Abena Frimpong', testName: 'Troponin I', category: 'Cardiac Markers', priority: 'STAT', sampleType: 'Serum', collectedAt: '2026-08-04T10:15:00Z', status: 'Completed' },
  { id: 'LT-005', patientId: 'PT-1003', patientName: 'Esi Ansah', requestedBy: 'Dr. Akosua Dankwa', testName: 'Full Blood Count + Group & Save', category: 'Haematology', priority: 'Urgent', sampleType: 'EDTA blood', collectedAt: '2026-08-01T11:00:00Z', status: 'Completed' },
]

export const seedLabResults: LabResult[] = [
  { id: 'LR-001', testId: 'LT-001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', testName: 'WBC', result: '11.8', unit: '×10⁹/L', referenceRange: '4.0–11.0', abnormal: true, remarks: 'Elevated – consistent with bacterial infection', reportedBy: 'Tech. Kweku Agyei', reportedAt: '2026-07-28T12:30:00Z' },
  { id: 'LR-002', testId: 'LT-002', patientId: 'PT-1001', patientName: 'Amina Nkrumah', testName: 'CRP', result: '42', unit: 'mg/L', referenceRange: '<5', abnormal: true, remarks: 'Markedly elevated – active inflammation', reportedBy: 'Tech. Kweku Agyei', reportedAt: '2026-07-28T12:45:00Z' },
  { id: 'LR-003', testId: 'LT-004', patientId: 'PT-1004', patientName: 'Kofi Asante', testName: 'Troponin I', result: '0.04', unit: 'ng/mL', referenceRange: '<0.04', abnormal: false, remarks: 'Upper limit of normal – borderline', reportedBy: 'Tech. Kweku Agyei', reportedAt: '2026-08-04T11:00:00Z' },
]

// ─── Medicines ────────────────────────────────────────────────────────────────
export const seedMedicines: Medicine[] = [
  { id: 'MED-001', name: 'Paracetamol', genericName: 'Acetaminophen', brand: 'Panadol', category: 'Analgesic', form: 'Tablet', dosage: '500mg', unit: 'Tablet', stock: 1200, reorderLevel: 200, expiryDate: '2027-06-30', supplier: 'PharmaDist GH', purchasePrice: 0.05, sellingPrice: 0.15, status: 'In Stock' },
  { id: 'MED-002', name: 'Amoxicillin', genericName: 'Amoxicillin', brand: 'Amoxil', category: 'Antibiotic', form: 'Capsule', dosage: '500mg', unit: 'Capsule', stock: 450, reorderLevel: 100, expiryDate: '2027-03-31', supplier: 'MediSupply Ltd', purchasePrice: 0.30, sellingPrice: 0.80, status: 'In Stock' },
  { id: 'MED-003', name: 'Amlodipine', genericName: 'Amlodipine besylate', brand: 'Norvasc', category: 'Antihypertensive', form: 'Tablet', dosage: '10mg', unit: 'Tablet', stock: 380, reorderLevel: 80, expiryDate: '2026-12-31', supplier: 'PharmaDist GH', purchasePrice: 0.45, sellingPrice: 1.20, status: 'In Stock' },
  { id: 'MED-004', name: 'Metformin', genericName: 'Metformin HCl', brand: 'Glucophage', category: 'Antidiabetic', form: 'Tablet', dosage: '500mg', unit: 'Tablet', stock: 60, reorderLevel: 100, expiryDate: '2026-09-30', supplier: 'MediSupply Ltd', purchasePrice: 0.20, sellingPrice: 0.55, status: 'Low Stock' },
  { id: 'MED-005', name: 'Azithromycin', genericName: 'Azithromycin', brand: 'Zithromax', category: 'Antibiotic', form: 'Tablet', dosage: '500mg', unit: 'Tablet', stock: 200, reorderLevel: 50, expiryDate: '2027-01-31', supplier: 'PharmaDist GH', purchasePrice: 0.90, sellingPrice: 2.50, status: 'In Stock' },
  { id: 'MED-006', name: 'Salbutamol Inhaler', genericName: 'Albuterol', brand: 'Ventolin', category: 'Bronchodilator', form: 'Inhaler', dosage: '100mcg/dose', unit: 'Inhaler', stock: 25, reorderLevel: 15, expiryDate: '2027-05-31', supplier: 'GSK Ghana', purchasePrice: 8.00, sellingPrice: 18.00, status: 'In Stock' },
  { id: 'MED-007', name: 'Aspirin', genericName: 'Acetylsalicylic acid', brand: 'Disprin', category: 'Antiplatelet', form: 'Tablet', dosage: '75mg', unit: 'Tablet', stock: 0, reorderLevel: 100, expiryDate: '2027-04-30', supplier: 'PharmaDist GH', purchasePrice: 0.02, sellingPrice: 0.08, status: 'Out of Stock' },
  { id: 'MED-008', name: 'ORS Sachet', genericName: 'Oral Rehydration Salts', brand: 'WHO-ORS', category: 'Rehydration', form: 'Syrup', dosage: '200mL reconstituted', unit: 'Sachet', stock: 800, reorderLevel: 150, expiryDate: '2027-08-31', supplier: 'UNICEF Supply', purchasePrice: 0.10, sellingPrice: 0.25, status: 'In Stock' },
]

export const seedDispenses: PrescriptionDispense[] = [
  { id: 'DSP-001', prescriptionId: 'RX-001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', medicineId: 'MED-005', medicineName: 'Azithromycin 500mg', quantity: 5, dispensedBy: 'Pharm. Grace Tetteh', dispensedAt: '2026-07-28T14:00:00Z', status: 'Dispensed' },
  { id: 'DSP-002', prescriptionId: 'RX-003', patientId: 'PT-1002', patientName: 'Kwame Boateng', medicineId: 'MED-003', medicineName: 'Amlodipine 10mg', quantity: 30, dispensedBy: 'Pharm. Grace Tetteh', dispensedAt: '2026-08-03T13:00:00Z', status: 'Dispensed' },
]

// ─── Radiology ────────────────────────────────────────────────────────────────
export const seedRadiologyRequests: RadiologyRequest[] = [
  { id: 'RAD-001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', requestedBy: 'Dr. Kofi Mensah', examType: 'X-ray', bodyPart: 'Chest (PA & Lateral)', priority: 'Routine', clinicalInfo: 'Productive cough, rule out pneumonia', scheduledAt: '2026-07-28T11:00:00Z', status: 'Completed' },
  { id: 'RAD-002', patientId: 'PT-1004', patientName: 'Kofi Asante', requestedBy: 'Dr. Abena Frimpong', examType: 'CT Scan', bodyPart: 'Chest with contrast', priority: 'Urgent', clinicalInfo: 'Known CAD, rule out PE', scheduledAt: '2026-08-04T12:00:00Z', status: 'Scheduled' },
  { id: 'RAD-003', patientId: 'PT-1003', patientName: 'Esi Ansah', requestedBy: 'Dr. Akosua Dankwa', examType: 'Ultrasound', bodyPart: 'Obstetric – fetal wellbeing', priority: 'Routine', clinicalInfo: 'Antenatal monitoring, 32 weeks', scheduledAt: '2026-08-03T09:00:00Z', status: 'Completed' },
]

export const seedRadiologyReports: RadiologyReport[] = [
  { id: 'RRP-001', requestId: 'RAD-001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', examType: 'X-ray Chest', findings: 'Bilateral perihilar haziness. No consolidation. Costophrenic angles clear.', impression: 'Bronchitis pattern. No evidence of pneumonia.', recommendation: 'Clinical correlation. Repeat if symptoms worsen.', reportedBy: 'Dr. Nana Appiah', reportedAt: '2026-07-28T13:00:00Z' },
  { id: 'RRP-002', requestId: 'RAD-003', patientId: 'PT-1003', patientName: 'Esi Ansah', examType: 'Obstetric Ultrasound', findings: 'Single live fetus in cephalic presentation. AFI 12cm. EFW 1.9kg. Placenta posterior grade II.', impression: 'Appropriate for 32 weeks gestation. No anomalies detected.', recommendation: 'Continue routine antenatal care.', reportedBy: 'Dr. Nana Appiah', reportedAt: '2026-08-03T10:30:00Z' },
]

// ─── Billing ──────────────────────────────────────────────────────────────────
export const seedInvoices: Invoice[] = [
  { id: 'INV-2026-0001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', department: 'General Medicine', items: [{ description: 'Consultation fee', quantity: 1, unitPrice: 80, total: 80 }, { description: 'CBC test', quantity: 1, unitPrice: 35, total: 35 }, { description: 'Azithromycin 500mg x5', quantity: 5, unitPrice: 2.50, total: 12.50 }], subtotal: 8.50, discount: 0, tax: 0, total: 8.50, insuranceCoverage: 5.33, amountDue: 3.17, currency: 'USD', status: 'Paid', issuedAt: '2026-07-28T15:00:00Z', dueAt: '2026-08-04' },
  { id: 'INV-2026-0002', patientId: 'PT-1002', patientName: 'Kwame Boateng', department: 'General Medicine', items: [{ description: 'Consultation fee', quantity: 1, unitPrice: 80, total: 80 }, { description: 'Lipid profile', quantity: 1, unitPrice: 55, total: 55 }, { description: 'Amlodipine 10mg x30', quantity: 30, unitPrice: 1.20, total: 36 }], subtotal: 11.40, discount: 10, tax: 0, total: 10.73, insuranceCoverage: 8.00, amountDue: 2.73, currency: 'USD', status: 'Issued', issuedAt: '2026-08-03T13:30:00Z', dueAt: '2026-08-10' },
  { id: 'INV-2026-0003', patientId: 'PT-1004', patientName: 'Kofi Asante', department: 'Cardiology', items: [{ description: 'Consultation – Cardiology', quantity: 1, unitPrice: 160, total: 160 }, { description: 'Troponin I', quantity: 1, unitPrice: 85, total: 85 }, { description: 'ECG', quantity: 1, unitPrice: 45, total: 45 }], subtotal: 19.33, discount: 0, tax: 0, total: 19.33, insuranceCoverage: 0, amountDue: 19.33, currency: 'USD', status: 'Overdue', issuedAt: '2026-08-04T11:30:00Z', dueAt: '2026-08-04' },
]

export const seedPayments: Payment[] = [
  { id: 'PAY-001', invoiceId: 'INV-2026-0001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', amount: 3.17, method: 'Cash', reference: 'CASH-20260728', processedBy: 'Daniel Osei', paidAt: '2026-07-28T15:20:00Z', status: 'Completed' },
]

// ─── Insurance ────────────────────────────────────────────────────────────────
export const seedInsurancePolicies: InsurancePolicy[] = [
  { id: 'INS-P001', provider: 'NHIA Ghana', patientId: 'PT-1001', patientName: 'Amina Nkrumah', policyNumber: 'NHIS-20264421', groupNumber: 'GRP-A', coverageType: 'Comprehensive', coverageLimit: 5000, deductible: 50, copay: 10, validFrom: '2026-01-01', validTo: '2026-12-31', status: 'Active' },
  { id: 'INS-P002', provider: 'StarLife Insurance', patientId: 'PT-1002', patientName: 'Kwame Boateng', policyNumber: 'SL-2024-88321', groupNumber: 'GRP-B', coverageType: 'Basic', coverageLimit: 3000, deductible: 100, copay: 20, validFrom: '2024-06-01', validTo: '2026-05-31', status: 'Expired' },
  { id: 'INS-P005', provider: 'NHIA Ghana', patientId: 'PT-1006', patientName: 'Nana Kweku Darko', policyNumber: 'NHIS-20267734', groupNumber: 'GRP-A', coverageType: 'Comprehensive', coverageLimit: 5000, deductible: 50, copay: 10, validFrom: '2026-01-01', validTo: '2026-12-31', status: 'Active' },
]

export const seedInsuranceClaims: InsuranceClaim[] = [
  { id: 'CLM-001', policyId: 'INS-P001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', invoiceId: 'INV-2026-0001', provider: 'NHIA Ghana', claimAmount: 8.50, approvedAmount: 5.33, submittedAt: '2026-07-29T09:00:00Z', status: 'Approved' },
]

export const seedExpenses: Expense[] = [
  { id: 'EXP-001', category: 'Medical Supplies', description: 'Monthly consumables restock', amount: 300.00, department: 'Pharmacy', paidTo: 'MediSupply Ltd', approvedBy: 'Dr. Kofi Mensah', date: '2026-08-01', status: 'Paid' },
  { id: 'EXP-002', category: 'Utilities', description: 'July electricity bill', amount: 213.33, department: 'Administration', paidTo: 'ECG Ghana', approvedBy: 'Admin', date: '2026-08-02', status: 'Paid' },
  { id: 'EXP-003', category: 'Equipment Maintenance', description: 'MRI machine servicing', amount: 800.00, department: 'Radiology', paidTo: 'Siemens Healthineers', approvedBy: 'Dr. Nana Appiah', date: '2026-08-05', status: 'Pending' },
  { id: 'EXP-004', category: 'Staff Training', description: 'CPR & ALS refresher', amount: 120.00, department: 'Emergency', paidTo: 'GH Medical Training', approvedBy: 'Dr. Samuel Owusu', date: '2026-07-25', status: 'Paid' },
]

// ─── Inventory ────────────────────────────────────────────────────────────────
export const seedInventoryItems: InventoryItem[] = [
  { id: 'INV-I001', name: 'Surgical Gloves (Medium)', category: 'PPE', quantity: 2000, unit: 'Pairs', reorderLevel: 500, location: 'Store Room A', supplier: 'MediSupply Ltd', unitCost: 0.80, lastRestocked: '2026-07-15', status: 'In Stock' },
  { id: 'INV-I002', name: 'Disposable Syringes 5mL', category: 'Medical Supply', quantity: 1500, unit: 'Pcs', reorderLevel: 300, location: 'Store Room A', supplier: 'MediSupply Ltd', unitCost: 0.20, lastRestocked: '2026-07-20', status: 'In Stock' },
  { id: 'INV-I003', name: 'IV Infusion Sets', category: 'Medical Supply', quantity: 95, unit: 'Sets', reorderLevel: 100, location: 'Ward Supplies', supplier: 'PharmaDist GH', unitCost: 1.50, lastRestocked: '2026-07-01', status: 'Low Stock' },
  { id: 'INV-I004', name: 'Pulse Oximeter', category: 'Equipment', quantity: 12, unit: 'Units', reorderLevel: 5, location: 'Nursing Station', supplier: 'MedEquip Ghana', unitCost: 45.00, lastRestocked: '2026-05-01', status: 'In Stock' },
  { id: 'INV-I005', name: 'Sterile Gauze Pads 4x4', category: 'Medical Supply', quantity: 0, unit: 'Packs', reorderLevel: 50, location: 'Store Room B', supplier: 'MediSupply Ltd', unitCost: 2.50, lastRestocked: '2026-06-10', status: 'Out of Stock' },
  { id: 'INV-I006', name: 'N95 Respirators', category: 'PPE', quantity: 350, unit: 'Pcs', reorderLevel: 100, location: 'PPE Locker', supplier: '3M Ghana', unitCost: 3.20, lastRestocked: '2026-07-28', status: 'In Stock' },
]

export const seedSuppliers: Supplier[] = [
  { id: 'SUP-001', name: 'MediSupply Ltd', contact: 'Kwabena Frempong', email: 'orders@gmail.com', phone: '+233 30 288 4400', address: '10 Industrial Area, Accra', category: 'Pharmaceuticals & Consumables', items: 'Gloves, Syringes, IV Sets, Gauze', rating: 4.5, status: 'Active' },
  { id: 'SUP-002', name: 'PharmaDist GH', contact: 'Afia Bonsu', email: 'sales@gmail.com', phone: '+233 30 255 3300', address: '5 Spintex Road, Accra', category: 'Pharmaceuticals', items: 'Paracetamol, Amlodipine, Azithromycin, ORS', rating: 4.8, status: 'Active' },
  { id: 'SUP-003', name: 'MedEquip Ghana', contact: 'Ebo Asante', email: 'info@gmail.com', phone: '+233 30 277 5500', address: '22 Liberation Road, Accra', category: 'Medical Equipment', items: 'Pulse Oximeters, ECG machines, Monitors', rating: 4.2, status: 'Active' },
  { id: 'SUP-004', name: '3M Ghana', contact: 'Frank Mills', email: 'f.mills2@gmail.com', phone: '+233 30 200 1100', address: 'Airport City, Accra', category: 'PPE', items: 'N95 masks, Protective gowns', rating: 5.0, status: 'Active' },
]

// ─── Blood Bank ───────────────────────────────────────────────────────────────
export const seedBloodDonors: BloodDonor[] = [
  { id: 'BDR-001', name: 'Eric Mensah', bloodType: 'O+', phone: '+233 24 800 0001', email: 'e.mensah@email.com', lastDonated: '2026-06-10', totalDonations: 8, status: 'Eligible' },
  { id: 'BDR-002', name: 'Akua Asante', bloodType: 'A+', phone: '+233 24 800 0002', email: 'a.asante@email.com', lastDonated: '2026-05-22', totalDonations: 4, status: 'Eligible' },
  { id: 'BDR-003', name: 'Kwesi Boadu', bloodType: 'B+', phone: '+233 24 800 0003', email: 'k.boadu@email.com', lastDonated: '2026-07-30', totalDonations: 12, status: 'Deferred' },
  { id: 'BDR-004', name: 'Maame Kusi', bloodType: 'AB+', phone: '+233 24 800 0004', email: 'm.kusi@email.com', lastDonated: '2026-03-15', totalDonations: 2, status: 'Eligible' },
]

export const seedBloodUnits: BloodUnit[] = [
  { id: 'BU-001', bloodType: 'O+', component: 'Whole Blood', donorId: 'BDR-001', donorName: 'Eric Mensah', collectedAt: '2026-06-10T09:00:00Z', expiryDate: '2026-09-08', bagNumber: 'BAG-2026-001', status: 'Available' },
  { id: 'BU-002', bloodType: 'A+', component: 'RBC', donorId: 'BDR-002', donorName: 'Akua Asante', collectedAt: '2026-05-22T10:00:00Z', expiryDate: '2026-08-20', bagNumber: 'BAG-2026-002', status: 'Available' },
  { id: 'BU-003', bloodType: 'B+', component: 'Platelets', donorId: 'BDR-003', donorName: 'Kwesi Boadu', collectedAt: '2026-07-01T08:00:00Z', expiryDate: '2026-08-05', bagNumber: 'BAG-2026-003', status: 'Expired' },
  { id: 'BU-004', bloodType: 'O-', component: 'Whole Blood', donorId: 'BDR-001', donorName: 'Eric Mensah', collectedAt: '2026-07-15T09:00:00Z', expiryDate: '2026-10-13', bagNumber: 'BAG-2026-004', status: 'Reserved' },
  { id: 'BU-005', bloodType: 'AB+', component: 'Plasma', donorId: 'BDR-004', donorName: 'Maame Kusi', collectedAt: '2026-03-15T11:00:00Z', expiryDate: '2027-03-15', bagNumber: 'BAG-2026-005', status: 'Available' },
]

export const seedBloodRequests: BloodRequest[] = [
  { id: 'BRQ-001', patientId: 'PT-1003', patientName: 'Esi Ansah', bloodType: 'A+', component: 'Whole Blood', unitsRequired: 2, requestedBy: 'Dr. Akosua Dankwa', requestedAt: '2026-08-01T11:30:00Z', urgency: 'Urgent', status: 'Approved' },
  { id: 'BRQ-002', patientId: 'PT-1004', patientName: 'Kofi Asante', bloodType: 'AB-', component: 'RBC', unitsRequired: 1, requestedBy: 'Dr. Abena Frimpong', requestedAt: '2026-08-04T12:00:00Z', urgency: 'Emergency', status: 'Pending' },
]

// ─── Surgeries ────────────────────────────────────────────────────────────────
export const seedSurgeries: Surgery[] = [
  { id: 'SRG-001', patientId: 'PT-1008', patientName: 'Joseph Agyemang', procedure: 'Laparoscopic Appendicectomy', surgeonId: 'DOC-002', surgeonName: 'Dr. Ama Boateng', anesthetist: 'Dr. R. Kpodo', otRoom: 'OT-1', scheduledAt: '2026-07-21T07:00:00Z', duration: '75 min', preOpNotes: 'Acute appendicitis confirmed on CT. No contraindications. Consent obtained.', postOpNotes: 'Procedure completed uneventfully. EBL minimal. Transferred to recovery.', status: 'Completed' },
  { id: 'SRG-002', patientId: 'PT-1006', patientName: 'Nana Kweku Darko', procedure: 'Inguinal Hernia Repair (Laparoscopic)', surgeonId: 'DOC-002', surgeonName: 'Dr. Ama Boateng', anesthetist: 'Dr. R. Kpodo', otRoom: 'OT-2', scheduledAt: '2026-08-06T08:00:00Z', duration: '90 min', preOpNotes: 'Right-sided reducible inguinal hernia. Elective repair. Pre-op bloods normal.', postOpNotes: '', status: 'Scheduled' },
]

// ─── Emergency ────────────────────────────────────────────────────────────────
export const seedEmergencyCases: EmergencyCase[] = [
  { id: 'EM-001', patientId: 'PT-1005', patientName: 'Abena Oppong', arrivalMode: 'Ambulance', triageLevel: 'P1 - Critical', chiefComplaint: 'Severe anaphylactic reaction – bee sting', attendingDoctor: 'Dr. Samuel Owusu', treatmentStarted: '2026-08-02T07:15:00Z', disposition: 'Admitted', notes: 'Epinephrine 0.5mg IM given. Airway secured. Transferred to ICU.', registeredAt: '2026-08-02T07:10:00Z' },
  { id: 'EM-002', patientId: 'PT-1004', patientName: 'Kofi Asante', arrivalMode: 'Walk-in', triageLevel: 'P2 - Urgent', chiefComplaint: 'Acute chest pain – onset 30 mins ago', attendingDoctor: 'Dr. Samuel Owusu', treatmentStarted: '2026-08-04T09:45:00Z', disposition: 'Admitted', notes: 'ECG performed. Cardiology consulted. Admitted for monitoring.', registeredAt: '2026-08-04T09:40:00Z' },
  { id: 'EM-003', patientId: 'PT-1007', patientName: 'Yaa Mensah', arrivalMode: 'Walk-in', triageLevel: 'P3 - Less Urgent', chiefComplaint: 'High fever 39.4°C – febrile child', attendingDoctor: 'Dr. Yaw Asante', treatmentStarted: '2026-08-01T17:00:00Z', disposition: 'Discharged', notes: 'Malaria RDT negative. Viral fever. Paracetamol given. Discharged with advice.', registeredAt: '2026-08-01T16:50:00Z' },
]

export const seedAmbulances: Ambulance[] = [
  { id: 'AMB-001', vehicleNumber: 'GR-1234-24', driver: 'Kwame Frimpong', paramedic: 'Ama Nkrumah', patientId: 'PT-1005', patientName: 'Abena Oppong', pickup: 'Ring Road East, Accra', destination: 'Sameds Hospital Main Campus', dispatchedAt: '2026-08-02T07:00:00Z', arrivedAt: '2026-08-02T07:10:00Z', status: 'Returning' },
]

// ─── Maternity ────────────────────────────────────────────────────────────────
export const seedMaternityRecords: MaternityRecord[] = [
  { id: 'MAT-001', patientId: 'PT-1003', patientName: 'Esi Ansah', lmp: '2026-01-10', edd: '2026-10-17', gravida: 2, para: 1, gestationalAge: '32 weeks', riskLevel: 'High', attendingOb: 'Dr. Akosua Dankwa', antenatalVisits: 6, deliveryType: 'Pending', deliveredAt: '', babyWeight: '', babyGender: 'Unknown', status: 'Antenatal' },
]

// ─── Telemedicine ─────────────────────────────────────────────────────────────
export const seedTelemedicineSessions: TelemedicineSession[] = [
  { id: 'TEL-001', patientId: 'PT-1002', patientName: 'Kwame Boateng', doctorId: 'DOC-001', doctorName: 'Dr. Kofi Mensah', scheduledAt: '2026-08-05T16:00:00Z', platform: 'Video Call', chiefComplaint: 'BP monitoring check-in', notes: 'Patient reports compliance with medication. No side effects.', prescriptionIssued: false, duration: '15 min', status: 'Scheduled' },
  { id: 'TEL-002', patientId: 'PT-1004', patientName: 'Kofi Asante', doctorId: 'DOC-006', doctorName: 'Dr. Abena Frimpong', scheduledAt: '2026-08-10T10:00:00Z', platform: 'Video Call', chiefComplaint: 'Post-cardiology review', notes: '', prescriptionIssued: false, duration: '', status: 'Scheduled' },
]

// ─── Notifications ────────────────────────────────────────────────────────────
export const seedNotifications: Notification[] = [
  { id: 'NOT-001', recipient: 'Amina Nkrumah', recipientId: 'PT-1001', channel: 'SMS', type: 'Appointment', subject: 'Appointment Reminder', body: 'Your appointment with Dr. Kofi Mensah is on 3 Aug 2026 at 09:30. Please arrive 15 minutes early.', sentAt: '2026-08-02T08:00:00Z', status: 'Sent' },
  { id: 'NOT-002', recipient: 'Kwame Boateng', recipientId: 'PT-1002', channel: 'Email', type: 'Billing', subject: 'Invoice Ready – INV-2026-0002', body: 'Your invoice for $161.00 is ready. Please settle by 10 Aug 2026.', sentAt: '2026-08-03T14:00:00Z', status: 'Sent' },
  { id: 'NOT-003', recipient: 'Kofi Asante', recipientId: 'PT-1004', channel: 'SMS', type: 'Lab Result', subject: 'Lab Results Available', body: 'Your Troponin I result is now available. Please contact your doctor for review.', sentAt: '2026-08-04T11:15:00Z', status: 'Sent' },
  { id: 'NOT-004', recipient: 'Pharm. Grace Tetteh', recipientId: 'USR-004', channel: 'In-app', type: 'General', subject: 'Low Stock Alert', body: 'Metformin 500mg stock is at 60 units — below reorder level of 100. Aspirin 75mg is OUT OF STOCK.', sentAt: '2026-08-02T07:00:00Z', status: 'Read' },
]

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const seedAuditLogs: AuditLog[] = [
  { id: 'AUD-001', userId: 'USR-001', userName: 'admin', role: 'Admin', action: 'LOGIN', module: 'Auth', target: 'System', ipAddress: '192.168.1.10', timestamp: '2026-08-02T08:00:00Z', result: 'Success' },
  { id: 'AUD-002', userId: 'USR-002', userName: 'doctor', role: 'Doctor', action: 'CREATE_RECORD', module: 'EMR', target: 'MR-4001', ipAddress: '192.168.1.12', timestamp: '2026-07-28T09:10:00Z', result: 'Success' },
  { id: 'AUD-003', userId: 'USR-004', userName: 'pharmacist', role: 'Pharmacist', action: 'DISPENSE', module: 'Pharmacy', target: 'DSP-001', ipAddress: '192.168.1.14', timestamp: '2026-07-28T14:05:00Z', result: 'Success' },
  { id: 'AUD-004', userId: 'USR-005', userName: 'cashier', role: 'Cashier', action: 'PROCESS_PAYMENT', module: 'Billing', target: 'PAY-001', ipAddress: '192.168.1.15', timestamp: '2026-07-28T15:25:00Z', result: 'Success' },
  { id: 'AUD-005', userId: 'USR-003', userName: 'nurse', role: 'Nurse', action: 'UPDATE_VITALS', module: 'EMR', target: 'VS-001', ipAddress: '192.168.1.13', timestamp: '2026-07-28T08:50:00Z', result: 'Success' },
  { id: 'AUD-006', userId: 'USR-099', userName: 'unknown', role: 'Patient', action: 'LOGIN', module: 'Auth', target: 'System', ipAddress: '41.66.124.5', timestamp: '2026-08-01T03:22:00Z', result: 'Failed' },
]

// ─── Documents ────────────────────────────────────────────────────────────────
export const seedDocuments: Document[] = [
  { id: 'DOC-D001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', title: 'Chest X-Ray Report – Jul 2026', type: 'Scan', fileName: 'PT1001_CXR_20260728.pdf', uploadedBy: 'Dr. Nana Appiah', uploadedAt: '2026-07-28T13:30:00Z', size: '1.2 MB', status: 'Active' },
  { id: 'DOC-D002', patientId: 'PT-1001', patientName: 'Amina Nkrumah', title: 'Discharge Summary – Jul 2026', type: 'Discharge Summary', fileName: 'PT1001_DS_20260728.pdf', uploadedBy: 'Dr. Kofi Mensah', uploadedAt: '2026-07-28T15:30:00Z', size: '0.5 MB', status: 'Active' },
  { id: 'DOC-D003', patientId: 'PT-1003', patientName: 'Esi Ansah', title: 'Antenatal Consent Form', type: 'Consent Form', fileName: 'PT1003_CONSENT_20260801.pdf', uploadedBy: 'Rebecca Amponsah', uploadedAt: '2026-08-01T10:30:00Z', size: '0.2 MB', status: 'Active' },
  { id: 'DOC-D004', patientId: 'PT-1002', patientName: 'Kwame Boateng', title: 'Insurance Card – StarLife', type: 'Insurance', fileName: 'PT1002_INS_CARD.pdf', uploadedBy: 'Rebecca Amponsah', uploadedAt: '2026-02-20T11:00:00Z', size: '0.1 MB', status: 'Active' },
]

// ─── Central Database ───────────────────────────────────────────────────────
export const seedCentralRecords: CentralRecord[] = [
  { id: 'CR-001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', patientBarcode: 'BC-1001', recordType: 'MedicalRecord', recordId: 'MR-4001', summary: 'Patient admitted for chest pain workup and discharged with stable vitals.', submittedBy: 'USR-002', submittedByName: 'Dr. Kofi Mensah', submittedAt: '2026-08-02T09:30:00Z', branchId: 'BR-001', isShared: true },
  { id: 'CR-002', patientId: 'PT-1002', patientName: 'Kwame Boateng', patientBarcode: 'BC-1002', recordType: 'LabResult', recordId: 'LAB-2026-001', summary: 'Troponin I result returned elevated; cardiology review recommended.', submittedBy: 'USR-005', submittedByName: 'Rebecca Amponsah', submittedAt: '2026-08-03T11:00:00Z', branchId: 'BR-001', isShared: true },
]

// ─── Stellar Payments ───────────────────────────────────────────────────────
export const seedStellarPayments: StellarPayment[] = [
  { id: 'XLM-001', invoiceId: 'INV-2026-0001', patientId: 'PT-1001', patientName: 'Amina Nkrumah', amountXLM: '14.22', amountUSD: '3.17', xlmToUSDRate: '0.22', senderAddress: 'GDZZA3EXAMPLE000000001', receiverAddress: 'GDSAMEDS_HOSPITAL_MAIN_ACCRA', memo: 'INV-2026-0001', txHash: 'abc123def456...', network: 'mainnet', status: 'Confirmed', createdAt: '2026-07-28T15:18:00Z', confirmedAt: '2026-07-28T15:20:00Z' },
]
import type { HMSState } from '../types'

export const initialHMSState: HMSState = {
  branches: seedBranches,
  departments: seedDepartments,
  staff: seedStaff,
  doctors: seedDoctors,
  nurses: seedNurses,
  userAccounts: seedUserAccounts,
  patients: seedPatients,
  appointments: seedAppointments,
  wards: seedWards,
  beds: seedBeds,
  admissions: seedAdmissions,
  medicalRecords: seedMedicalRecords,
  diagnoses: seedDiagnoses,
  prescriptions: seedPrescriptions,
  vitalSigns: seedVitalSigns,
  immunizations: seedImmunizations,
  labTests: seedLabTests,
  labResults: seedLabResults,
  medicines: seedMedicines,
  dispenses: seedDispenses,
  radiologyRequests: seedRadiologyRequests,
  radiologyReports: seedRadiologyReports,
  invoices: seedInvoices,
  payments: seedPayments,
  insurancePolicies: seedInsurancePolicies,
  insuranceClaims: seedInsuranceClaims,
  expenses: seedExpenses,
  inventoryItems: seedInventoryItems,
  suppliers: seedSuppliers,
  bloodDonors: seedBloodDonors,
  bloodUnits: seedBloodUnits,
  bloodRequests: seedBloodRequests,
  surgeries: seedSurgeries,
  emergencyCases: seedEmergencyCases,
  ambulances: seedAmbulances,
  maternityRecords: seedMaternityRecords,
  telemedicineSessions: seedTelemedicineSessions,
  notifications: seedNotifications,
  auditLogs: seedAuditLogs,
  documents: seedDocuments,
  stellarPayments: seedStellarPayments,
  centralRecords: seedCentralRecords,
}


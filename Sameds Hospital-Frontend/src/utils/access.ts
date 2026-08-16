import type { HMSState, CentralRecord, Patient, UserAccount } from '../types'

export function getVisiblePatientIdsForUser(user: UserAccount | null, state: HMSState): string[] {
  if (!user) return []

  if (user.role === 'Patient') {
    const patient = state.patients.find(p => p.userId === user.id || p.email === user.email)
    return patient ? [patient.id] : []
  }

  if (user.role === 'Doctor') {
    const doctorPatientIds = new Set<string>()
    state.patients.forEach(patient => {
      if (patient.assignedDoctorId === user.id || patient.assignedDoctorName === user.name) {
        doctorPatientIds.add(patient.id)
      }
    })
    state.appointments.forEach(appt => {
      if (appt.doctorId === user.id || appt.doctorName === user.name) {
        doctorPatientIds.add(appt.patientId)
      }
    })
    return Array.from(doctorPatientIds)
  }

  if (user.role === 'Nurse') {
    return state.patients
      .filter(patient => patient.assignedNurseId === user.id || patient.assignedNurseName === user.name)
      .map(patient => patient.id)
  }

  return state.patients.map(patient => patient.id)
}

export function getVisiblePatientsForUser(user: UserAccount | null, state: HMSState): Patient[] {
  const visibleIds = getVisiblePatientIdsForUser(user, state)
  if (!user) return []
  if (user.role === 'Doctor') {
    return state.patients.filter(patient => visibleIds.includes(patient.id))
  }
  if (user.role === 'Patient') {
    return state.patients.filter(patient => visibleIds.includes(patient.id))
  }
  return state.patients
}

export function canViewPatientRecord(user: UserAccount | null, patientId: string, state: HMSState): boolean {
  if (!user) return false
  if (user.role === 'Patient') {
    const patient = state.patients.find(p => p.userId === user.id || p.email === user.email)
    return Boolean(patient && patient.id === patientId)
  }

  if (user.role === 'Doctor' || user.role === 'Nurse') {
    return getVisiblePatientIdsForUser(user, state).includes(patientId)
  }

  return true
}

export function canEditCentralRecord(user: UserAccount | null, record: CentralRecord, state: HMSState): boolean {
  if (!user || !record) return false
  if (user.role !== 'Doctor' && user.role !== 'Nurse') return false

  const patient = state.patients.find(item => item.id === record.patientId)
  if (!patient) return false

  if (user.role === 'Doctor') {
    return Boolean(
      patient.assignedDoctorId === user.id
      || patient.assignedDoctorName === user.name
      || state.appointments.some(appt => appt.patientId === record.patientId && (appt.doctorId === user.id || appt.doctorName === user.name))
    )
  }

  return Boolean(patient.assignedNurseId === user.id || patient.assignedNurseName === user.name)
}

export function getVisibleCentralRecords(user: UserAccount | null, state: HMSState): CentralRecord[] {
  if (!user) return []

  if (user.role === 'Patient') {
    const patient = state.patients.find(p => p.userId === user.id || p.email === user.email)
    if (!patient) return []
    return state.centralRecords.filter(record => record.patientId === patient.id)
  }

  if (user.role === 'Doctor' || user.role === 'Nurse') {
    const visibleIds = getVisiblePatientIdsForUser(user, state)
    return state.centralRecords.filter(record => visibleIds.includes(record.patientId))
  }

  return state.centralRecords
}

export function buildCentralRecordFromPatient(patient: Patient, submittedBy: UserAccount | null, summary: string, type: CentralRecord['recordType'] = 'MedicalRecord'): Omit<CentralRecord, 'id' | 'submittedAt'> {
  return {
    patientId: patient.id,
    patientName: patient.name,
    patientBarcode: patient.barcode,
    recordType: type,
    recordId: patient.id,
    summary,
    submittedBy: submittedBy?.id ?? '',
    submittedByName: submittedBy?.name ?? 'System',
    branchId: submittedBy?.branchId ?? patient.branchId,
    isShared: true,
  }
}

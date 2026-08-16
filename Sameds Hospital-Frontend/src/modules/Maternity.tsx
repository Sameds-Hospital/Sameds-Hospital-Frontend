import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Baby, Plus } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { MaternityRecord } from '../types'

export function Maternity() {
  const { state, dispatch, nextId } = useHMS()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patientId: '', lmp: '', edd: '', gravida: '1', para: '0', gestationalAge: '', riskLevel: 'Low' as MaternityRecord['riskLevel'], attendingOb: '', antenatalVisits: '0', deliveryType: 'Pending' as MaternityRecord['deliveryType'], babyWeight: '', babyGender: 'Unknown' as MaternityRecord['babyGender'] })

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === form.patientId)
    const mat: MaternityRecord = {
      id: nextId('MAT', state.maternityRecords),
      patientName: patient?.name ?? '',
      deliveredAt: '',
      status: 'Antenatal',
      ...form,
      gravida: Number(form.gravida),
      para: Number(form.para),
      antenatalVisits: Number(form.antenatalVisits),
    }
    dispatch({ type: 'ADD_MATERNITY_RECORD', payload: mat })
    setShowForm(false)
  }

  const columns: Column<MaternityRecord>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'lmp', label: 'LMP', sortable: true },
    { key: 'edd', label: 'EDD' },
    { key: 'gestationalAge', label: 'Gest. Age' },
    { key: 'gravida', label: 'G' },
    { key: 'para', label: 'P' },
    { key: 'riskLevel', label: 'Risk', badge: true },
    { key: 'attendingOb', label: 'OB/GYN' },
    { key: 'antenatalVisits', label: 'Visits' },
    { key: 'status', label: 'Status', badge: true },
  ]

  return (
    <div className="module-page">
      <PageHeader
        title="Maternity & Child Care"
        subtitle="Antenatal, delivery and postnatal care"
        icon={<Baby size={22} />}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Record
          </button>
        }
      />

      <div className="mini-stats-row">
        {(['Antenatal','In Labour','Postnatal','Discharged'] as MaternityRecord['status'][]).map(s => (
          <div key={s} className="mini-stat"><Badge variant={statusVariant(s)}>{s}</Badge><strong>{state.maternityRecords.filter(m => m.status === s).length}</strong></div>
        ))}
      </div>

      <SectionCard title="Maternity Records" noPad>
        <DataTable columns={columns} data={state.maternityRecords} searchable searchKeys={['patientName','attendingOb']} />
      </SectionCard>

      {showForm && (
        <Modal title="Create Maternity Record" onClose={() => setShowForm(false)} size="lg">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={form.patientId} onChange={set} required options={state.patients.filter(p => p.gender === 'Female').map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))} />
            <FormField label="Last Menstrual Period" name="lmp" type="date" value={form.lmp} onChange={set} required />
            <FormField label="Estimated Delivery Date" name="edd" type="date" value={form.edd} onChange={set} required />
            <FormField label="Gestational Age" name="gestationalAge" value={form.gestationalAge} onChange={set} placeholder="e.g. 32 weeks" />
            <FormField label="Gravida (G)" name="gravida" type="number" value={form.gravida} onChange={set} min={1} />
            <FormField label="Para (P)" name="para" type="number" value={form.para} onChange={set} min={0} />
            <FormField label="Risk Level" name="riskLevel" type="select" value={form.riskLevel} onChange={set} options={['Low','Medium','High'].map(v => ({ value: v, label: v }))} />
            <FormField label="Attending OB/GYN" name="attendingOb" type="select" value={form.attendingOb} onChange={set} options={state.doctors.filter(d => d.department === 'Obstetrics & Gynecology').map(d => ({ value: d.name, label: d.name }))} />
            <FormField label="Antenatal Visits" name="antenatalVisits" type="number" value={form.antenatalVisits} onChange={set} min={0} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Create Record</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Pill, Plus, AlertTriangle } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { Medicine, PrescriptionDispense } from '../types'

type Tab = 'inventory' | 'dispense' | 'prescriptions'

const MED_EMPTY: Omit<Medicine, 'id' | 'status'> = {
  name: '', genericName: '', brand: '', category: '', form: 'Tablet', dosage: '',
  unit: 'Tablet', stock: 0, reorderLevel: 50, expiryDate: '', supplier: '',
  purchasePrice: 0, sellingPrice: 0,
}

export function Pharmacy() {
  const { state, dispatch, nextId, currentUser } = useHMS()
  const [tab, setTab] = useState<Tab>('inventory')
  const [showMed, setShowMed] = useState(false)
  const [showDispense, setShowDispense] = useState(false)
  const [medForm, setMedForm] = useState({ ...MED_EMPTY })
  const [dispForm, setDispForm] = useState({ prescriptionId: '', patientId: '', medicineName: '', quantity: '1' })

  const setM = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setMedForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setD = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDispForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const medStatus = (m: Medicine): Medicine['status'] => {
    if (m.stock === 0) return 'Out of Stock'
    const today = new Date().toISOString().slice(0, 10)
    if (m.expiryDate && m.expiryDate < today) return 'Expired'
    if (m.stock <= m.reorderLevel) return 'Low Stock'
    return 'In Stock'
  }

  const submitMed = (e: FormEvent) => {
    e.preventDefault()
    const med: Medicine = {
      ...medForm,
      stock: Number(medForm.stock), reorderLevel: Number(medForm.reorderLevel),
      purchasePrice: Number(medForm.purchasePrice), sellingPrice: Number(medForm.sellingPrice),
      id: nextId('MED', state.medicines),
      status: medStatus({ ...medForm, stock: Number(medForm.stock), reorderLevel: Number(medForm.reorderLevel), id: '' } as Medicine),
    }
    dispatch({ type: 'ADD_MEDICINE', payload: med })
    setMedForm({ ...MED_EMPTY })
    setShowMed(false)
  }

  const submitDispense = (e: FormEvent) => {
    e.preventDefault()
    const rx = state.prescriptions.find(r => r.id === dispForm.prescriptionId)
    const patient = state.patients.find(p => p.id === dispForm.patientId)
    const disp: PrescriptionDispense = {
      id: nextId('DSP', state.dispenses),
      prescriptionId: dispForm.prescriptionId,
      patientId: dispForm.patientId,
      patientName: rx?.patientName ?? patient?.name ?? '',
      medicineId: '',
      medicineName: dispForm.medicineName,
      quantity: Number(dispForm.quantity),
      dispensedBy: currentUser?.name ?? '',
      dispensedAt: new Date().toISOString(),
      status: 'Dispensed',
    }
    dispatch({ type: 'ADD_DISPENSE', payload: disp })
    if (rx) dispatch({ type: 'UPDATE_PRESCRIPTION', payload: { ...rx, status: 'Dispensed' } })
    setShowDispense(false)
  }

  const medCols: Column<Medicine>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: 'Drug Name', sortable: true },
    { key: 'genericName', label: 'Generic' },
    { key: 'form', label: 'Form' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'stock', label: 'Stock', sortable: true },
    { key: 'reorderLevel', label: 'Reorder' },
    { key: 'expiryDate', label: 'Expiry', sortable: true },
    { key: 'sellingPrice', label: 'Price (USD)', render: m => `$${m.sellingPrice}` },
    { key: 'status', label: 'Status', badge: true, sortable: true },
  ]

  const dispCols: Column<PrescriptionDispense>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'medicineName', label: 'Medicine' },
    { key: 'quantity', label: 'Qty' },
    { key: 'dispensedBy', label: 'By' },
    { key: 'dispensedAt', label: 'Date', render: d => new Date(d.dispensedAt).toLocaleDateString() },
    { key: 'status', label: 'Status', badge: true },
  ]

  const alerts = state.medicines.filter(m => m.status === 'Low Stock' || m.status === 'Out of Stock' || m.status === 'Expired')

  return (
    <div className="module-page">
      <PageHeader
        title="Pharmacy Management"
        subtitle="Drug inventory, dispensing & stock alerts"
        icon={<Pill size={22} />}
        actions={
          <div className="btn-group">
            <button type="button" className="btn btn--primary" onClick={() => setShowMed(true)}><Plus size={14} /> Add Drug</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowDispense(true)}><Pill size={14} /> Dispense</button>
          </div>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Total Drugs</span><strong>{state.medicines.length}</strong></div>
        <div className="mini-stat"><Badge variant="green">In Stock</Badge><strong>{state.medicines.filter(m => m.status === 'In Stock').length}</strong></div>
        <div className="mini-stat"><Badge variant="yellow">Low Stock</Badge><strong>{state.medicines.filter(m => m.status === 'Low Stock').length}</strong></div>
        <div className="mini-stat"><Badge variant="red">Out of Stock</Badge><strong>{state.medicines.filter(m => m.status === 'Out of Stock').length}</strong></div>
        <div className="mini-stat"><Badge variant="red">Expired</Badge><strong>{state.medicines.filter(m => m.status === 'Expired').length}</strong></div>
      </div>

      {alerts.length > 0 && (
        <SectionCard title="Stock Alerts">
          <div className="alert-list">
            {alerts.map(m => (
              <div key={m.id} className={`alert-item alert-item--${m.status === 'In Stock' ? 'warning' : 'error'}`}>
                <AlertTriangle size={14} />
                <span>{m.status === 'Out of Stock' ? '⛔' : m.status === 'Expired' ? '🗓' : '⚠️'} {m.name} {m.dosage} — {m.status} (Stock: {m.stock} {m.unit})</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="tab-bar">
        <button type="button" className={`tab-btn${tab === 'inventory' ? ' tab-btn--active' : ''}`} onClick={() => setTab('inventory')}>Drug Inventory</button>
        <button type="button" className={`tab-btn${tab === 'dispense' ? ' tab-btn--active' : ''}`} onClick={() => setTab('dispense')}>Dispense Log</button>
        <button type="button" className={`tab-btn${tab === 'prescriptions' ? ' tab-btn--active' : ''}`} onClick={() => setTab('prescriptions')}>Active Prescriptions</button>
      </div>

      <SectionCard noPad>
        {tab === 'inventory' && <DataTable columns={medCols} data={state.medicines} searchable searchKeys={['name','genericName','category']} />}
        {tab === 'dispense' && <DataTable columns={dispCols} data={state.dispenses} searchable searchKeys={['patientName','medicineName']} />}
        {tab === 'prescriptions' && (
          <DataTable
            columns={[
              { key: 'id', label: 'ID', width: '100px' },
              { key: 'patientName', label: 'Patient', sortable: true },
              { key: 'doctorName', label: 'Doctor' },
              { key: 'medication', label: 'Medication' },
              { key: 'dosage', label: 'Dosage' },
              { key: 'frequency', label: 'Frequency' },
              { key: 'status', label: 'Status', badge: true },
              {
                key: 'actions', label: '', width: '100px',
                render: row => row.status === 'Active' ? (
                  <button type="button" className="btn btn--primary btn--sm" onClick={e => {
                    e.stopPropagation()
                    const disp: PrescriptionDispense = {
                      id: nextId('DSP', state.dispenses),
                      prescriptionId: row.id,
                      patientId: row.patientId,
                      patientName: row.patientName,
                      medicineId: '',
                      medicineName: row.medication,
                      quantity: 1,
                      dispensedBy: currentUser?.name ?? 'Pharmacist',
                      dispensedAt: new Date().toISOString(),
                      status: 'Dispensed',
                    }
                    dispatch({ type: 'ADD_DISPENSE', payload: disp })
                    dispatch({ type: 'UPDATE_PRESCRIPTION', payload: { ...row, status: 'Dispensed' } })
                    // Auto-invoice for dispensed drug
                    const med = state.medicines.find(m => m.name.toLowerCase().includes(row.medication.toLowerCase()))
                    dispatch({
                      type: 'ADD_INVOICE',
                      payload: {
                        id: nextId('INV', state.invoices),
                        patientId: row.patientId,
                        patientName: row.patientName,
                        department: 'Pharmacy',
                        items: [{ description: `Medication: ${row.medication} ${row.dosage}`, quantity: 1, unitPrice: med?.sellingPrice ?? 30, total: med?.sellingPrice ?? 30 }],
                        subtotal: med?.sellingPrice ?? 30, discount: 0, tax: 0,
                        total: med?.sellingPrice ?? 30,
                        insuranceCoverage: 0, amountDue: med?.sellingPrice ?? 30, currency: 'GHS',
                        status: 'Issued',
                        issuedAt: new Date().toISOString(),
                        dueAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
                      },
                    })
                  }}>
                    Dispense
                  </button>
                ) : <Badge variant="gray">{row.status}</Badge>,
              },
            ]}
            data={state.prescriptions}
            searchable searchKeys={['patientName','medication']}
          />
        )}
      </SectionCard>

      {showMed && (
        <Modal title="Add Drug to Inventory" onClose={() => setShowMed(false)} size="lg">
          <form onSubmit={submitMed} className="form-grid-2">
            <FormField label="Drug Name" name="name" value={medForm.name} onChange={setM} required />
            <FormField label="Generic Name" name="genericName" value={medForm.genericName} onChange={setM} />
            <FormField label="Brand" name="brand" value={medForm.brand} onChange={setM} />
            <FormField label="Category" name="category" value={medForm.category} onChange={setM} required />
            <FormField label="Form" name="form" type="select" value={medForm.form} onChange={setM}
              options={['Tablet','Capsule','Syrup','Injection','Cream','Drops','Inhaler'].map(v => ({ value: v, label: v }))} />
            <FormField label="Dosage" name="dosage" value={medForm.dosage} onChange={setM} required placeholder="e.g. 500mg" />
            <FormField label="Stock Quantity" name="stock" type="number" value={medForm.stock} onChange={setM} required min={0} />
            <FormField label="Reorder Level" name="reorderLevel" type="number" value={medForm.reorderLevel} onChange={setM} min={0} />
            <FormField label="Expiry Date" name="expiryDate" type="date" value={medForm.expiryDate} onChange={setM} required />
            <FormField label="Supplier" name="supplier" value={medForm.supplier} onChange={setM} />
            <FormField label="Purchase Price (USD)" name="purchasePrice" type="number" value={medForm.purchasePrice} onChange={setM} step="0.01" min={0} />
            <FormField label="Selling Price (USD)" name="sellingPrice" type="number" value={medForm.sellingPrice} onChange={setM} step="0.01" min={0} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowMed(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Add Drug</button>
            </div>
          </form>
        </Modal>
      )}

      {showDispense && (
        <Modal title="Dispense Medication" onClose={() => setShowDispense(false)} size="md">
          <form onSubmit={submitDispense} className="form-grid-2">
            <FormField label="Prescription" name="prescriptionId" type="select" value={dispForm.prescriptionId} onChange={setD}
              options={state.prescriptions.filter(p => p.status === 'Active').map(p => ({ value: p.id, label: `${p.id} – ${p.patientName} – ${p.medication}` }))} />
            <FormField label="Patient" name="patientId" type="select" value={dispForm.patientId} onChange={setD}
              options={state.patients.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))} />
            <FormField label="Medicine" name="medicineName" value={dispForm.medicineName} onChange={setD} required />
            <FormField label="Quantity" name="quantity" type="number" value={dispForm.quantity} onChange={setD} required min={1} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowDispense(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Dispense</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}


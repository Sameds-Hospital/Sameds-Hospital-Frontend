import { useState, type FormEvent, type ChangeEvent } from 'react'
import { CreditCard, Plus, CheckCircle, FileText, FileDown } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { exportInvoicePDF } from '../utils/pdfExport'
import type { Invoice, Payment } from '../types'

type Tab = 'invoices' | 'payments'

export function Billing() {
  const { state, dispatch, nextId, currentUser } = useHMS()
  const [tab, setTab] = useState<Tab>('invoices')
  const [showInvoice, setShowInvoice] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  const [invForm, setInvForm] = useState({
    patientId: '', department: '', description: '', amount: '', discount: '0', tax: '0', insuranceCoverage: '0', dueAt: new Date().toISOString().slice(0,10)
  })
  const [payForm, setPayForm] = useState({
    invoiceId: '', amount: '', method: 'Cash' as Payment['method'], reference: ''
  })

  const setInv = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setInvForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setPay = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setPayForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submitInvoice = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === invForm.patientId)
    const amt = Number(invForm.amount)
    const disc = Number(invForm.discount)
    const tax = Number(invForm.tax)
    const ins = Number(invForm.insuranceCoverage)
    const total = amt - disc + tax
    const inv: Invoice = {
      id: nextId('INV', state.invoices),
      patientId: invForm.patientId,
      patientName: patient?.name ?? '',
      department: invForm.department,
      items: [{ description: invForm.description, quantity: 1, unitPrice: amt, total: amt }],
      subtotal: amt, discount: disc, tax, total,
      insuranceCoverage: ins, amountDue: total - ins,
      currency: 'USD', status: 'Issued',
      issuedAt: new Date().toISOString(), dueAt: invForm.dueAt,
    }
    dispatch({ type: 'ADD_INVOICE', payload: inv })
    setShowInvoice(false)
  }

  const submitPayment = (e: FormEvent) => {
    e.preventDefault()
    const invoice = state.invoices.find(i => i.id === payForm.invoiceId)
    const pay: Payment = {
      id: nextId('PAY', state.payments),
      invoiceId: payForm.invoiceId,
      patientId: invoice?.patientId ?? '',
      patientName: invoice?.patientName ?? '',
      amount: Number(payForm.amount),
      method: payForm.method,
      reference: payForm.reference,
      processedBy: currentUser?.name ?? '',
      paidAt: new Date().toISOString(),
      status: 'Completed',
    }
    dispatch({ type: 'ADD_PAYMENT', payload: pay })
    if (invoice) dispatch({ type: 'UPDATE_INVOICE', payload: { ...invoice, status: 'Paid' } })
    setShowPayment(false)
  }

  const totalRevenue = state.payments.filter(p => p.status === 'Completed').reduce((s, p) => s + p.amount, 0)
  const totalPending = state.invoices.filter(i => i.status === 'Issued' || i.status === 'Overdue').reduce((s, i) => s + i.amountDue, 0)

  const invCols: Column<Invoice>[] = [
    { key: 'id', label: 'Invoice ID', width: '130px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'department', label: 'Department' },
    { key: 'total', label: 'Total (USD)', render: i => `$${i.total.toFixed(2)}` },
    { key: 'insuranceCoverage', label: 'Insurance', render: i => `$${i.insuranceCoverage.toFixed(2)}` },
    { key: 'amountDue', label: 'Amount Due', render: i => `$${i.amountDue.toFixed(2)}` },
    { key: 'status', label: 'Status', badge: true, sortable: true },
    { key: 'issuedAt', label: 'Issued', render: i => new Date(i.issuedAt).toLocaleDateString() },
    { key: 'dueAt', label: 'Due Date', sortable: true },
    {
      key: 'actions', label: '', width: '80px',
      render: row => (
        <div className="row-actions">
          <button type="button" className="icon-btn" title="View" onClick={e => { e.stopPropagation(); setViewInvoice(row) }}><FileText size={14} /></button>
          <button type="button" className="icon-btn" title="Export PDF" onClick={e => { e.stopPropagation(); exportInvoicePDF(row) }}><FileDown size={14} /></button>
          {(row.status === 'Issued' || row.status === 'Overdue') && (
            <button type="button" className="icon-btn icon-btn--green" title="Mark paid" onClick={e => { e.stopPropagation(); dispatch({ type: 'UPDATE_INVOICE', payload: { ...row, status: 'Paid' } }) }}><CheckCircle size={14} /></button>
          )}
        </div>
      ),
    },
  ]

  const payCols: Column<Payment>[] = [
    { key: 'id', label: 'Payment ID', width: '120px' },
    { key: 'invoiceId', label: 'Invoice' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'amount', label: 'Amount (USD)', render: p => `$${p.amount.toFixed(2)}` },
    { key: 'method', label: 'Method', badge: true },
    { key: 'reference', label: 'Reference' },
    { key: 'processedBy', label: 'By' },
    { key: 'paidAt', label: 'Date', render: p => new Date(p.paidAt).toLocaleDateString() },
    { key: 'status', label: 'Status', badge: true },
  ]

  return (
    <div className="module-page">
      <PageHeader
        title="Billing & Payments"
        subtitle="Invoices, payments and financial records"
        icon={<CreditCard size={22} />}
        actions={
          <div className="btn-group">
            <button type="button" className="btn btn--primary" onClick={() => setShowInvoice(true)}><Plus size={14} /> New Invoice</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowPayment(true)}><CheckCircle size={14} /> Record Payment</button>
          </div>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Revenue Collected</span><strong>${totalRevenue.toLocaleString()}</strong></div>
        <div className="mini-stat"><span>Outstanding</span><strong>${totalPending.toLocaleString()}</strong></div>
        <div className="mini-stat"><Badge variant="green">Paid</Badge><strong>{state.invoices.filter(i => i.status === 'Paid').length}</strong></div>
        <div className="mini-stat"><Badge variant="yellow">Issued</Badge><strong>{state.invoices.filter(i => i.status === 'Issued').length}</strong></div>
        <div className="mini-stat"><Badge variant="red">Overdue</Badge><strong>{state.invoices.filter(i => i.status === 'Overdue').length}</strong></div>
      </div>

      <div className="tab-bar">
        <button type="button" className={`tab-btn${tab === 'invoices' ? ' tab-btn--active' : ''}`} onClick={() => setTab('invoices')}>Invoices</button>
        <button type="button" className={`tab-btn${tab === 'payments' ? ' tab-btn--active' : ''}`} onClick={() => setTab('payments')}>Payments</button>
      </div>

      <SectionCard noPad>
        {tab === 'invoices' && <DataTable columns={invCols} data={state.invoices} searchable searchKeys={['patientName','id','department']} />}
        {tab === 'payments' && <DataTable columns={payCols} data={state.payments} searchable searchKeys={['patientName','invoiceId','method']} />}
      </SectionCard>

      {showInvoice && (
        <Modal title="Create Invoice" onClose={() => setShowInvoice(false)} size="md">
          <form onSubmit={submitInvoice} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={invForm.patientId} onChange={setInv} required
              options={state.patients.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))} />
            <FormField label="Department" name="department" type="select" value={invForm.department} onChange={setInv}
              options={state.departments.map(d => ({ value: d.name, label: d.name }))} />
            <FormField label="Description" name="description" value={invForm.description} onChange={setInv} required placeholder="Service / procedure" />
                  <FormField label="Amount (USD)" name="amount" type="number" value={invForm.amount} onChange={setInv} required min={0} step="0.01" />
                  <FormField label="Discount (USD)" name="discount" type="number" value={invForm.discount} onChange={setInv} min={0} step="0.01" />
                  <FormField label="Tax (USD)" name="tax" type="number" value={invForm.tax} onChange={setInv} min={0} step="0.01" />
                  <FormField label="Insurance Coverage (USD)" name="insuranceCoverage" type="number" value={invForm.insuranceCoverage} onChange={setInv} min={0} step="0.01" />
            <FormField label="Due Date" name="dueAt" type="date" value={invForm.dueAt} onChange={setInv} required />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowInvoice(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Create Invoice</button>
            </div>
          </form>
        </Modal>
      )}

      {showPayment && (
        <Modal title="Record Payment" onClose={() => setShowPayment(false)} size="md">
          <form onSubmit={submitPayment} className="form-grid-2">
            <FormField label="Invoice" name="invoiceId" type="select" value={payForm.invoiceId} onChange={setPay} required
              options={state.invoices.filter(i => i.status !== 'Paid').map(i => ({ value: i.id, label: `${i.id} – ${i.patientName} – $${i.amountDue}` }))} />
            <FormField label="Amount (USD)" name="amount" type="number" value={payForm.amount} onChange={setPay} required min={0} step="0.01" />
            <FormField label="Payment Method" name="method" type="select" value={payForm.method} onChange={setPay}
              options={['Cash','Card','Bank Transfer','Insurance','Stellar/XLM'].map(v => ({ value: v, label: v }))} />
            <FormField label="Reference / Receipt No." name="reference" value={payForm.reference} onChange={setPay} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowPayment(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Record Payment</button>
            </div>
          </form>
        </Modal>
      )}

      {viewInvoice && (
        <Modal title={`Invoice – ${viewInvoice.id}`} onClose={() => setViewInvoice(null)} size="md">
          <div className="invoice-view">
            <div className="invoice-view__header">
              <div><strong>Sameds Hospital</strong><br />Main Campus – Accra</div>
              <div className="invoice-view__meta">
                <span>Invoice: {viewInvoice.id}</span>
                <span>Date: {new Date(viewInvoice.issuedAt).toLocaleDateString()}</span>
                <span>Due: {viewInvoice.dueAt}</span>
                <Badge variant={statusVariant(viewInvoice.status)}>{viewInvoice.status}</Badge>
              </div>
            </div>
            <div className="invoice-view__patient">
              <strong>Bill To:</strong> {viewInvoice.patientName} · {viewInvoice.department}
            </div>
            <table className="mini-table">
              <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
              <tbody>
                {viewInvoice.items.map((item, i) => (
                  <tr key={i}><td>{item.description}</td><td>{item.quantity}</td><td>${item.unitPrice.toFixed(2)}</td><td>${item.total.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="invoice-view__totals">
              <div><span>Subtotal</span><span>${viewInvoice.subtotal.toFixed(2)}</span></div>
              <div><span>Discount</span><span>- ${viewInvoice.discount.toFixed(2)}</span></div>
              <div><span>Tax</span><span>+ ${viewInvoice.tax.toFixed(2)}</span></div>
              <div className="invoice-view__total-line"><span>Total</span><strong>${viewInvoice.total.toFixed(2)}</strong></div>
              <div><span>Insurance Coverage</span><span>- ${viewInvoice.insuranceCoverage.toFixed(2)}</span></div>
              <div className="invoice-view__due-line"><span>Amount Due</span><strong>${viewInvoice.amountDue.toFixed(2)}</strong></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}


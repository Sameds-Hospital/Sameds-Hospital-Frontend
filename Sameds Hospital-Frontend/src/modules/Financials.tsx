import { useState, type FormEvent, type ChangeEvent } from 'react'
import { DollarSign, Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { Expense } from '../types'

export function Financials() {
  const { state, dispatch, nextId, currentUser } = useHMS()
  const [showExpense, setShowExpense] = useState(false)
  const [form, setForm] = useState({ category: '', description: '', amount: '', department: '', paidTo: '', date: new Date().toISOString().slice(0,10) })

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const exp: Expense = {
      id: nextId('EXP', state.expenses),
      ...form, amount: Number(form.amount),
      approvedBy: currentUser?.name ?? 'Admin',
      status: 'Pending',
    }
    dispatch({ type: 'ADD_EXPENSE', payload: exp })
    setShowExpense(false)
  }

  const totalRevenue = state.payments.filter(p => p.status === 'Completed').reduce((s, p) => s + p.amount, 0)
  const totalExpenses = state.expenses.filter(e => e.status === 'Paid').reduce((s, e) => s + Number(e.amount), 0)
  const netProfit = totalRevenue - totalExpenses
  const outstanding = state.invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').reduce((s, i) => s + i.amountDue, 0)

  // Monthly breakdown (dummy enrichment from seed data)
  const monthlyData = [
    { month: 'Mar', revenue: 18400, expenses: 12100 },
    { month: 'Apr', revenue: 21200, expenses: 13500 },
    { month: 'May', revenue: 19800, expenses: 11800 },
    { month: 'Jun', revenue: 24500, expenses: 14200 },
    { month: 'Jul', revenue: 22300, expenses: 13700 },
    { month: 'Aug', revenue: totalRevenue || 26100, expenses: totalExpenses || 15400 },
  ]

  // Group expenses by category
  const byCategory: Record<string, number> = {}
  state.expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount) })

  const expCols: Column<Expense>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'category', label: 'Category', badge: true, sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount (USD)', render: e => `$${Number(e.amount).toLocaleString()}`, sortable: true },
    { key: 'department', label: 'Department' },
    { key: 'paidTo', label: 'Paid To' },
    { key: 'approvedBy', label: 'Approved By' },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'status', label: 'Status', badge: true },
  ]

  return (
    <div className="module-page">
      <PageHeader
        title="Financial Management"
        subtitle="Revenue, expenses and profit/loss overview"
        icon={<DollarSign size={22} />}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setShowExpense(true)}>
            <Plus size={16} /> Record Expense
          </button>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Total Revenue</span><strong className="text-green">${totalRevenue.toLocaleString()}</strong></div>
        <div className="mini-stat"><span>Total Expenses</span><strong className="text-red">${totalExpenses.toLocaleString()}</strong></div>
        <div className="mini-stat"><span>Net Profit</span><strong className={netProfit >= 0 ? 'text-green' : 'text-red'}>${netProfit.toLocaleString()}</strong></div>
        <div className="mini-stat"><span>Outstanding</span><strong className="text-yellow">${outstanding.toLocaleString()}</strong></div>
      </div>

      <SectionCard title="Monthly Revenue vs Expenses">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
            <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} name="Revenue (USD)" />
            <Bar dataKey="expenses" fill="#ef4444" radius={[4,4,0,0]} name="Expenses (USD)" />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <div className="dashboard-charts-row">
        <SectionCard title="Expense Breakdown by Category">
          <div className="category-list">
            {Object.entries(byCategory).map(([cat, total]) => (
              <div key={cat} className="category-row">
                <span>{cat}</span>
                <div className="category-bar">
                  <div className="category-fill" style={{ width: `${Math.min(100, (total / totalExpenses) * 100 || 20)}%` }} />
                </div>
                <strong>${total.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Payment Methods Breakdown">
          <div className="category-list">
            {(['Cash','Card','Bank Transfer','Insurance','Stellar/XLM'] as const).map(method => {
              const total = state.payments.filter(p => p.method === method && p.status === 'Completed').reduce((s,p) => s + p.amount, 0)
              return (
                <div key={method} className="category-row">
                  <span>{method}</span>
                  <div className="category-bar">
                    <div className="category-fill" style={{ width: `${totalRevenue ? Math.min(100, (total / totalRevenue) * 100) : 20}%` }} />
                  </div>
                  <strong>${total.toLocaleString()}</strong>
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Expense Ledger" noPad>
        <DataTable columns={expCols} data={state.expenses} searchable searchKeys={['category','description','department','paidTo']} />
      </SectionCard>

      {showExpense && (
        <Modal title="Record Expense" onClose={() => setShowExpense(false)} size="md">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <FormField label="Category" name="category" type="select" value={form.category} onChange={set} required
              options={['Medical Supplies','Equipment','Utilities','Staff Training','Maintenance','Administration','Other'].map(v => ({ value: v, label: v }))} />
            <FormField label="Department" name="department" type="select" value={form.department} onChange={set}
              options={state.departments.map(d => ({ value: d.name, label: d.name }))} />
            <FormField label="Description" name="description" value={form.description} onChange={set} required />
            <FormField label="Amount (USD)" name="amount" type="number" value={form.amount} onChange={set} required min={0} step="0.01" />
            <FormField label="Paid To" name="paidTo" value={form.paidTo} onChange={set} required />
            <FormField label="Date" name="date" type="date" value={form.date} onChange={set} required />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowExpense(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Record Expense</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}


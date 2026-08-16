import { useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Users, CalendarDays, DollarSign, BedDouble,
  FlaskConical, Pill, AlertTriangle, Droplets,
  TrendingUp, Clock,
} from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { StatCard } from '../components/ui/StatCard'
import { SectionCard } from '../components/ui/SectionCard'
import { Badge, statusVariant } from '../components/ui/Badge'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const MONTHLY_REVENUE = [
  { month: 'Mar', revenue: 18400, expenses: 12100 },
  { month: 'Apr', revenue: 21200, expenses: 13500 },
  { month: 'May', revenue: 19800, expenses: 11800 },
  { month: 'Jun', revenue: 24500, expenses: 14200 },
  { month: 'Jul', revenue: 22300, expenses: 13700 },
  { month: 'Aug', revenue: 26100, expenses: 15400 },
]

const ADMISSIONS_TREND = [
  { day: 'Mon', admissions: 4, discharges: 3 },
  { day: 'Tue', admissions: 6, discharges: 5 },
  { day: 'Wed', admissions: 3, discharges: 4 },
  { day: 'Thu', admissions: 7, discharges: 6 },
  { day: 'Fri', admissions: 5, discharges: 4 },
  { day: 'Sat', admissions: 2, discharges: 3 },
  { day: 'Sun', admissions: 4, discharges: 2 },
]

export function Dashboard() {
  const { state, setActiveModule } = useHMS()

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const rangeMs = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 99999
  const since = new Date(Date.now() - rangeMs * 86400000).toISOString()

  const stats = useMemo(() => {
    const totalRevenue = state.payments
      .filter(p => p.status === 'Completed' && p.paidAt >= since)
      .reduce((s, p) => s + p.amount, 0)
    const occupiedBeds = state.beds.filter(b => b.status === 'Occupied').length
    const totalBeds = state.beds.length
    const lowStock = state.medicines.filter(m => m.status === 'Low Stock' || m.status === 'Out of Stock').length
    const pendingTests = state.labTests.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length
    const todayAppts = state.appointments.filter(a => a.date === new Date().toISOString().slice(0, 10)).length
    const bloodUnits = state.bloodUnits.filter(b => b.status === 'Available').length
    const openEmergency = state.emergencyCases.filter(e => e.disposition === 'Pending').length

    return { totalRevenue, occupiedBeds, totalBeds, lowStock, pendingTests, todayAppts, bloodUnits, openEmergency }
  }, [state, since])

  const deptPatients = useMemo(() => {
    const counts: Record<string, number> = {}
    state.appointments.forEach(a => {
      counts[a.department] = (counts[a.department] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [state.appointments])

  const bedStatus = useMemo(() => [
    { name: 'Occupied', value: state.beds.filter(b => b.status === 'Occupied').length },
    { name: 'Available', value: state.beds.filter(b => b.status === 'Available').length },
    { name: 'Reserved', value: state.beds.filter(b => b.status === 'Reserved').length },
    { name: 'Maintenance', value: state.beds.filter(b => b.status === 'Maintenance').length },
  ], [state.beds])

  const recentPatients = state.patients.slice(0, 5)
  const recentAppts = state.appointments.slice(0, 5)
  const alerts = [
    ...state.medicines.filter(m => m.status === 'Low Stock').map(m => ({ type: 'warning', msg: `Low stock: ${m.name} (${m.stock} ${m.unit})` })),
    ...state.medicines.filter(m => m.status === 'Out of Stock').map(m => ({ type: 'error', msg: `Out of stock: ${m.name}` })),
    ...state.inventoryItems.filter(i => i.status === 'Low Stock').map(i => ({ type: 'warning', msg: `Low inventory: ${i.name}` })),
    ...state.bloodRequests.filter(r => r.status === 'Pending').map(r => ({ type: 'error', msg: `Blood request pending: ${r.bloodType} for ${r.patientName}` })),
    ...state.emergencyCases.filter(e => e.disposition === 'Pending').map(e => ({ type: 'error', msg: `Emergency: ${e.patientName} — ${e.triageLevel}` })),
  ].slice(0, 6)

  return (
    <div className="module-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Hospital Dashboard</h1>
          <p className="dashboard-subtitle">Sameds Hospital – Main Campus · Real-time overview</p>
        </div>
        <div className="dashboard-date">
          <Clock size={16} />
          <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
          <div className="date-range-filter">
            {(['7d','30d','90d','all'] as const).map(r => (
              <button key={r} type="button" className={`date-range-btn${dateRange === r ? ' date-range-btn--active' : ''}`} onClick={() => setDateRange(r)}>
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="stats-row">
        <StatCard label="Total Patients" value={state.patients.length} icon={<Users size={20} />} sub="Registered" variant="blue" onClick={() => setActiveModule('patients')} />
        <StatCard label="Today's Appointments" value={stats.todayAppts} icon={<CalendarDays size={20} />} sub="Scheduled today" variant="purple" onClick={() => setActiveModule('appointments')} />
        <StatCard label="Revenue (USD)" value={`$${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign size={20} />} sub="Payments received" variant="green" onClick={() => setActiveModule('billing')} />
        <StatCard label="Bed Occupancy" value={`${stats.occupiedBeds}/${stats.totalBeds}`} icon={<BedDouble size={20} />} sub="Beds in use" variant="yellow" onClick={() => setActiveModule('inpatient')} />
        <StatCard label="Pending Lab Tests" value={stats.pendingTests} icon={<FlaskConical size={20} />} sub="Awaiting results" variant="blue" onClick={() => setActiveModule('laboratory')} />
        <StatCard label="Drug Stock Alerts" value={stats.lowStock} icon={<Pill size={20} />} sub="Low / out of stock" variant="red" onClick={() => setActiveModule('pharmacy')} />
        <StatCard label="Blood Units" value={stats.bloodUnits} icon={<Droplets size={20} />} sub="Available units" variant="blue" onClick={() => setActiveModule('bloodbank')} />
        <StatCard label="Open Emergencies" value={stats.openEmergency} icon={<AlertTriangle size={20} />} sub="Active cases" variant="red" onClick={() => setActiveModule('emergency')} />
      </div>

      {/* Charts Row 1 */}
      <div className="dashboard-charts-row">
        <SectionCard title="Revenue vs Expenses (6 months)" className="chart-card--wide">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_REVENUE} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRev)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#colorExp)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Bed Status" className="chart-card--sm">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={bedStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {bedStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Charts Row 2 */}
      <div className="dashboard-charts-row">
        <SectionCard title="Weekly Admissions vs Discharges">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ADMISSIONS_TREND} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Bar dataKey="admissions" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Admissions" />
              <Bar dataKey="discharges" fill="#10b981" radius={[4, 4, 0, 0]} name="Discharges" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Appointments by Department">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptPatients} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom-row">
        {/* Recent patients */}
        <SectionCard title="Recent Patients" actions={<button type="button" className="link-btn" onClick={() => setActiveModule('patients')}>View all</button>}>
          <table className="mini-table">
            <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Status</th></tr></thead>
            <tbody>
              {recentPatients.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.age}</td>
                  <td><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        {/* Upcoming appointments */}
        <SectionCard title="Upcoming Appointments" actions={<button type="button" className="link-btn" onClick={() => setActiveModule('appointments')}>View all</button>}>
          <table className="mini-table">
            <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {recentAppts.map(a => (
                <tr key={a.id}>
                  <td>{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td>{a.date} {a.time}</td>
                  <td><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        {/* Alerts */}
        <SectionCard title="System Alerts">
          <div className="alert-list">
            {alerts.length === 0 && <p className="empty-hint">No active alerts.</p>}
            {alerts.map((a, i) => (
              <div key={i} className={`alert-item alert-item--${a.type}`}>
                <TrendingUp size={14} />
                <span>{a.msg}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}


import { BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useHMS } from '../store/HMSContext'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16']

export function Reports() {
  const { state } = useHMS()

  // Patient stats by gender
  const genderData = [
    { name: 'Male', value: state.patients.filter(p => p.gender === 'Male').length },
    { name: 'Female', value: state.patients.filter(p => p.gender === 'Female').length },
    { name: 'Other', value: state.patients.filter(p => p.gender === 'Other').length },
  ]

  // Patient status
  const statusData = ['Active','In review','Admitted','Discharged','Emergency'].map(s => ({
    name: s, value: state.patients.filter(p => p.status === s).length,
  }))

  // Appointments by type
  const apptTypeData = ['Consultation','Follow-up','Lab','Scan','Procedure'].map(t => ({
    name: t, value: state.appointments.filter(a => a.type === t).length,
  }))

  // Doctor workload
  const doctorWorkload = state.doctors.map(d => ({
    name: d.name.replace('Dr. ', ''),
    appointments: state.appointments.filter(a => a.doctorId === d.id).length,
    records: state.medicalRecords.filter(r => r.doctorId === d.id).length,
  }))

  // Drug stock levels
  const drugStock = state.medicines.slice(0, 8).map(m => ({
    name: m.name.length > 14 ? m.name.slice(0, 14) + '…' : m.name,
    stock: m.stock,
    reorderLevel: m.reorderLevel,
  }))

  // Lab test status
  const labStatusData = ['Requested','Sample Collected','In Progress','Completed','Cancelled'].map(s => ({
    name: s, value: state.labTests.filter(t => t.status === s).length,
  }))

  // Revenue trend
  const revenueTrend = [
    { month: 'Mar', revenue: 18400 },
    { month: 'Apr', revenue: 21200 },
    { month: 'May', revenue: 19800 },
    { month: 'Jun', revenue: 24500 },
    { month: 'Jul', revenue: 22300 },
    { month: 'Aug', revenue: state.payments.reduce((s, p) => s + p.amount, 0) || 26100 },
  ]

  // Blood type availability
  const bloodData = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => ({
    name: bt, value: state.bloodUnits.filter(b => b.bloodType === bt && b.status === 'Available').length,
  }))

  return (
    <div className="module-page">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Statistical analysis and performance dashboards"
        icon={<BarChart3 size={22} />}
      />

      {/* Row 1 */}
      <div className="dashboard-charts-row">
        <SectionCard title="Patient Distribution by Gender">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Patient Status Breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4,4,0,0]} name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Appointment Types">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={apptTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {apptTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Row 2 */}
      <div className="dashboard-charts-row">
        <SectionCard title="Doctor Workload" className="chart-card--wide">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={doctorWorkload} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[0,4,4,0]} name="Appointments" />
              <Bar dataKey="records" fill="#10b981" radius={[0,4,4,0]} name="Records" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Lab Test Status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={labStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                {labStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Row 3 */}
      <div className="dashboard-charts-row">
        <SectionCard title="Drug Stock Levels">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={drugStock}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Bar dataKey="stock" fill="#10b981" radius={[4,4,0,0]} name="Current Stock" />
              <Bar dataKey="reorderLevel" fill="#f59e0b" radius={[4,4,0,0]} name="Reorder Level" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Revenue Trend (6 months)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} name="Revenue (NGN)" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Blood Bank Availability">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bloodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="value" fill="#ef4444" radius={[4,4,0,0]} name="Available Units" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  )
}


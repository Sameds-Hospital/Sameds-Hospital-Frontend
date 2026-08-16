import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useHMS, type SignupData } from '../../store/HMSContext'
import { UserPlus, Lock, User, Mail, Phone, Building2, ArrowLeft } from 'lucide-react'
import type { Role } from '../../types'

const ROLES: Role[] = ['Doctor', 'Nurse', 'Pharmacist', 'Cashier', 'LabTechnician', 'Radiologist', 'Receptionist']

const DEPARTMENTS = [
  'General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics & Gynecology',
  'Radiology', 'Laboratory', 'Pharmacy', 'Emergency', 'Cardiology', 'ICU', 'Administration',
]

interface SignupPageProps {
  onBack: () => void
}

export function SignupPage({ onBack }: SignupPageProps) {
  const { signup, login } = useHMS()
  const [form, setForm] = useState<SignupData>({
    name: '', username: '', email: '', phone: '',
    password: '', role: 'Nurse', department: 'General Medicine', branchId: 'BR-001',
  })
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== confirm) { setError('Passwords do not match.'); return }
    if (!form.name.trim() || !form.username.trim() || !form.email.trim()) {
      setError('Name, username, and email are required.'); return
    }
    const result = signup(form)
    if (!result.ok) { setError(result.error ?? 'Signup failed.'); return }
    setSuccess('Account created! Logging you in...')
    setTimeout(() => login(form.username, form.password), 800)
  }

  return (
    <div className="login-page">
      <div className="login-page__card" style={{ width: 480 }}>
        <div className="login-page__brand">
          <span className="login-page__logo">🏥</span>
          <h1>Sameds Hospital HMS</h1>
          <p>Create your staff account</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="signup-form__grid">
            {/* Full Name */}
            <div className="login-page__field signup-form__full">
              <label htmlFor="su-name">Full Name</label>
              <div className="login-page__input-wrap">
                <User size={15} />
                <input id="su-name" name="name" value={form.name} onChange={set} placeholder="Dr. Kwame Asante" required />
              </div>
            </div>

            {/* Username */}
            <div className="login-page__field">
              <label htmlFor="su-username">Username</label>
              <div className="login-page__input-wrap">
                <User size={15} />
                <input id="su-username" name="username" value={form.username} onChange={set} placeholder="kwame.asante" required autoComplete="username" />
              </div>
            </div>

            {/* Email */}
            <div className="login-page__field">
              <label htmlFor="su-email">Email</label>
              <div className="login-page__input-wrap">
                <Mail size={15} />
                <input id="su-email" name="email" type="email" value={form.email} onChange={set} placeholder="k.asante@gmail.com" required />
              </div>
            </div>

            {/* Phone */}
            <div className="login-page__field">
              <label htmlFor="su-phone">Phone</label>
              <div className="login-page__input-wrap">
                <Phone size={15} />
                <input id="su-phone" name="phone" value={form.phone} onChange={set} placeholder="+233 24 xxx xxxx" />
              </div>
            </div>

            {/* Role */}
            <div className="login-page__field">
              <label htmlFor="su-role">Role</label>
              <div className="login-page__input-wrap">
                <UserPlus size={15} />
                <select id="su-role" name="role" value={form.role} onChange={set} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'inherit', padding: '10px 0' }}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Department */}
            <div className="login-page__field">
              <label htmlFor="su-dept">Department</label>
              <div className="login-page__input-wrap">
                <Building2 size={15} />
                <select id="su-dept" name="department" value={form.department} onChange={set} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'inherit', padding: '10px 0' }}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="login-page__field">
              <label htmlFor="su-pw">Password</label>
              <div className="login-page__input-wrap">
                <Lock size={15} />
                <input id="su-pw" name="password" type="password" value={form.password} onChange={set} placeholder="Min. 6 characters" required autoComplete="new-password" />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="login-page__field">
              <label htmlFor="su-pw2">Confirm Password</label>
              <div className="login-page__input-wrap">
                <Lock size={15} />
                <input id="su-pw2" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required autoComplete="new-password" />
              </div>
            </div>
          </div>

          {error   && <p className="login-page__error" role="alert">{error}</p>}
          {success && <p className="signup-success" role="status">{success}</p>}

          <button type="submit" className="login-page__btn" style={{ marginTop: 4 }}>
            <UserPlus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Create Account
          </button>
        </form>

        <button type="button" className="signup-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Sign In
        </button>
      </div>

      <div className="login-page__info">
        <div className="login-page__info-inner">
          <h2>Join Sameds Hospital</h2>
          <p>Create your staff account to access the Hospital Management System.</p>
          <ul className="login-page__feature-list">
            <li>Your own secure profile and private notes</li>
            <li>Role-based access to relevant modules</li>
            <li>Patient data shared across all authorised staff</li>
            <li>Patients see only their own records</li>
            <li>Stellar XLM payment support</li>
            <li>Barcode ID for every patient</li>
          </ul>
          <div className="signup-roles-note">
            <strong>Note:</strong> Admin approval may be required for Doctor or Admin roles in production. New accounts are immediately active in this demo.
          </div>
        </div>
      </div>
    </div>
  )
}

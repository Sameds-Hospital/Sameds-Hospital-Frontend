import { useState, type FormEvent } from 'react'
import { useHMS } from '../../store/HMSContext'
import { Lock, User, UserPlus } from 'lucide-react'
import { SignupPage } from './SignupPage'

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'Admin' },
  { username: 'doctor', password: 'doctor123', role: 'Doctor' },
  { username: 'nurse', password: 'nurse123', role: 'Nurse' },
  { username: 'pharmacist', password: 'pharmacist123', role: 'Pharmacist' },
  { username: 'cashier', password: 'cashier123', role: 'Cashier' },
  { username: 'lab', password: 'lab123', role: 'Lab Tech' },
  { username: 'radiologist', password: 'radio123', role: 'Radiologist' },
  { username: 'receptionist', password: 'recept123', role: 'Receptionist' },
  { username: 'patient', password: 'patient123', role: 'Patient' },
]

export function LoginPage() {
  const { login } = useHMS()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showSignup, setShowSignup] = useState(false)

  if (showSignup) return <SignupPage onBack={() => setShowSignup(false)} />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const ok = login(username.trim(), password)
    if (!ok) setError('Invalid username or password. Please try again.')
  }

  const fillDemo = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__brand">
          <span className="login-page__logo">🏥</span>
             <h1>Sameds Hospital HMS</h1>
          <p> <i> Powered by Stellar XLM </i> </p>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          <div className="login-page__field">
            <label htmlFor="login-username">Username</label>
            <div className="login-page__input-wrap">
              <User size={16} />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="login-page__field">
            <label htmlFor="login-password">Password</label>
            <div className="login-page__input-wrap">
              <Lock size={16} />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && <p className="login-page__error" role="alert">{error}</p>}

          <button type="submit" className="login-page__btn">Sign In</button>
        </form>

        <button type="button" className="signup-link-btn" onClick={() => setShowSignup(true)}>
          <UserPlus size={15} /> New staff? Create an account
        </button>

        <div className="login-page__demo">
          <p className="login-page__demo-title">Demo Accounts</p>
          <div className="login-page__demo-grid">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.username}
                type="button"
                className="login-page__demo-chip"
                onClick={() => fillDemo(acc.username, acc.password)}
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="login-page__info">
        <div className="login-page__info-inner">
          <h2>Full-Featured HMS</h2>
          <p>Complete hospital operations platform with 25+ integrated modules.</p>
          <ul className="login-page__feature-list">
            <li>Patient Management & EMR</li>
            <li>Lab, Pharmacy & Radiology</li>
            <li>Billing, Insurance & Finance</li>
            <li>Blood Bank & OT Management</li>
            <li>Emergency & Telemedicine</li>
            <li>Analytics & Audit Logs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

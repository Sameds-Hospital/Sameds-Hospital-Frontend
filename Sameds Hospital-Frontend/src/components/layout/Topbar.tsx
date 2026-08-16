import { Bell, LogOut, User, Clock, MoonStar, SunMedium } from 'lucide-react'
import { useHMS } from '../../store/HMSContext'
import { Badge } from '../ui/Badge'
import { GlobalSearch } from '../ui/GlobalSearch'

export function Topbar() {
  const { currentUser, logout, state, setActiveModule, theme, toggleTheme } = useHMS()
  const unread = state.notifications.filter(n => n.status === 'Pending' || n.status === 'Sent').length
  const now = new Date().toLocaleString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <header className="topbar">
      <div className="topbar__left">
        <Clock size={14} />
        <span className="topbar__time">{now}</span>
        {currentUser && (
          <span className="topbar__branch">Sameds Hospital – Main Campus</span>
        )}
      </div>
      <div className="topbar__center">
        <GlobalSearch />
      </div>
      <div className="topbar__right">
        <button
          type="button"
          className="topbar__icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
        </button>

        <button
          type="button"
          className="topbar__icon-btn"
          onClick={() => setActiveModule('notifications')}
          aria-label="View notifications"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="topbar__notif-dot">{unread}</span>
          )}
        </button>

        {currentUser && (
          <div className="topbar__user">
            <span className="topbar__avatar">
              <User size={15} />
            </span>
            <div className="topbar__user-info">
              <strong>{currentUser.name}</strong>
              <Badge variant="blue">{currentUser.role}</Badge>
            </div>
            <button type="button" className="topbar__icon-btn topbar__logout" onClick={logout} aria-label="Logout">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

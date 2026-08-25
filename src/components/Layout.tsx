import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageLoader } from './ui'

const adminTabs = [
  { to: '/admin/equipment', label: 'Alat & Kategori' },
  { to: '/admin/bookings', label: 'Booking' },
  { to: '/admin/payments', label: 'Pembayaran' },
]

function navClass({ isActive }: { isActive: boolean }) {
  return `nav-link${isActive ? ' active' : ''}`
}

export default function Layout() {
  const { user, initializing, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/katalog')
  }

  if (initializing) return <PageLoader label="Menyiapkan aplikasi..." />

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/katalog" className="brand">
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path
                d="M12 4L2.5 20h19L12 4zm0 5.5L16.8 18H7.2L12 9.5zM11 12v6m2-6v6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Camping Rental
          </NavLink>
          <nav className="main-nav" aria-label="Navigasi utama">
            <NavLink to="/katalog" className={navClass}>
              Katalog
            </NavLink>
            {user && (
              <NavLink to="/booking/riwayat" className={navClass} end>
                Riwayat Booking
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to={adminTabs[0].to} className={navClass} end>
                Admin
              </NavLink>
            )}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <span className="user-chip" title={user.email}>
                  <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="user-name">{user.name}</span>
                  {user.role === 'admin' && <span className="badge badge-info">Admin</span>}
                </span>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Keluar
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-outline btn-sm">
                  Masuk
                </NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm">
                  Daftar
                </NavLink>
              </>
            )}
          </div>
        </div>
        {user?.role === 'admin' && location.pathname.startsWith('/admin') && (
          <div className="container">
            <nav className="admin-tabs" aria-label="Navigasi admin">
              {adminTabs.map((tab) => (
                <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`} end={tab.to === '/admin/equipment'}>
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="container main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>Camping Rental &mdash; sewa alat camping dengan mudah.</p>
        </div>
      </footer>
    </div>
  )
}

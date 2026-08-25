import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageLoader } from './ui'

export function RequireAuth() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <PageLoader label="Memuat..." />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function RequireRole({ role }: { role: 'admin' }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <PageLoader label="Memuat..." />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (user.role !== role) {
    return (
      <div className="empty-state">
        <h2>Akses ditolak</h2>
        <p>Halaman ini hanya dapat diakses oleh admin.</p>
      </div>
    )
  }
  return <Outlet />
}

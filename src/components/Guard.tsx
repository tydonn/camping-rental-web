import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { PageLoader } from '@/components/shared/page-loader'

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
      <EmptyState
        title="Akses ditolak"
        description="Halaman ini hanya dapat diakses oleh admin."
        action={
          <Button asChild className="mt-3">
            <Link to="/katalog">Kembali ke katalog</Link>
          </Button>
        }
      />
    )
  }
  return <Outlet />
}

import { Route, Routes, Link } from 'react-router-dom'
import Layout from './components/Layout'
import { RequireAuth, RequireRole } from './components/Guard'
import { EmptyState } from './components/shared/empty-state'
import { Button } from './components/ui/button'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LandingPage from './pages/LandingPage'
import CatalogPage from './pages/CatalogPage'
import EquipmentDetailPage from './pages/EquipmentDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import BookingsPage from './pages/BookingsPage'
import BookingDetailPage from './pages/BookingDetailPage'
import AdminEquipmentPage from './pages/admin/AdminEquipmentPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/katalog" element={<CatalogPage />} />
        <Route path="/katalog/:id" element={<EquipmentDetailPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/booking/checkout" element={<CheckoutPage />} />
          <Route path="/booking/riwayat" element={<BookingsPage />} />
          <Route path="/booking/riwayat/:id" element={<BookingDetailPage />} />
        </Route>

        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin/equipment" element={<AdminEquipmentPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>

        <Route
          path="*"
          element={
            <EmptyState
              title="404"
              description="Halaman tidak ditemukan."
              action={
                <Button asChild className="mt-3">
                  <Link to="/katalog">Ke Katalog</Link>
                </Button>
              }
            />
          }
        />
      </Route>
    </Routes>
  )
}

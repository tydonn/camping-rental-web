import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOutIcon, TentIcon, UserRoundIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { PageLoader } from '@/components/shared/page-loader'
import { ThemeToggle } from '@/components/theme-toggle'

const adminTabs = [
  { to: '/admin/equipment', label: 'Alat & Kategori' },
  { to: '/admin/bookings', label: 'Booking' },
  { to: '/admin/payments', label: 'Pembayaran' },
]

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
    isActive
      ? 'bg-primary/10 text-primary dark:bg-primary/15'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  ].join(' ')
}

function tabClass({ isActive }: { isActive: boolean }) {
  return [
    'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors',
    isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  ].join(' ')
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center gap-2 sm:gap-4">
            <NavLink to="/katalog" className="flex shrink-0 items-center gap-2 font-extrabold tracking-tight text-foreground">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <TentIcon className="size-4.5" />
              </span>
              <span className="hidden min-[380px]:inline">Camping Rental</span>
            </NavLink>

            <nav className="flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Navigasi utama">
              <NavLink to="/katalog" className={navClass}>
                Katalog
              </NavLink>
              {user && (
                <NavLink to="/booking/riwayat" end className={navClass}>
                  Riwayat Booking
                </NavLink>
              )}
              {user?.role === 'admin' && (
                <NavLink to={adminTabs[0].to} end className={navClass}>
                  Admin
                </NavLink>
              )}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 pl-1.5">
                      <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="hidden max-w-28 truncate text-sm font-semibold sm:inline">
                        {user.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="truncate">{user.name}</span>
                      <span className="truncate text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </DropdownMenuLabel>
                    {user.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                          <Badge variant="outline" className="border-sky-200 bg-sky-100/70 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-300">
                            Admin
                          </Badge>
                        </DropdownMenuLabel>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => void handleLogout()}>
                      <LogOutIcon /> Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <NavLink to="/login">Masuk</NavLink>
                  </Button>
                  <Button size="sm" asChild>
                    <NavLink to="/register">Daftar</NavLink>
                  </Button>
                </>
              )}
            </div>
          </div>

          {user?.role === 'admin' && location.pathname.startsWith('/admin') && (
            <nav className="-mb-px flex items-center gap-1 overflow-x-auto pb-2" aria-label="Navigasi admin">
              <UserRoundIcon className="mr-1 hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
              {adminTabs.map((tab) => (
                <NavLink key={tab.to} to={tab.to} end={tab.to === '/admin/equipment'} className={tabClass}>
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 pb-16 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 text-sm text-muted-foreground sm:px-6">
          <p>Camping Rental &mdash; sewa alat camping dengan mudah.</p>
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>

      <Toaster position="top-center" richColors closeButton />
    </div>
  )
}

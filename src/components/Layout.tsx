import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOutIcon, MapPinnedIcon } from 'lucide-react'
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
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { Toaster } from '@/components/ui/sonner'
import { PageLoader } from '@/components/shared/page-loader'
import { ThemeToggle } from '@/components/theme-toggle'

const adminTabs = [
  { to: '/admin/equipment', label: 'Alat & Kategori' },
  { to: '/admin/bookings', label: 'Booking' },
  { to: '/admin/payments', label: 'Pembayaran' },
  { to: '/admin/settings', label: 'Pengaturan' },
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
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  ].join(' ')
}

export default function Layout() {
  const { user, initializing, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  if (initializing) return <PageLoader label="Menyiapkan aplikasi..." />

  return (
    <SidebarProvider>
      <TooltipProvider>
        {isMobile && <AppSidebar />}
      </TooltipProvider>

      <div className="flex min-h-svh w-full flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="md:hidden" />
          <NavLink
            to="/"
            className={`flex shrink-0 items-center gap-2 font-extrabold tracking-tight ${
              isMobile ? '' : 'mr-2'
            }`}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MapPinnedIcon className="size-4" />
            </span>
            <span className="hidden min-[380px]:inline">Camping Rental</span>
          </NavLink>

          {!isMobile && (
            <nav className="flex items-center gap-1" aria-label="Navigasi utama">
              <NavLink to="/" end className={({ isActive }) => navClass({ isActive })}>
                Beranda
              </NavLink>
              <NavLink to="/katalog" end className={({ isActive }) => navClass({ isActive })}>
                Katalog
              </NavLink>
              {user && (
                <NavLink
                  to="/booking/riwayat"
                  end
                  className={({ isActive }) => navClass({ isActive })}
                >
                  Riwayat Booking
                </NavLink>
              )}
              {user?.role === 'admin' && (
                <NavLink
                  to={adminTabs[0].to}
                  end
                  className={({ isActive }) => navClass({ isActive })}
                >
                  Admin
                </NavLink>
              )}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-1.5">
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
                        <Badge
                          variant="outline"
                          className="border-sky-200 bg-sky-100/70 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-300"
                        >
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
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Masuk
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Daftar
                </Button>
              </div>
            )}
          </div>
        </header>

        {!isMobile && user?.role === 'admin' && location.pathname.startsWith('/admin') && (
          <nav
            className="flex items-center justify-center gap-1 border-b bg-muted/40 px-4 py-1.5"
            aria-label="Navigasi admin"
          >
            {adminTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/admin/equipment'}
                className={tabClass}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        )}

        <main
          className={
            location.pathname === '/'
              ? 'w-full flex-1'
              : 'mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6'
          }
        >
          <Outlet />
        </main>

        <footer className="border-t bg-card">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 text-sm text-muted-foreground sm:px-6">
            <p>Camping Rental &mdash; sewa alat camping dengan mudah.</p>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <p>&copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>

      <Toaster position="top-center" richColors closeButton />
    </SidebarProvider>
  )
}

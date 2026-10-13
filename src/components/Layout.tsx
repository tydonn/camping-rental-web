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
import { COMPANY_PROFILE } from '@/utils/constants'

const adminTabs = [
  { to: '/admin/equipment', label: 'Alat & Kategori' },
  { to: '/admin/bookings', label: 'Booking' },
  { to: '/admin/payments', label: 'Pembayaran' },
  { to: '/admin/settings', label: 'Pengaturan' },
]

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-[2px] px-3.5 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  ].join(' ')
}

function tabClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-[2px] px-3.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
    isActive
      ? 'bg-primary text-primary-foreground'
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
            className={`flex shrink-0 items-center gap-2 font-semibold tracking-[-0.02em] ${isMobile ? '' : 'mr-2'}`}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-[2px] bg-primary text-primary-foreground">
              <MapPinnedIcon className="size-4" />
            </span>
            <span className="hidden min-[420px]:inline lg:inline">
              {COMPANY_PROFILE.name}
            </span>
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
                <NavLink to="/booking/riwayat" end className={({ isActive }) => navClass({ isActive })}>
                  Riwayat Booking
                </NavLink>
              )}
              {user?.role === 'admin' && (
                <NavLink to="/admin/bookings" className={({ isActive }) => navClass({ isActive })}>
                  Admin
                </NavLink>
              )}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-1.5">
                    <span className="grid size-7 place-items-center rounded-[2px] bg-primary font-mono text-[0.6875rem] font-medium text-primary-foreground">
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
                          className="border-rule font-mono text-[0.6875rem] tracking-[0.1em] text-muted-foreground uppercase"
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
            className="flex items-center justify-center gap-1 border-b bg-rule px-4 py-1.5 sm:pl-12"
            aria-label="Navigasi admin"
          >
            {adminTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/admin/bookings'}
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
              : 'relative mx-auto w-full max-w-6xl flex-1 pr-4 py-6 pl-8 sm:pr-6 sm:pl-12'
          }
        >
          {location.pathname !== '/' && (
            <div
              aria-hidden="true"
              className="rule-draw-y absolute inset-y-0 left-4 w-px bg-primary sm:left-6"
            />
          )}
          <Outlet />
        </main>

        <footer className="border-t">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 py-4 pr-4 pl-8 text-sm text-muted-foreground sm:pr-6 sm:pl-12">
            <p>{COMPANY_PROFILE.name}. Sewa alat camping dengan mudah.</p>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <p>&copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>

      <Toaster position="top-center" richColors closeButton />
    </SidebarProvider>
  )
}

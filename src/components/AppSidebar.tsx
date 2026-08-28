import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboardIcon,
  MapPinnedIcon,
  PackageSearchIcon,
  ScrollTextIcon,
  SettingsIcon,
  CalendarClockIcon,
  HandCoinsIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const publicLinks = [
  { to: '/', label: 'Beranda', icon: LayoutDashboardIcon, end: true },
  { to: '/katalog', label: 'Katalog', icon: PackageSearchIcon, end: true },
]

const customerLinks = [
  {
    to: '/booking/riwayat',
    label: 'Riwayat Booking',
    icon: ScrollTextIcon,
    end: true,
  },
]

const adminLinks = [
  { to: '/admin/equipment', label: 'Alat & Kategori', icon: PackageSearchIcon },
  { to: '/admin/bookings', label: 'Booking', icon: CalendarClockIcon },
  { to: '/admin/payments', label: 'Pembayaran', icon: HandCoinsIcon },
  { to: '/admin/settings', label: 'Pengaturan', icon: SettingsIcon },
]

export default function AppSidebar() {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (to: string, end = false) =>
    end ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <MapPinnedIcon className="size-4" />
                </span>
                <span className="font-extrabold tracking-tight">Camping Rental</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicLinks.map((link) => (
                <SidebarMenuItem key={link.to}>
                  <NavLink to={link.to} end={link.end}>
                    <SidebarMenuButton
                      isActive={isActive(link.to, link.end)}
                      tooltip={link.label}
                    >
                      <link.icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </NavLink>
                </SidebarMenuItem>
              ))}

              {user && (
                <>
                  <SidebarSeparator className="my-1" />
                  {customerLinks.map((link) => (
                    <SidebarMenuItem key={link.to}>
                      <NavLink to={link.to} end={link.end}>
                        <SidebarMenuButton
                          isActive={isActive(link.to, link.end)}
                          tooltip={link.label}
                        >
                          <link.icon />
                          <span>{link.label}</span>
                        </SidebarMenuButton>
                      </NavLink>
                    </SidebarMenuItem>
                  ))}
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <SidebarSeparator className="my-1" />
                  <SidebarGroupLabel>Admin</SidebarGroupLabel>
                  {adminLinks.map((link) => (
                    <SidebarMenuItem key={link.to}>
                      <NavLink to={link.to} end={link.to === '/admin/equipment'}>
                        <SidebarMenuButton
                          isActive={isActive(link.to, link.to === '/admin/equipment')}
                          tooltip={link.label}
                        >
                          <link.icon />
                          <span>{link.label}</span>
                        </SidebarMenuButton>
                      </NavLink>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

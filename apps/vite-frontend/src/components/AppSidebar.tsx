import { Link, useRouterState } from '@tanstack/react-router'
import {
  BoxIcon,
  ContainerIcon,
  HardDriveIcon,
  LayersIcon,
  LayoutDashboardIcon,
  NetworkIcon,
  SquareTerminalIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useHealthQuery } from '@/api/hooks'
import { cn } from '@/lib/utils'

interface NavItem {
  to:
    | '/overview'
    | '/containers'
    | '/images'
    | '/volumes'
    | '/networks'
    | '/terminal'
  label: string
  icon: LucideIcon
}

const NAV: Array<{ label: string; items: Array<NavItem> }> = [
  {
    label: 'General',
    items: [{ to: '/overview', label: 'Overview', icon: LayoutDashboardIcon }],
  },
  {
    label: 'Docker',
    items: [
      { to: '/containers', label: 'Containers', icon: BoxIcon },
      { to: '/images', label: 'Images', icon: LayersIcon },
      { to: '/volumes', label: 'Volumes', icon: HardDriveIcon },
      { to: '/networks', label: 'Networks', icon: NetworkIcon },
    ],
  },
  {
    label: 'Tools',
    items: [{ to: '/terminal', label: 'Terminal', icon: SquareTerminalIcon }],
  },
]

const STATUS_LABEL = {
  checking: 'Connecting…',
  connected: 'Backend connected',
  disconnected: 'Backend unreachable',
} as const

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { isPending, isSuccess } = useHealthQuery()
  const status = isPending
    ? 'checking'
    : isSuccess
      ? 'connected'
      : 'disconnected'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/overview">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ContainerIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Colima Manager</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Docker on Colima
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(to)}
                      tooltip={label}
                    >
                      <Link to={to}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:justify-center">
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              status === 'connected' && 'bg-emerald-500',
              status === 'disconnected' && 'bg-red-500',
              status === 'checking' && 'animate-pulse bg-amber-500',
            )}
          />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {STATUS_LABEL[status]}
          </span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

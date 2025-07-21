import { NavLink, useLocation } from 'react-router-dom';
import { Bot, Search, BarChart3, History, Brain } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Chat',
    url: '/',
    icon: Bot,
    description: 'AI Assistant'
  },
  {
    title: 'Search',
    url: '/search',
    icon: Search,
    description: 'Document Search'
  },
  {
    title: 'Analytics',
    url: '/stats',
    icon: BarChart3,
    description: 'System Stats'
  },
  {
    title: 'History',
    url: '/history',
    icon: History,
    description: 'Chat History'
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">PM Copilot</h1>
            <p className="text-xs text-muted-foreground">AI Product Assistant</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors">
                      <item.icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { logout, getUser } from "@/lib/auth";
import { BarChart3, Home, LogOut, Settings, Users as UsersIcon, CalendarClock, Download } from "lucide-react";

export default function MainLayout({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/users", label: "Users", icon: UsersIcon },
    { to: "/timekeeping", label: "Timekeeping", icon: CalendarClock },
    { to: "/exports", label: "Exports", icon: Download },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="size-6 rounded-md bg-primary/15 grid place-items-center text-primary font-bold">
              M
            </div>
            <span className="font-semibold">Manage</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname.startsWith(item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <Link to={item.to}>
                        <SidebarMenuButton isActive={active}>
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="px-2 text-xs text-muted-foreground">
            {user?.email}
          </div>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
          >
            <LogOut className="mr-2" /> Sign out
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex h-14 items-center gap-3 px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="size-4 text-primary" />
              <span className="font-medium text-foreground">{title ?? ""}</span>
            </div>
            <div className="ml-auto" />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

import { ReactNode, useEffect, useState } from "react";
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
import {
  BarChart3,
  Home,
  LogOut,
  Settings,
  Users as UsersIcon,
  CalendarClock,
  CalendarRange,
  Download,
  Sun,
  Moon,
} from "lucide-react";

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
    { to: "/attendance", label: "Attendance", icon: CalendarRange },
    { to: "/exports", label: "Exports", icon: Download },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark") ||
        (typeof localStorage !== "undefined" && localStorage.theme === "dark")
      : false,
  );
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      root.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [isDark]);

  return (
    <SidebarProvider>
      <Sidebar className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <img
              src="/logo.png"
              alt="logo"
              className="w-8 h-8 rounded-md bg-primary/15 grid place-items-center"
            />
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
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle dark mode"
                onClick={() => setIsDark((v) => !v)}
              >
                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            </div>
          </div>
        </header>
        <main className="p-6 min-w-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

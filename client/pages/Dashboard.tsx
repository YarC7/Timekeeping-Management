import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  CheckCircle2,
  Clock,
  Clock8,
  CalendarX2,
  PieChart,
  BarChart3,
  UserPlus,
  CheckSquare,
  Download,
  CalendarClock,
} from "lucide-react";
import { useDashboard, useTimekeepingList } from "@/api/timekeeping";
import { employeesApi } from "@/api/employees";
import { useMemo } from "react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: dashboardStats } = useDashboard();
  const { data: employees = [] } = employeesApi.useList();
  const { data: todayLogs = [] } = useTimekeepingList({
    dateFrom: format(new Date(), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
  });

  const kpis = useMemo(() => {
    const late = todayLogs.filter((log) => log.status === "Late").length;
    const onLeave = todayLogs.filter((log) => log.status === "Leave").length;

    return [
      {
        key: "total",
        label: "Total Employees",
        value: employees.length,
        icon: Users,
      },
      {
        key: "present",
        label: "Present Today",
        value: dashboardStats?.checkedInToday ?? 0,
        icon: CheckCircle2,
      },
      { key: "late", label: "Late Arrivals", value: late, icon: Clock8 },
      { key: "leave", label: "On Leave", value: onLeave, icon: CalendarX2 },
    ] as const;
  }, [dashboardStats, employees, todayLogs]);

  const alerts = [
    { title: "Checked in", detail: "John Doe at 08:45", time: "5m ago" },
    { title: "Late arrival", detail: "Anna Smith at 09:15", time: "25m ago" },
    {
      title: "Forgot check-out",
      detail: "David Lee (yesterday)",
      time: "1h ago",
    },
    { title: "Leave request", detail: "Maria Garcia (Today)", time: "2h ago" },
  ];

  return (
    <MainLayout title="Dashboard">
      {/* KPI Row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.key} className="bg-card">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Icon className="size-4 text-primary" />
                  {kpi.label}
                </CardDescription>
                <CardTitle className="text-4xl font-bold">
                  {kpi.value.toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      {/* Main Content */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left: Statistics with chart placeholders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Statistics</CardTitle>
            <CardDescription>Overview of today's attendance insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PieChart className="size-4 text-primary" />
                  <span>Status distribution</span>
                </div>
                <div className="h-64 rounded-md border border-dashed bg-muted/20 grid place-items-center text-sm text-muted-foreground">
                  Pie chart placeholder
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="size-4 text-primary" />
                  <span>Check-ins by hour</span>
                </div>
                <div className="h-64 rounded-md border border-dashed bg-muted/20 grid place-items-center text-sm text-muted-foreground">
                  Bar chart placeholder
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Alerts and Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Alerts</CardTitle>
              <CardDescription>Latest events and notices</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                {alerts.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium leading-none">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HR Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button variant="secondary" className="w-full justify-start">
                <UserPlus className="mr-2" /> Add new employee
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <CheckSquare className="mr-2" /> Approve corrections
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Download className="mr-2" /> Export report
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <CalendarClock className="mr-2" /> Assign shift
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}

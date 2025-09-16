import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Table UI moved to common DataTable component
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
// Selection checkboxes handled inside DataTable via TanStack table
import {
  BarChart3,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Printer,
  RefreshCw,
  Search,
  UserCircle2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { exportData } from "@/lib/export";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Pie,
  PieChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useDashboard, useTimekeepingList } from "@/api/timekeeping";
import { employeesApi } from "@/api/employees";
import { DataTable } from "@/components/common/DataTable";
import {
  useTimekeepingTable,
  type TimekeepingRow,
} from "@/hooks/useTimekeepingTable";
import { EditDialog } from "@/components/timekeeping/EditDialog";

interface Entry {
  id: string;
  name: string;
  avatar: string;
  date: string; // ISO date
  checkIn: string | null; // HH:mm
  checkOut: string | null; // HH:mm
  hours: number | null;
  status:
    | "present"
    | "not_checked_in"
    | "not_checked_out"
    | "on_leave"
    | "late"
    | "checked_out";
  department?: string;
  position?: string;
  role?: string;
  overtime?: boolean;
}

export default function Timekeeping() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    department: "",
    position: "",
    role: "",
    overtime: "all" as "all" | "yes" | "no",
  });
  const [live, setLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [view, setView] = useState<"table" | "charts">("table");
  const [editRow, setEditRow] = useState<Entry | null>(null);
  const [isMd, setIsMd] = useState(false);

  const { data: dashboard } = useDashboard();
  // Fetch recent attendance logs and all employees for mapping
  const {
    data: logs = [],
    isLoading: logsLoading,
    isError: logsError,
    error: logsErr,
    refetch: refetchLogs,
  } = useTimekeepingList();
  const {
    data: employees = [],
    isLoading: empLoading,
    isError: empError,
    error: empErr,
  } = employeesApi.useList();

  useEffect(() => {
    // Combine logs and employees to daily entries
    if (logsError || empError) {
      toast.error("Failed to load attendance data");
      return;
    }
    if (!logsLoading && !empLoading) {
      // Build employee map for quick lookup
      const empMap = new Map(employees.map((e: any) => [e.employee_id, e]));

      // Group logs by employee_id + date (YYYY-MM-DD)
      const groups = new Map<string, any[]>();
      for (const log of logs as any[]) {
        const date = (log.timestamp as string).slice(0, 10);
        const key = `${log.employee_id}__${date}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(log);
      }

      const toHHmm = (iso: string) => iso.substring(11, 16);
      const parseMinutes = (hhmm: string) => {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
      };

      const entries: Entry[] = [];
      for (const [key, glogs] of groups) {
        const [employee_id, date] = key.split("__");
        const emp = empMap.get(employee_id);

        const checkins = glogs
          .filter((g) => g.check_type === "checkin")
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        const checkouts = glogs
          .filter((g) => g.check_type === "checkout")
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        const checkInIso = checkins[0]?.timestamp as string | undefined;
        const checkOutIso = checkouts[checkouts.length - 1]?.timestamp as
          | string
          | undefined;
        const checkIn = checkInIso ? toHHmm(checkInIso) : null;
        const checkOut = checkOutIso ? toHHmm(checkOutIso) : null;

        let hours: number | null = null;
        if (checkInIso && checkOutIso) {
          const diffMs =
            new Date(checkOutIso).getTime() - new Date(checkInIso).getTime();
          hours = Math.max(
            0,
            Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10,
          );
        }

        // Derive status
        let status: Entry["status"] = "not_checked_in";
        if (checkIn && checkOut) {
          // Late if first checkin after 09:00
          const lateThreshold = 9 * 60; // 09:00
          status =
            parseMinutes(checkIn) > lateThreshold ? "late" : "checked_out";
        } else if (checkIn && !checkOut) {
          status = "not_checked_out";
        } else if (!checkIn && !checkOut) {
          status = "not_checked_in";
        }

        entries.push({
          id: `${employee_id}-${date}`,
          name: emp?.full_name ?? employee_id,
          avatar: `https://i.pravatar.cc/40?u=${employee_id}`,
          date,
          checkIn,
          checkOut,
          hours,
          status,
          department: emp?.position?.split(" ")[0] || undefined,
          position: emp?.position || undefined,
          role: emp?.role || undefined,
          overtime: false,
        });
      }

      setRows(entries);
    }
  }, [logs, employees, logsLoading, empLoading, logsError, empError]);

  // responsive month count for calendar
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = () => setIsMd(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setSearchDebounced(searchInput.trim()), 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Auto refresh (Live)
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setLastUpdated(new Date());
      // actively refetch logs while live
      refetchLogs();
    }, 8000);
    return () => clearInterval(id);
  }, [live, refetchLogs]);

  // Filtering for Advanced filters and local search/date
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all") {
        if (
          statusFilter === "not-checked-out" &&
          r.status !== "not_checked_out"
        )
          return false;
        if (
          statusFilter !== "not-checked-out" &&
          r.status !== statusFilter.replace("-", "_" as any)
        )
          return false;
      }
      if (
        searchDebounced &&
        !r.name.toLowerCase().includes(searchDebounced.toLowerCase())
      )
        return false;
      if (dateRange?.from) {
        const d = new Date(`${r.date}T00:00:00`);
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        const to = new Date(dateRange.to ?? dateRange.from);
        to.setHours(23, 59, 59, 999);
        if (d < from || d > to) return false;
      }
      if (advFilters.department && r.department !== advFilters.department)
        return false;
      if (advFilters.position && r.position !== advFilters.position)
        return false;
      if (advFilters.role && r.role !== advFilters.role) return false;
      if (advFilters.overtime !== "all") {
        const val = advFilters.overtime === "yes";
        if (r.overtime !== val) return false;
      }
      return true;
    });
  }, [rows, statusFilter, searchDebounced, dateRange, advFilters]);

  // Build TanStack table from filtered rows
  const timekeepingData: TimekeepingRow[] = useMemo(
    () =>
      filtered.map((r) => ({
        id: r.id,
        name: r.name,
        avatar: r.avatar,
        date: r.date,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        hours: r.hours,
        status: r.status,
      })),
    [filtered],
  );
  const { table } = useTimekeepingTable(timekeepingData, {
    onEdit: (row) => setEditRow(row as any),
    onDelete: (ids) => handleDeleteRows(ids),
  });

  // Helpers
  const resetFilters = () => {
    setStatusFilter("all");
    setSearchInput("");
    setSearchDebounced("");
    setDateRange(undefined);
    setAdvFilters({ department: "", position: "", role: "", overtime: "all" });
  };

  const handleDeleteRows = (ids: string[]) => {
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    toast.success("Deleted selected records ✅");
  };

  const exportSelected = (format: "csv" | "json") => {
    try {
      const selected = table.getSelectedRowModel().rows.map((r) => r.original);
      exportData(
        selected.length ? selected : timekeepingData,
        "attendance",
        format,
      );
      toast.success("Export started");
    } catch (err: any) {
      toast.error(err?.message || "Failed to export", {
        action: {
          label: "Retry",
          onClick: () => exportSelected(format),
        },
      });
    }
  };

  const statusBadge = (s: Entry["status"]) => {
    switch (s) {
      case "present":
        return (
          <Badge className="bg-green-500 text-white border-green-500">
            Present
          </Badge>
        );
      case "checked_out":
        return <Badge variant="destructive">Checked-out</Badge>;
      case "not_checked_out":
        return (
          <Badge className="bg-yellow-400 text-black border-yellow-400">
            Not checked-out
          </Badge>
        );
      case "not_checked_in":
        return (
          <Badge className="bg-gray-300 text-gray-900 border-gray-300">
            Absent
          </Badge>
        );
      case "on_leave":
        return (
          <Badge className="bg-blue-500 text-white border-blue-500">
            On leave
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-orange-500 text-white border-orange-500">
            Late
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const editRowSave = (updated: Entry) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditRow(null);
    toast.success("Entry updated successfully ✅");
  };

  const attendanceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of filtered) counts[r.status] = (counts[r.status] || 0) + 1;
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const checkinDistribution = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (const r of filtered) {
      if (!r.checkIn) continue;
      const hour = r.checkIn.split(":")[0];
      buckets[hour] = (buckets[hour] || 0) + 1;
    }
    return Object.keys(buckets)
      .sort()
      .map((h) => ({ hour: `${h}:00`, count: buckets[h] }));
  }, [filtered]);

  return (
    <MainLayout title="Timekeeping Management">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white/60 dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardDescription>Checked-in today</CardDescription>
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                {dashboard?.checkedInToday ?? 0}
              </CardTitle>
            </div>
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <UserCircle2 className="size-6" />
            </div>
          </CardHeader>
        </Card>
        <Card className="bg-white/60 dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardDescription>Not checked-in yet</CardDescription>
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                {dashboard?.notCheckedInToday ?? 0}
              </CardTitle>
            </div>
            <div className="p-3 rounded-full bg-muted text-foreground/80">
              <ChevronLeft className="size-6" />
            </div>
          </CardHeader>
        </Card>
        <Card className="bg-white/60 dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardDescription>Total working hours this week</CardDescription>
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                {(dashboard?.totalHoursThisWeek ?? 0).toFixed(1)}h
              </CardTitle>
            </div>
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <BarChart3 className="size-6" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Filters bar */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3">
            <Popover
              open={datePopoverOpen}
              onOpenChange={(o) => {
                setDatePopoverOpen(o);
                if (o) {
                  setTempStartDate(dateRange?.from ?? undefined);
                  setTempEndDate(dateRange?.to ?? undefined);
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start w-full md:w-auto"
                >
                  <CalendarRange className="mr-2 size-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <span>
                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy")}
                      </span>
                    ) : (
                      <span>{format(dateRange.from, "dd/MM/yyyy")}</span>
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[480px] max-w-[90vw] max-h-[70vh] overflow-y-auto p-0"
                align="start"
              >
                <div className="p-3">
                  <div className="mb-3 text-sm font-medium">
                    Select Date Range
                  </div>
                  <CalendarComponent
                    mode="range"
                    className="w-full max-w-full"
                    numberOfMonths={isMd ? 2 : 1}
                    selected={
                      tempStartDate || tempEndDate
                        ? {
                            from: tempStartDate,
                            to: tempEndDate ?? tempStartDate,
                          }
                        : undefined
                    }
                    onSelect={(range: DateRange | undefined) => {
                      if (!range) {
                        setTempStartDate(undefined);
                        setTempEndDate(undefined);
                        return;
                      }
                      setTempStartDate(range.from);
                      setTempEndDate(range.to ?? range.from);
                    }}
                  />

                  <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                    <div className="rounded-md bg-muted/50 border p-2">
                      <div className="text-xs text-muted-foreground">
                        Start Date
                      </div>
                      <div className="font-medium">
                        {tempStartDate
                          ? format(tempStartDate, "dd/MM/yyyy")
                          : "—"}
                      </div>
                    </div>
                    <div className="rounded-md bg-muted/50 border p-2">
                      <div className="text-xs text-muted-foreground">
                        End Date
                      </div>
                      <div className="font-medium">
                        {tempEndDate ? format(tempEndDate, "dd/MM/yyyy") : "—"}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Select a start and end date. Use Apply to confirm.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDatePopoverOpen(false);
                        setTempStartDate(undefined);
                        setTempEndDate(undefined);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (!tempStartDate && !tempEndDate) {
                          setDateRange(undefined);
                          setDatePopoverOpen(false);
                          return;
                        }
                        if (tempStartDate && !tempEndDate) {
                          setDateRange({
                            from: tempStartDate,
                            to: tempStartDate,
                          });
                        } else if (tempStartDate && tempEndDate) {
                          setDateRange({
                            from: tempStartDate,
                            to: tempEndDate,
                          });
                        }
                        setDatePopoverOpen(false);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              className="md:ml-[-8px]"
              onClick={() => {
                setDateRange(undefined);
                setTempStartDate(undefined);
                setTempEndDate(undefined);
              }}
              disabled={!dateRange?.from}
            >
              <XCircle className="mr-2 size-4" /> Reset
            </Button>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="not-checked-out">Not Checked-out</SelectItem>
                <SelectItem value="checked_out">Checked-out</SelectItem>
                <SelectItem value="not_checked_in">Absent</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8"
              />
            </div>

            <Sheet open={advOpen} onOpenChange={setAdvOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="size-4" /> Advanced
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Advanced filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Input
                      placeholder="e.g. Engineering"
                      value={advFilters.department}
                      onChange={(e) =>
                        setAdvFilters((p) => ({
                          ...p,
                          department: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Position</label>
                    <Input
                      placeholder="e.g. Frontend"
                      value={advFilters.position}
                      onChange={(e) =>
                        setAdvFilters((p) => ({
                          ...p,
                          position: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Input
                      placeholder="e.g. employee / hr / manager"
                      value={advFilters.role}
                      onChange={(e) =>
                        setAdvFilters((p) => ({ ...p, role: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Overtime</label>
                    <Select
                      value={advFilters.overtime}
                      onValueChange={(v: "all" | "yes" | "no") =>
                        setAdvFilters((p) => ({ ...p, overtime: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SheetFooter className="mt-6">
                  <div className="flex w-full gap-2">
                    <Button
                      onClick={() => setAdvOpen(false)}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Button className="bg-primary text-primary-foreground">
              Filter
            </Button>

            <div className="md:ml-auto flex flex-wrap items-center gap-2">
              <Badge className="gap-2 bg-emerald-500 text-white border-emerald-500">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white/90">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-white/70" />
                </span>
                Live
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLive((v) => !v)}
                title="Toggle live"
              >
                <RefreshCw className={`size-4 ${live ? "animate-spin" : ""}`} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="size-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Download</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => exportSelected("csv")}>
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => exportSelected("json")}>
                    JSON
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => window.print()}>
                    PDF (via Print)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="icon"
                onClick={() => window.print()}
                title="Print"
              >
                <Printer className="size-4" />
              </Button>

              <Select value={view} onValueChange={(v: any) => setView(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="charts">Charts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Last updated: {format(lastUpdated, "HH:mm:ss")}
          </div>
        </CardContent>
      </Card>

      {view === "charts" ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attendance insights</CardTitle>
            <CardDescription>Distribution and breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                config={{
                  present: { label: "Present", color: "hsl(142, 70%, 45%)" },
                  not_checked_out: {
                    label: "Not checked-out",
                    color: "hsl(45, 93%, 47%)",
                  },
                  checked_out: {
                    label: "Checked-out",
                    color: "hsl(0, 84%, 60%)",
                  },
                  not_checked_in: {
                    label: "Absent",
                    color: "hsl(220, 9%, 70%)",
                  },
                  on_leave: { label: "On leave", color: "hsl(221, 83%, 53%)" },
                  late: { label: "Late", color: "hsl(24, 95%, 53%)" },
                }}
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={attendanceBreakdown}
                    dataKey="value"
                    nameKey="name"
                    stroke="transparent"
                    label
                  >
                    {attendanceBreakdown.map((d) => (
                      <Cell key={d.name} fill={`var(--color-${d.name})`} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>

              <ChartContainer
                config={{
                  count: { label: "Check-ins", color: "hsl(205, 90%, 55%)" },
                }}
              >
                <BarChart data={checkinDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Table */}
      {view === "table" ? (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-sm text-muted-foreground">
                {table.getSelectedRowModel().rows.length} selected
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportSelected("csv")}
                >
                  Export selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    handleDeleteRows(
                      table
                        .getSelectedRowModel()
                        .rows.map((r) => r.original.id),
                    )
                  }
                  disabled={table.getSelectedRowModel().rows.length === 0}
                >
                  Delete selected
                </Button>
              </div>
            </div>

            <DataTable
              table={table}
              isLoading={logsLoading || empLoading}
              isError={logsError || empError}
              error={(logsErr as any) || (empErr as any)}
            />
          </CardContent>
        </Card>
      ) : null}

      {/* Edit modal */}
      {editRow ? (
        <EditDialog
          row={editRow as unknown as TimekeepingRow}
          onClose={() => setEditRow(null)}
          onSave={(r) => editRowSave(r as unknown as Entry)}
        />
      ) : null}
    </MainLayout>
  );
}

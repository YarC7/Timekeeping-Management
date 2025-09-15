import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart3,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreHorizontal,
  Pencil,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  UserCircle2,
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

const initialRows: Entry[] = [
  {
    id: "1",
    name: "Sarah Lee",
    avatar: "https://i.pravatar.cc/40?img=5",
    date: "2025-09-10",
    checkIn: "08:55",
    checkOut: "17:30",
    hours: 7.5,
    status: "checked_out",
    department: "Engineering",
    position: "Frontend",
    role: "employee",
    overtime: false,
  },
  {
    id: "2",
    name: "John Park",
    avatar: "https://i.pravatar.cc/40?img=11",
    date: "2025-09-10",
    checkIn: "09:02",
    checkOut: null,
    hours: null,
    status: "not_checked_out",
    department: "Engineering",
    position: "Backend",
    role: "employee",
    overtime: true,
  },
  {
    id: "3",
    name: "Alex Kim",
    avatar: "https://i.pravatar.cc/40?img=3",
    date: "2025-09-09",
    checkIn: "08:45",
    checkOut: "16:45",
    hours: 8,
    status: "present",
    department: "Design",
    position: "Product Designer",
    role: "employee",
    overtime: false,
  },
  {
    id: "4",
    name: "Maria Garcia",
    avatar: "https://i.pravatar.cc/40?img=15",
    date: "2025-09-10",
    checkIn: null,
    checkOut: null,
    hours: null,
    status: "not_checked_in",
    department: "People",
    position: "HRBP",
    role: "hr",
    overtime: false,
  },
  {
    id: "5",
    name: "Kenji Tanaka",
    avatar: "https://i.pravatar.cc/40?img=21",
    date: "2025-09-10",
    checkIn: "10:05",
    checkOut: "18:40",
    hours: 7.2,
    status: "late",
    department: "Operations",
    position: "Coordinator",
    role: "employee",
    overtime: false,
  },
  {
    id: "6",
    name: "Emma Wilson",
    avatar: "https://i.pravatar.cc/40?img=9",
    date: "2025-09-10",
    checkIn: null,
    checkOut: null,
    hours: null,
    status: "on_leave",
    department: "Finance",
    position: "Accountant",
    role: "employee",
    overtime: false,
  },
];

export default function Timekeeping() {
  const [rows, setRows] = useState<Entry[]>(initialRows);
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>(
    {},
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
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
  const [sortBy, setSortBy] = useState<{
    key: keyof Entry | "date";
    dir: "asc" | "desc";
  } | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [live, setLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [view, setView] = useState<"table" | "charts">("table");
  const [editRow, setEditRow] = useState<Entry | null>(null);
  const [isMd, setIsMd] = useState(false);

  // responsive month count for calendar
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = () => setIsMd(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto refresh (Live)
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setLastUpdated(new Date());
    }, 8000);
    return () => clearInterval(id);
  }, [live]);

  // KPI calculations
  const todayISO = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const kpis = useMemo(() => {
    const checkedInToday = rows.filter(
      (r) => r.date === todayISO && r.checkIn,
    ).length;
    const notCheckedIn = rows.filter(
      (r) => r.date === todayISO && r.status === "not_checked_in",
    ).length;
    const totalHoursThisWeek = rows
      .filter(() => true)
      .reduce((acc, r) => acc + (r.hours || 0), 0);
    return { checkedInToday, notCheckedIn, totalHoursThisWeek };
  }, [rows, todayISO]);

  // Filtering
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
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (dateRange?.from) {
        const d = new Date(r.date);
        const from = new Date(dateRange.from);
        const to = dateRange.to ? new Date(dateRange.to) : from;
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
  }, [rows, statusFilter, search, dateRange, advFilters]);

  // Sorting
  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    const { key, dir } = sortBy;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = (a as any)[key];
      const vb = (b as any)[key];
      if (key === "date") {
        return dir === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (typeof va === "number" && typeof vb === "number") {
        return dir === "asc" ? va - vb : vb - va;
      }
      return dir === "asc"
        ? String(va ?? "").localeCompare(String(vb ?? ""))
        : String(vb ?? "").localeCompare(String(va ?? ""));
    });
    return arr;
  }, [filtered, sortBy]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = useMemo(() => {
    const start = pageIndex * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageIndex, pageSize]);

  useEffect(() => {
    if (pageIndex > pageCount - 1) setPageIndex(0);
  }, [pageCount, pageIndex]);

  const allSelectedOnPage = pageRows.every((r) => selectedRowIds[r.id]);
  const someSelectedOnPage =
    pageRows.some((r) => selectedRowIds[r.id]) && !allSelectedOnPage;

  // Helpers
  const resetFilters = () => {
    setStatusFilter("all");
    setSearch("");
    setDateRange(undefined);
    setAdvFilters({ department: "", position: "", role: "", overtime: "all" });
  };

  const handleDeleteRows = (ids: string[]) => {
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelectedRowIds({});
    toast.success("Deleted selected records ✅");
  };

  const exportSelected = (format: "csv" | "json") => {
    try {
      const selected = rows.filter((r) => selectedRowIds[r.id]);
      exportData(selected.length ? selected : sorted, "attendance", format);
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
                {kpis.checkedInToday}
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
                {kpis.notCheckedIn}
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
                {kpis.totalHoursThisWeek.toFixed(1)}h
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
          <div className="flex flex-col md:flex-row md:items-center gap-3">
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
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </span>
                    ) : (
                      <span>{format(dateRange.from, "LLL dd, y")}</span>
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-2xs p-0" align="start">
                <div className="p-3">
                  <div className="mb-3 text-sm font-medium">
                    Select Date Range
                  </div>
                  <CalendarComponent
                    mode="single"
                    className="w-full max-w-full"
                    numberOfMonths={1}
                    selected={undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      const selectedDate = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                      );
                      if (!tempStartDate && !tempEndDate) {
                        setTempStartDate(selectedDate);
                        setTempEndDate(undefined);
                        return;
                      }
                      if (tempStartDate && !tempEndDate) {
                        const startDate = new Date(
                          tempStartDate.getFullYear(),
                          tempStartDate.getMonth(),
                          tempStartDate.getDate(),
                        );
                        if (selectedDate >= startDate) {
                          setTempEndDate(selectedDate);
                        } else {
                          setTempStartDate(selectedDate);
                          setTempEndDate(undefined);
                        }
                        return;
                      }
                      if (tempStartDate && tempEndDate) {
                        const startDate = new Date(tempStartDate);
                        const endDate = new Date(tempEndDate);
                        const selectedDateStr = selectedDate.toDateString();
                        const startDateStr = startDate.toDateString();
                        const endDateStr = endDate.toDateString();
                        if (
                          selectedDateStr === startDateStr ||
                          selectedDateStr === endDateStr
                        ) {
                          setTempStartDate(undefined);
                          setTempEndDate(undefined);
                          return;
                        }
                        if (selectedDate < startDate) {
                          setTempStartDate(selectedDate);
                        } else if (selectedDate > endDate) {
                          setTempEndDate(selectedDate);
                        } else {
                          setTempEndDate(selectedDate);
                        }
                      }
                    }}
                    modifiers={{
                      range_start: tempStartDate ? [tempStartDate] : [],
                      range_end: tempEndDate ? [tempEndDate] : [],
                      range_middle:
                        tempStartDate && tempEndDate
                          ? (() => {
                              const dates = [] as Date[];
                              const start = new Date(tempStartDate);
                              const end = new Date(tempEndDate);
                              if (start.getTime() === end.getTime())
                                return dates;
                              const current = new Date(start);
                              current.setDate(current.getDate() + 1);
                              while (current < end) {
                                dates.push(new Date(current));
                                current.setDate(current.getDate() + 1);
                              }
                              return dates;
                            })()
                          : [],
                      range_end_highlight: tempEndDate ? [tempEndDate] : [],
                      clickable_for_reset:
                        tempStartDate && tempEndDate
                          ? [tempStartDate, tempEndDate]
                          : [],
                      clickable_for_shrink:
                        tempStartDate && tempEndDate
                          ? (() => {
                              const dates = [] as Date[];
                              const start = new Date(tempStartDate);
                              const end = new Date(tempEndDate);
                              if (start.getTime() === end.getTime())
                                return dates;
                              const current = new Date(start);
                              current.setDate(current.getDate() + 1);
                              while (current < end) {
                                dates.push(new Date(current));
                                current.setDate(current.getDate() + 1);
                              }
                              return dates;
                            })()
                          : [],
                    }}
                    modifiersStyles={{
                      range_start: {
                        backgroundColor: "hsl(210, 90%, 55%)", // xanh đậm
                        color: "white",
                        borderRadius: "8px 0 0 8px",
                      },
                      range_end: {
                        backgroundColor: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                        borderRadius: "0 6px 6px 0",
                      },
                      range_middle: {
                        backgroundColor: "hsl(210, 90%, 55%, 0.15)",
                      },
                      selected: {
                        fontWeight: "600",
                      },
                      outside: {
                        color: "hsl(var(--muted-foreground))",
                      },
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
                    Click start or end date to reset, click between dates to
                    shrink range, or click outside to extend.
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <Sheet open={advOpen} onOpenChange={setAdvOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="size-4" /> Advanced
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
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
                {Object.values(selectedRowIds).filter(Boolean).length} selected
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
                      Object.entries(selectedRowIds)
                        .filter(([, v]) => v)
                        .map(([id]) => id),
                    )
                  }
                  disabled={!Object.values(selectedRowIds).some(Boolean)}
                >
                  Delete selected
                </Button>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto overflow-y-hidden rounded-md border">
              <Table className="w-full">
                <TableHeader className="sticky top-0 z-[1] bg-card/95 backdrop-blur">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelectedOnPage}
                        onCheckedChange={(val) => {
                          const map = { ...selectedRowIds };
                          for (const r of pageRows) map[r.id] = !!val;
                          setSelectedRowIds(map);
                        }}
                        aria-label="Select all"
                        data-state={
                          someSelectedOnPage
                            ? "indeterminate"
                            : allSelectedOnPage
                              ? "checked"
                              : "unchecked"
                        }
                      />
                    </TableHead>
                    <TableHead
                      className="min-w-[220px] cursor-pointer"
                      onClick={() =>
                        setSortBy((s) => ({
                          key: "name",
                          dir: s?.dir === "asc" ? "desc" : "asc",
                        }))
                      }
                    >
                      Employee
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() =>
                        setSortBy((s) => ({
                          key: "date",
                          dir: s?.dir === "asc" ? "desc" : "asc",
                        }))
                      }
                    >
                      Date
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() =>
                        setSortBy((s) => ({
                          key: "checkIn",
                          dir: s?.dir === "asc" ? "desc" : "asc",
                        }))
                      }
                    >
                      Check-in
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() =>
                        setSortBy((s) => ({
                          key: "checkOut",
                          dir: s?.dir === "asc" ? "desc" : "asc",
                        }))
                      }
                    >
                      Check-out
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() =>
                        setSortBy((s) => ({
                          key: "hours",
                          dir: s?.dir === "asc" ? "desc" : "asc",
                        }))
                      }
                    >
                      Total Hours
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <img
                            src="/placeholder.svg"
                            alt="Empty"
                            className="w-24 opacity-60"
                          />
                          <div>No records found</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                          >
                            Reset filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageRows.map((r) => (
                      <TableRow
                        key={r.id}
                        className="odd:bg-muted/30 hover:bg-accent/30"
                      >
                        <TableCell>
                          <Checkbox
                            checked={!!selectedRowIds[r.id]}
                            onCheckedChange={(val) =>
                              setSelectedRowIds((m) => ({
                                ...m,
                                [r.id]: !!val,
                              }))
                            }
                            aria-label="Select row"
                          />
                        </TableCell>
                        <TableCell className="">
                          <div className="flex items-center gap-2">
                            <img
                              src={r.avatar}
                              alt={r.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="font-medium">{r.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.checkIn ?? "-"}</TableCell>
                        <TableCell>{r.checkOut ?? "-"}</TableCell>
                        <TableCell>{r.hours ?? "-"}</TableCell>
                        <TableCell>{statusBadge(r.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 hover:bg-muted"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setEditRow(r);
                                }}
                              >
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleDeleteRows([r.id]);
                                }}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled>
                                Manage Images
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-4 gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPageIndex((i) => Math.min(pageCount - 1, i + 1))
                  }
                  disabled={pageIndex >= pageCount - 1}
                >
                  Next <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
              <div className="text-sm">
                Page {pageIndex + 1} of {pageCount}
              </div>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rows per page" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Show {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Edit modal */}
      {editRow ? (
        <EditDialog
          row={editRow}
          onClose={() => setEditRow(null)}
          onSave={editRowSave}
        />
      ) : null}
    </MainLayout>
  );
}

function EditDialog({
  row,
  onClose,
  onSave,
}: {
  row: Entry;
  onClose: () => void;
  onSave: (r: Entry) => void;
}) {
  const [checkIn, setCheckIn] = useState(row.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(row.checkOut ?? "");
  const [status, setStatus] = useState<Entry["status"]>(row.status);

  return (
    <Sheet
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit entry</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="text-sm text-muted-foreground">
            {row.name} — {row.date}
          </div>
          <div>
            <label className="text-sm font-medium">Check-in</label>
            <Input
              value={checkIn}
              placeholder="HH:mm"
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Check-out</label>
            <Input
              value={checkOut}
              placeholder="HH:mm"
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="not_checked_out">Not checked-out</SelectItem>
                <SelectItem value="checked_out">Checked-out</SelectItem>
                <SelectItem value="not_checked_in">Absent</SelectItem>
                <SelectItem value="on_leave">On leave</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <div className="flex w-full gap-2">
            <Button
              className="flex-1"
              onClick={() =>
                onSave({
                  ...row,
                  checkIn: checkIn || null,
                  checkOut: checkOut || null,
                  status,
                })
              }
            >
              Save
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

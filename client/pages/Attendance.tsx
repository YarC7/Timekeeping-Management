import MainLayout from "@/components/layout/MainLayout";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarRange, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { employeesApi } from "@/api/employees";
import { useTimekeepingList } from "@/api/timekeeping";
import { useAttendanceLogs } from "@/api/attendanceLogs";
import { Link } from "react-router-dom";

function parseTimeToMinutes(s: string | null): number | null {
  if (!s) return null;
  if (s.includes("T")) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes();
  }
  const parts = s.split(":");
  const hh = Number(parts[0]);
  const mm = Number(parts[1]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
}

function formatTimeDisplay(s: string | null) {
  const mins = parseTimeToMinutes(s);
  if (mins == null) return "-";
  const hh = String(Math.floor(mins / 60)).padStart(2, "0");
  const mm = String(mins % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function AttendanceIndex() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: employees = [] } = employeesApi.useList();
  const {
    data: attendances = [],
    isLoading: tkLoading,
    isError: tkError,
    error: tkErr,
  } = useTimekeepingList({ work_date: format(selectedDate, "yyyy-MM-dd") });
  // Also fetch recent logs and filter by selected date as fallback/augment
  const {
    data: logs = [],
    isLoading: logsLoading,
    isError: logsError,
    error: logsErr,
  } = useAttendanceLogs(1000);

  type Row = {
    employee_id: string;
    name: string;
    department?: string | null;
    position?: string | null;
    status: "Present" | "Absent" | "Late" | "Not-checked-out" | "Leave";
    check_in: string | null;
    check_out: string | null;
    hours: number | null;
  };

  const rows: Row[] = useMemo(() => {
    const workDate = format(selectedDate, "yyyy-MM-dd");
    const byEmpTk: Record<string, any> = {};
    for (const a of attendances) byEmpTk[a.employee_id] = a;

    // Build logs grouped by employee for the selected date
    const logsByEmp: Record<string, any[]> = {};
    for (const lg of logs as any[]) {
      const d = (lg.timestamp as string).slice(0, 10);
      if (d !== workDate) continue;
      if (!logsByEmp[lg.employee_id]) logsByEmp[lg.employee_id] = [];
      logsByEmp[lg.employee_id].push(lg);
    }

    const deriveFromLogs = (empId: string) => {
      const glogs = (logsByEmp[empId] || []).sort((a, b) =>
        (a.timestamp as string).localeCompare(b.timestamp as string)
      );
      const firstIn = glogs.find((g) => g.check_type === "checkin")?.timestamp as
        | string
        | undefined;
      const lastOut = [...glogs]
        .reverse()
        .find((g) => g.check_type === "checkout")?.timestamp as string | undefined;
      const check_in = firstIn ? firstIn.substring(11, 16) : null;
      const check_out = lastOut ? lastOut.substring(11, 16) : null;
      let hours: number | null = null;
      if (firstIn && lastOut) {
        const diff = new Date(lastOut).getTime() - new Date(firstIn).getTime();
        hours = Math.max(0, Math.round((diff / (1000 * 60 * 60)) * 100) / 100);
      }
      let status: Row["status"] = "Absent";
      if (check_in && check_out) {
        status = parseTimeToMinutes(check_in)! > 9 * 60 ? "Late" : "Present";
      } else if (check_in && !check_out) {
        status = "Not-checked-out";
      }
      return { check_in, check_out, hours, status } as Pick<
        Row,
        "check_in" | "check_out" | "hours" | "status"
      >;
    };

    return employees
      .filter((e) =>
        e.full_name.toLowerCase().includes(search.trim().toLowerCase())
      )
      .map((e) => {
        const a = byEmpTk[e.employee_id];
        let status: Row["status"] = "Absent";
        let check_in: string | null = null;
        let check_out: string | null = null;
        let hours: number | null = null;

        if (a) {
          if (a.status === "Leave") {
            status = "Leave";
          } else if (a.check_in && !a.check_out) {
            status = "Not-checked-out";
          } else if (a.check_in) {
            const mins = parseTimeToMinutes(a.check_in);
            status = mins != null && mins > 9 * 60 ? "Late" : "Present";
          }
          check_in = a.check_in;
          check_out = a.check_out;
          hours = a.total_hours;
        } else {
          // No timekeeping record for the day, try deriving from logs
          const derived = deriveFromLogs(e.employee_id);
          status = derived.status;
          check_in = derived.check_in;
          check_out = derived.check_out;
          hours = derived.hours;
        }

        return {
          employee_id: e.employee_id,
          name: e.full_name,
          department: (e as any).department ?? null,
          position: e.position,
          status,
          check_in,
          check_out,
          hours,
        } satisfies Row;
      });
  }, [attendances, employees, logs, search, selectedDate]);

  const kpis = useMemo(() => {
    const agg = {
      Present: 0,
      Absent: 0,
      Late: 0,
      NotCheckedOut: 0,
      Overtime: 0,
    };
    for (const r of rows) {
      if (r.status === "Present") agg.Present++;
      else if (r.status === "Absent") agg.Absent++;
      else if (r.status === "Late") agg.Late++;
      else if (r.status === "Not-checked-out") agg.NotCheckedOut++;
      const h = typeof r.hours === "number" ? r.hours : null;
      if (h != null && h > 8) agg.Overtime++;
    }
    return agg;
  }, [rows]);

  const statusBadge = (s: Row["status"]) => {
    switch (s) {
      case "Present":
        return (
          <Badge className="bg-green-500 text-white border-green-500">
            Present
          </Badge>
        );
      case "Late":
        return (
          <Badge className="bg-orange-500 text-white border-orange-500">
            Late
          </Badge>
        );
      case "Absent":
        return (
          <Badge className="bg-gray-300 text-gray-900 border-gray-300">
            Absent
          </Badge>
        );
      case "Not-checked-out":
        return (
          <Badge className="bg-yellow-400 text-black border-yellow-400">
            Not checked-out
          </Badge>
        );
      case "Leave":
        return (
          <Badge className="bg-blue-500 text-white border-blue-500">
            Leave
          </Badge>
        );
    }
  };

  return (
    <MainLayout title="Attendance Management">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Present</CardDescription>
            <CardTitle className="text-3xl">{kpis.Present}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Absent</CardDescription>
            <CardTitle className="text-3xl">{kpis.Absent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Late</CardDescription>
            <CardTitle className="text-3xl">{kpis.Late}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Not checked-out</CardDescription>
            <CardTitle className="text-3xl">{kpis.NotCheckedOut}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overtime</CardDescription>
            <CardTitle className="text-3xl">{kpis.Overtime}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start w-full flex-1">
                <CalendarRange className="mr-2 h-4 w-4" />
                {format(selectedDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[280px] p-0" align="start">
              <CalendarComponent
                mode="single"
                className="w-full"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
              />
            </PopoverContent>
          </Popover>

          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          {tkLoading || logsLoading ? (
            <div>Loading...</div>
          ) : tkError || logsError ? (
            <div className="text-red-500">
              {String(((tkErr as Error)?.message ?? (logsErr as Error)?.message) ?? "Error")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.employee_id}>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[180px]">
                        <img
                          src={`https://i.pravatar.cc/40?u=${r.employee_id}`}
                          alt={r.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-medium">{r.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{r.department ?? "—"}</TableCell>
                    <TableCell>{r.position ?? "—"}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell>{formatTimeDisplay(r.check_in)}</TableCell>
                    <TableCell>{formatTimeDisplay(r.check_out)}</TableCell>
                    <TableCell>
                      {r.hours != null ? r.hours.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/attendance/${r.employee_id}`}
                        className="text-primary hover:underline"
                      >
                        View detail
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

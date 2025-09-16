import MainLayout from "@/components/layout/MainLayout";
import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { employeesApi } from "@/api/employees";
import { useTimekeepingList } from "@/api/timekeeping";
import { exportData } from "@/lib/export";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

function formatDateDisplay(s: string | undefined) {
  if (!s) return "-";
  const d = new Date(`${s}T00:00:00`);
  if (isNaN(d.getTime())) return s;
  return format(d, "dd/MM/yyyy");
}

export default function EmployeeAttendanceDetail() {
  const { id } = useParams<{ id: string }>();
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));

  const { data: employee, isLoading: loadingEmp } = employeesApi.useDetail(
    id || "",
  );
  const from = format(startOfMonth(month), "yyyy-MM-dd");
  const to = format(endOfMonth(month), "yyyy-MM-dd");
  const { data: list = [], isLoading } = useTimekeepingList({
    dateFrom: from,
    dateTo: to,
  });

  const rows = useMemo(
    () =>
      (list || [])
        .filter((a) => a.employee_id === id)
        .sort((a, b) => (a?.work_date || "").localeCompare(b?.work_date || "")),
    [list, id],
  );

  const summary = useMemo(() => {
    let totalHours = 0;
    let overtime = 0;
    let late = 0;
    let leave = 0;
    for (const a of rows) {
      const h = typeof a.total_hours === "number" ? a.total_hours : 0;
      totalHours += h;
      if (h > 8) overtime++;
      const mins = parseTimeToMinutes(a.check_in);
      if (mins != null && mins > 9 * 60) late++;
      if (a.status === "Leave") leave++;
    }
    return { totalHours, overtime, late, leave };
  }, [rows]);

  const exportCSV = () => {
    const data = rows.map((r) => ({
      work_date: r.work_date,
      shift: "Standard",
      check_in: formatTimeDisplay(r.check_in),
      check_out: formatTimeDisplay(r.check_out),
      total_hours: r.total_hours ?? "-",
      status: r.status,
    }));
    exportData(
      data,
      `${employee?.full_name ?? "employee"}-${format(month, "yyyy-MM")}`,
      "csv",
    );
  };

  return (
    <MainLayout title="Employee Attendance Detail">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/attendance" className="text-primary hover:underline">
          Back to Attendance
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <img
            src={`https://i.pravatar.cc/64?u=${id}`}
            alt={employee?.full_name}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <div className="text-lg font-semibold">
              {employee?.full_name ?? ""}
            </div>
            <div className="text-sm text-muted-foreground">
              {employee?.position ?? ""}
            </div>
          </div>
        </div>
        <div className="md:ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth((d) => addMonths(d, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[140px] text-center font-medium">
            {format(month, "MMMM yyyy")}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth((d) => addMonths(d, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={exportCSV}>Export CSV</Button>
          <Button variant="outline" onClick={() => window.print()}>
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Hours</CardDescription>
            <CardTitle className="text-3xl">
              {summary.totalHours.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overtime</CardDescription>
            <CardTitle className="text-3xl">{summary.overtime}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Late</CardDescription>
            <CardTitle className="text-3xl">{summary.late}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Leave</CardDescription>
            <CardTitle className="text-3xl">{summary.leave}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          {isLoading || loadingEmp ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.log_id}>
                    <TableCell>{formatDateDisplay(r.work_date)}</TableCell>
                    <TableCell>Standard</TableCell>
                    <TableCell>{formatTimeDisplay(r.check_in)}</TableCell>
                    <TableCell>{formatTimeDisplay(r.check_out)}</TableCell>
                    <TableCell>
                      {r.total_hours != null ? r.total_hours.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell>
                      {r.status === "Present" && (
                        <Badge className="bg-green-500 text-white border-green-500">
                          Present
                        </Badge>
                      )}
                      {r.status === "Late" && (
                        <Badge className="bg-orange-500 text-white border-orange-500">
                          Late
                        </Badge>
                      )}
                      {r.status === "Absent" && (
                        <Badge className="bg-gray-300 text-gray-900 border-gray-300">
                          Absent
                        </Badge>
                      )}
                      {r.status === "Leave" && (
                        <Badge className="bg-blue-500 text-white border-blue-500">
                          Leave
                        </Badge>
                      )}
                      {r.status === "Not-checked-out" && (
                        <Badge className="bg-yellow-400 text-black border-yellow-400">
                          Not checked-out
                        </Badge>
                      )}
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

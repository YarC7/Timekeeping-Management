import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { exportData } from "@/lib/export";
import { CalendarClock, Plus } from "lucide-react";
import { useState } from "react";

interface Entry { id: string; user: string; date: string; hours: number }

export default function Timekeeping() {
  const [rows, setRows] = useState<Entry[]>([
    { id: "1", user: "Sarah Lee", date: "2025-09-10", hours: 7.5 },
    { id: "2", user: "John Park", date: "2025-09-10", hours: 8 },
    { id: "3", user: "Alex Kim", date: "2025-09-09", hours: 6 },
  ]);

  const add = () => {
    const id = String(rows.length + 1);
    setRows([...rows, { id, user: "New Member", date: new Date().toISOString().slice(0,10), hours: 8 }]);
  };

  const exportRows = (format: "csv" | "json") => exportData(rows, "timekeeping", format);

  return (
    <MainLayout title="Timekeeping Management">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Time entries</CardTitle>
            <CardDescription>Track hours by user and date</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportRows("csv")}>Export CSV</Button>
            <Button variant="secondary" onClick={() => exportRows("json")}>Export JSON</Button>
            <Button onClick={add}><Plus className="mr-2" />Add Entry</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.user}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.hours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

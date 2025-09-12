import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportData } from "@/lib/export";
import { Download } from "lucide-react";
import { useMemo } from "react";

export default function Exports() {
  const users = useMemo(() => [
    { id: 1, name: "Sarah Lee", email: "sarah@company.com", role: "Admin" },
    { id: 2, name: "John Park", email: "john@company.com", role: "Manager" },
  ], []);
  const timekeeping = useMemo(() => [
    { id: 1, user: "Sarah Lee", date: "2025-09-10", hours: 7.5 },
    { id: 2, user: "John Park", date: "2025-09-10", hours: 8 },
  ], []);

  return (
    <MainLayout title="Export Data">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Download your users list</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => exportData(users, "users", "csv")}><Download className="mr-2" />CSV</Button>
            <Button variant="secondary" onClick={() => exportData(users, "users", "json")}>JSON</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Timekeeping</CardTitle>
            <CardDescription>Download recorded hours</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => exportData(timekeeping, "timekeeping", "csv")}><Download className="mr-2" />CSV</Button>
            <Button variant="secondary" onClick={() => exportData(timekeeping, "timekeeping", "json")}>JSON</Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

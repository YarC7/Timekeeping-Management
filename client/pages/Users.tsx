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
import { exportData } from "@/lib/export";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Users() {
  const [rows, setRows] = useState<UserRow[]>([
    { id: "1", name: "Sarah Lee", email: "sarah@company.com", role: "Admin" },
    { id: "2", name: "John Park", email: "john@company.com", role: "Manager" },
    { id: "3", name: "Alex Kim", email: "alex@company.com", role: "Member" },
  ]);

  const add = () => {
    const id = String(rows.length + 1);
    setRows([
      ...rows,
      {
        id,
        name: `New User ${id}`,
        email: `user${id}@company.com`,
        role: "Member",
      },
    ]);
  };

  const exportRows = (format: "csv" | "json") =>
    exportData(rows, "users", format);

  const columns = useMemo(() => ["Name", "Email", "Role"], []);

  return (
    <MainLayout title="User Management">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage members and roles</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportRows("csv")}>
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => exportRows("json")}>
              Export JSON
            </Button>
            <Button onClick={add}>
              <Plus className="mr-2" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

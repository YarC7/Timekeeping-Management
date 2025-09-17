import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { EmployeeFormDialog } from "@/components/employee/EmployeeFormDialog";
import { DataTable } from "@/components/common/DataTable";
import { useEmployeesTable } from "@/hooks/useEmployeesTable";
import { exportData } from "@/lib/export";

export default function Users() {
  const { table, isLoading, isError, error, globalFilter, setGlobalFilter } =
    useEmployeesTable();
  // Get all user data for export
  const allUsers = table
    .getPrePaginationRowModel()
    .rows.map((row) => row.original);
  const handleExport = (format) => {
    exportData(allUsers, "users", format);
  };

  return (
    <MainLayout title="User Management">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage members and roles</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("csv")}>
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("json")}>
              Export JSON
            </Button>
            <Input
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-48"
            />
            <EmployeeFormDialog
              mode="create"
              trigger={
                <Button>
                  <Plus className="mr-2" />
                  Add
                </Button>
              }
            />
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            isError={isError}
            error={error}
          />
        </CardContent>
      </Card>
    </MainLayout>
  );
}

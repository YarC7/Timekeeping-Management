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

export default function Users() {
  const { table, isLoading, isError, error, globalFilter, setGlobalFilter } =
    useEmployeesTable();

  return (
    <MainLayout title="User Management">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage members and roles</CardDescription>
          </div>
          <div className="flex gap-2">
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

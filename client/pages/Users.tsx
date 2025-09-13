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
import { exportData } from "@/lib/export";
import { Plus, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { employeesApi } from "@/api/employees";
import { EmployeeFormDialog } from "@/components/employee/EmployeeFormDialog";
import { EmployeeActions } from "@/components/employee/EmployeeActions";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";

type Employee = {
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  role: string;
};

const columnHelper = createColumnHelper<Employee>();

const columns = [
  columnHelper.accessor("full_name", {
    header: "Name",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("role", {
    header: "Role",
  }),
  columnHelper.accessor("position", {
    header: "Position",
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => <EmployeeActions employee={row.original} />,
  }),
];

export default function Users() {
  const { data = [], isLoading, isError, error } = employeesApi.useList();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // 👈 enable client-side pagination
  });

  const exportRows = (format: "csv" | "json") =>
    exportData(data, "users", format);

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
            <Button variant="secondary" onClick={() => exportRows("csv")}>
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => exportRows("json")}>
              Export JSON
            </Button>
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
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <span className="ml-1">
                          {header.column.getIsSorted() === "asc" && (
                            <ArrowUp className="h-3 w-3" />
                          )}
                          {header.column.getIsSorted() === "desc" && (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          {!header.column.getIsSorted() && (
                            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                          )}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length}>⏳ Loading...</TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-red-500">
                    ❌ {(error as Error).message}
                  </TableCell>
                </TableRow>
              )}
              {table.getRowModel().rows.length === 0 &&
                !isLoading &&
                !isError && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="ml-2 border rounded p-1"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

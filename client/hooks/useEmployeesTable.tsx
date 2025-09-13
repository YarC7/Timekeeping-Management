import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { employeesApi } from "@/api/employees";
import { EmployeeActions } from "@/components/employee/EmployeeActions";

export type Employee = {
  employee_id: string;
  full_name: string;
  email: string;
  // phone: string;
  position: string;
  role: string;
  // image: string; // Assuming image is a string URL
};

const columnHelper = createColumnHelper<Employee>();

const columns = [
  columnHelper.accessor("full_name", {
    header: "Name",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("role", { header: "Role" }),
  columnHelper.accessor("position", { header: "Position" }),
  // columnHelper.accessor("phone", { header: "Phone" }),
  // columnHelper.accessor("image", {
  //   header: "Image",
  //   cell: ({ value }) => <img src={value} alt="Employee" />,
  // }),
  // Add more columns as needed...
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => <EmployeeActions employee={row.original} />,
  }),
];

export function useEmployeesTable() {
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
    getPaginationRowModel: getPaginationRowModel(),
  });

  return {
    table,
    isLoading,
    isError,
    error,
    globalFilter,
    setGlobalFilter,
  };
}

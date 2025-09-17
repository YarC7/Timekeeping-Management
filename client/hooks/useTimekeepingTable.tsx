import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export type TimekeepingRow = {
  id: string;
  name: string;
  avatar: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hours: number | null;
  status:
    | "present"
    | "not_checked_in"
    | "not_checked_out"
    | "on_leave"
    | "late"
    | "checked_out";
};

export type UseTimekeepingTableOptions = {
  onView?: (row: TimekeepingRow) => void;
  onEdit?: (row: TimekeepingRow) => void;
  onDelete?: (ids: string[]) => void;
  enableSelection?: boolean; // default false for safer view mode
  showEditDelete?: boolean; // default false
};

const columnHelper = createColumnHelper<TimekeepingRow>();

export function useTimekeepingTable(
  data: TimekeepingRow[],
  options?: UseTimekeepingTableOptions,
) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const enableSelection = options?.enableSelection ?? false;
  const showEditDelete = options?.showEditDelete ?? false;

  const statusBadge = (s: TimekeepingRow["status"]) => {
    switch (s) {
      case "present":
        return <Badge className="bg-green-500 text-white border-green-500">Present</Badge>;
      case "checked_out":
        return <Badge variant="destructive">Checked-out</Badge>;
      case "not_checked_out":
        return (
          <Badge className="bg-yellow-400 text-black border-yellow-400">Not checked-out</Badge>
        );
      case "not_checked_in":
        return <Badge className="bg-gray-300 text-gray-900 border-gray-300">Absent</Badge>;
      case "on_leave":
        return <Badge className="bg-blue-500 text-white border-blue-500">On leave</Badge>;
      case "late":
        return <Badge className="bg-orange-500 text-white border-orange-500">Late</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDateDisplay = (s: string) => {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : format(d, "dd/MM/yyyy");
  };
  const parseTimeToMinutes = (s: string | null): number | null => {
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
  };
  const formatTimeDisplay = (s: string | null) => {
    const mins = parseTimeToMinutes(s);
    if (mins == null) return "-";
    const hh = String(Math.floor(mins / 60)).padStart(2, "0");
    const mm = String(mins % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const columns = React.useMemo(() => {
    const cols: any[] = [];

    if (enableSelection) {
      cols.push(
        columnHelper.display({
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={table.getToggleAllPageRowsSelectedHandler()}
              aria-label="Select all"
              data-state={
                table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : table.getIsAllPageRowsSelected()
                    ? "checked"
                    : "unchecked"
              }
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={row.getToggleSelectedHandler()}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
          size: 48,
        }),
      );
    }

    cols.push(
      columnHelper.accessor("name", {
        header: "Employee",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-[180px]">
            <img
              src={row.original.avatar}
              alt={row.original.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      }),
    );

    cols.push(
      columnHelper.accessor((row) => {
        const t = new Date(row.date).getTime();
        return Number.isFinite(t) ? t : 0;
      }, {
        id: "date",
        header: "Date",
        cell: ({ row }) => formatDateDisplay(row.original.date),
      }),
    );

    cols.push(
      columnHelper.accessor((row) => parseTimeToMinutes(row.checkIn) ?? -1, {
        id: "checkIn",
        header: "Check-in",
        cell: ({ row }) => formatTimeDisplay(row.original.checkIn),
      }),
    );

    cols.push(
      columnHelper.accessor((row) => parseTimeToMinutes(row.checkOut) ?? -1, {
        id: "checkOut",
        header: "Check-out",
        cell: ({ row }) => formatTimeDisplay(row.original.checkOut),
      }),
    );

    cols.push(
      columnHelper.accessor("hours", {
        header: "Total Hours",
        cell: ({ getValue }) => (getValue() ?? "-") as any,
      }),
    );

    cols.push(
      columnHelper.accessor("status", {
        header: "Status",
        enableSorting: false,
        cell: ({ getValue }) => statusBadge(getValue()),
      }),
    );

    cols.push(
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {options?.onView ? (
              <Button variant="ghost" size="sm" onClick={() => options?.onView?.(row.original)}>
                View
              </Button>
            ) : null}
            {showEditDelete && options?.onEdit ? (
              <Button variant="ghost" size="sm" onClick={() => options?.onEdit?.(row.original)}>
                Edit
              </Button>
            ) : null}
            {showEditDelete && options?.onDelete ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => options?.onDelete?.([row.original.id])}
              >
                Delete
              </Button>
            ) : null}
          </div>
        ),
        enableSorting: false,
      }),
    );

    return cols;
  }, [enableSelection, showEditDelete, options]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: enableSelection,
  });

  return {
    table,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    rowSelection,
    setRowSelection,
  };
}

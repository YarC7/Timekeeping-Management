import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface DataTableProps<T> {
  table: ReactTable<T>;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
}

export function DataTable<T>({
  table,
  isLoading,
  isError,
  error,
}: DataTableProps<T>) {
  return (
    <div>
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
              <TableCell colSpan={table.getAllColumns().length}>
                ⏳ Loading...
              </TableCell>
            </TableRow>
          )}
          {isError && (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="text-red-500"
              >
                ❌ {(error as Error).message}
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !isError && table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="text-center"
              >
                No data found
              </TableCell>
            </TableRow>
          )}
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
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
        <Select
          value={String(table.getState().pagination.pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Rows per page" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((size) => (
              <SelectItem key={size} value={String(size)}>
                Show {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

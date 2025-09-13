import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { EmployeeFormDialog } from "./EmployeeFormDialog";
import { employeesApi } from "@/api/employees";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function EmployeeActions({ employee }) {
  const deleteEmployee = employeesApi.useDelete();

  const handleDelete = () => {
    deleteEmployee.mutate(employee.employee_id, {
      onSuccess: () => toast.success("Employee deleted ✅"),
      onError: (err: any) =>
        toast.error(err.message || "Failed to delete employee ❌"),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-lg border shadow-md p-1"
      >
        {/* Edit */}
        <DropdownMenuItem asChild>
          <EmployeeFormDialog
            mode="edit"
            defaultValues={{
              employee_id: employee.employee_id,
              full_name: employee.full_name,
              email: employee.email,
              phone: employee.phone,
              position: employee.position,
              role: employee.role,
            }}
            trigger={
              <button className="flex items-center gap-2 rounded-md px-3 py-2 mx-auto w-full text-blue-600 hover:bg-blue-50 focus:bg-blue-50">
                <Pencil className="w-4 h-4" /> Edit
              </button>
            }
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />

        {/* Delete */}
        <DropdownMenuItem asChild>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-3 py-2 mx-auto w-full text-red-600 hover:bg-red-50 focus:bg-red-50">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete {employee.full_name}?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  ScanFaceIcon,
  Trash2,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import { EmployeeFormDialog } from "./EmployeeFormDialog";
import { employeesApi, useToggleEmployeeActive } from "@/api/employees";
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
import { FaceImageDialog } from "./FaceImageDialog";

export function EmployeeActions({ employee }) {
  const deleteEmployee = employeesApi.useDelete();
  const toggleEmployee = useToggleEmployeeActive();

  const handleDelete = () => {
    deleteEmployee.mutate(employee.employee_id, {
      onSuccess: () => toast.success("Employee deleted ✅"),
      onError: (err: any) =>
        toast.error(err.message || "Failed to delete employee ❌"),
    });
  };

  const handleToggleActive = () => {
    toggleEmployee.mutate(employee.employee_id, {
      onSuccess: () => toast.success("Employee status updated"),
      onError: (err: any) =>
        toast.error(err.message || "Failed to update employee status ��"),
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
        {/* Image Handle */}
        <FaceImageDialog
          employee={employee}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <ScanFaceIcon className="w-4 h-4 mr-2" /> Images
            </DropdownMenuItem>
          }
        />
        <DropdownMenuSeparator className="my-1" />

        {/* Edit */}
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
            <DropdownMenuItem
              className="text-blue-600 focus:text-blue-600"
              onSelect={(e) => e.preventDefault()}
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
          }
        />
        <DropdownMenuSeparator className="my-1" />

        {/* DE/ACTIVE */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-slate-600 focus:text-slate-600"
              onSelect={(e) => e.preventDefault()}
            >
              {employee.is_active ? (
                <UserRoundCheck className="w-4 h-4 mr-2" />
              ) : (
                <UserRoundX className="w-4 h-4 mr-2" />
              )}
              {employee.is_active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {employee.is_active
                  ? `Are you sure you want to deactivate ${employee.full_name}?`
                  : `Are you sure you want to activate ${employee.full_name}?`}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleToggleActive}
              >
                {employee.is_active ? "Deactivate" : "Activate"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DropdownMenuSeparator className="my-1" />

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

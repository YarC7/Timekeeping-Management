import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { employeesApi } from "@/api/employees";
import { toast } from "sonner";

const schema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(8, "Phone must have at least 8 digits"),
  position: z.string().min(1, "Position is required"),
  role: z.enum(["employee", "manager", "hr"]).default("employee"),
});

type EmployeeFormData = z.infer<typeof schema>;

interface Props {
  mode: "create" | "edit";
  defaultValues?: EmployeeFormData & { employee_id?: string };
  trigger: React.ReactNode;
}

export function EmployeeFormDialog({ mode, defaultValues, trigger }: Props) {
  const [open, setOpen] = useState(false);

  const createEmployee = employeesApi.useCreate();
  const updateEmployee = employeesApi.useUpdate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      full_name: "",
      email: "",
      phone: "",
      position: "",
      role: "employee",
    },
  });

  const onSubmit = async (values: EmployeeFormData) => {
    try {
      if (mode === "create") {
        await createEmployee.mutateAsync(values);
        toast.success("Employee created successfully ✅");
      } else if (mode === "edit" && defaultValues?.employee_id) {
        await updateEmployee.mutateAsync({ id: defaultValues.employee_id, ...values });
        toast.success("Employee updated successfully ✨");
      }
      reset();
      setOpen(false); // 👈 tự đóng dialog
    } catch (err: any) {
      toast.error(err.message || "Something went wrong ❌");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Employee" : "Edit Employee"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && <p className="text-red-500">{errors.full_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Input id="position" {...register("position")} />
            {errors.position && <p className="text-red-500">{errors.position.message}</p>}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <select id="role" {...register("role")} className="w-full border rounded p-2">
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {mode === "create"
                ? isSubmitting
                  ? "Adding..."
                  : "Add"
                : isSubmitting
                ? "Saving..."
                : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

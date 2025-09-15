import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TimekeepingRow } from "@/hooks/useTimekeepingTable";

export function EditDialog({
  row,
  onClose,
  onSave,
}: {
  row: TimekeepingRow;
  onClose: () => void;
  onSave: (r: TimekeepingRow) => void;
}) {
  const [checkIn, setCheckIn] = useState(row.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(row.checkOut ?? "");
  const [status, setStatus] = useState<TimekeepingRow["status"]>(row.status);

  return (
    <Sheet
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit entry</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="text-sm text-muted-foreground">
            {row.name} — {row.date}
          </div>
          <div>
            <label className="text-sm font-medium">Check-in</label>
            <Input
              value={checkIn}
              placeholder="HH:mm"
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Check-out</label>
            <Input
              value={checkOut}
              placeholder="HH:mm"
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="not_checked_out">Not checked-out</SelectItem>
                <SelectItem value="checked_out">Checked-out</SelectItem>
                <SelectItem value="not_checked_in">Absent</SelectItem>
                <SelectItem value="on_leave">On leave</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <div className="flex w-full gap-2">
            <Button
              className="flex-1"
              onClick={() =>
                onSave({
                  ...row,
                  checkIn: checkIn || null,
                  checkOut: checkOut || null,
                  status,
                })
              }
            >
              Save
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

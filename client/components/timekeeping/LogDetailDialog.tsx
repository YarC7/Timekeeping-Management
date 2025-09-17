import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export type LogDetail = {
  log_id: number;
  employee_id: string;
  work_date: string; // YYYY-MM-DD
  check_type: "checkin" | "checkout";
  timestamp: string; // ISO
  similarity: number | null;
  success_image: string | null;
};

export function LogDetailDialog({
  open,
  onOpenChange,
  employeeName,
  employeeId,
  date,
  logs,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  logs: LogDetail[];
}) {
  const byType: Record<string, LogDetail | undefined> = {
    checkin: logs.find((l) => l.check_type === "checkin"),
    checkout: logs.find((l) => l.check_type === "checkout"),
  };

  const renderCard = (label: string, log?: LogDetail) => (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
        <div className="font-medium">{label}</div>
        {log?.similarity != null ? (
          <Badge className="bg-emerald-500 text-white border-emerald-500">
            Similarity: {Math.round(log.similarity * 100) / 100}
          </Badge>
        ) : (
          <Badge variant="secondary">No similarity</Badge>
        )}
      </div>
      <div className="p-3">
        {log?.success_image ? (
          <img
            src={log.success_image}
            alt={`${label} image`}
            className="w-full h-auto rounded-md object-contain bg-muted/30"
          />
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground bg-muted/30 rounded-md">
            No image available
          </div>
        )}
        {log ? (
          <div className="mt-2 text-xs text-muted-foreground">
            Time: {format(new Date(log.timestamp), "HH:mm:ss dd/MM/yyyy")}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {employeeName} — {date}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="text-sm text-muted-foreground">Employee ID: {employeeId}</div>
          <div className="grid grid-cols-1 gap-4">
            {renderCard("Check-in", byType.checkin)}
            {renderCard("Check-out", byType.checkout)}
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

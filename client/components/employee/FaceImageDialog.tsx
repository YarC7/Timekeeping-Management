import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  PencilLine,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  useEmployeeFaces,
  useUploadEmployeeFace,
  useUpdateEmployeeFace,
  useDeleteEmployeeFace,
} from "@/api/employees";

interface FaceImageDialogProps {
  employee: any;
  trigger?: React.ReactNode;
}

export function FaceImageDialog({ employee, trigger }: FaceImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");

  const facesQuery = useEmployeeFaces(employee.employee_id);
  console.log("facesQuery.data", facesQuery.data);
  const uploadFace = useUploadEmployeeFace(employee.employee_id);
  const updateFace = useUpdateEmployeeFace(employee.employee_id);
  const deleteFace = useDeleteEmployeeFace(employee.employee_id);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadFace.mutateAsync(formData);
      toast.success("Face uploaded successfully ✅");
    } catch (err: any) {
      toast.error(err.message || "Upload failed ❌");
    }
  };

  const handleEdit = (face: any) => {
    setEditId(face.vector_id);
    setEditUrl(face.image_url || "");
  };

  const handleSave = async () => {
    if (!editId) return;
    try {
      await updateFace.mutateAsync({
        vector_id: editId,
        image_url: editUrl,
      });
      toast.success("Face updated ✅");
      setEditId(null);
    } catch (err: any) {
      toast.error(err.message || "Update failed ❌");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="flex gap-1">
            <ImageIcon className="w-4 h-4" /> Faces
          </Button>
        )}
      </DialogTrigger>

      <DialogContent aria-describedby="face-modal" className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage Faces — {employee.full_name}</DialogTitle>
        </DialogHeader>

        {/* Upload button */}
        <div className="flex items-center gap-2 my-3">
          <label className="cursor-pointer flex items-center gap-1 px-3 py-2 border rounded bg-muted hover:bg-muted/70">
            <Plus className="w-4 h-4" /> Upload
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleUpload}
            />
          </label>
        </div>

        {/* States */}
        {facesQuery.isLoading && <p>⏳ Loading...</p>}
        {facesQuery.isError && (
          <p className="text-red-500">❌ Failed to load faces</p>
        )}
        {!facesQuery.isLoading && facesQuery.data?.length === 0 && (
          <p>No faces registered yet.</p>
        )}

        {/* Faces grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {facesQuery.data?.map((face: any) => (
            <div
              key={face.vector_id}
              className="relative group rounded border shadow-sm overflow-hidden"
            >
              <img
                src={face.image_url || "/placeholder-face.png"}
                alt="face"
                className="w-full h-28 object-cover"
              />

              {/* Action buttons */}
              {editId === face.vector_id ? (
                <div className="p-2 space-y-2 bg-muted">
                  <Input
                    placeholder="Image URL"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                  />

                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditId(null)}
                    >
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleEdit(face)}
                  >
                    <PencilLine className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() =>
                      deleteFace.mutate(face.vector_id, {
                        onSuccess: () => toast.success("Deleted face ✅"),
                        onError: () => toast.error("Failed to delete face ❌"),
                      })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

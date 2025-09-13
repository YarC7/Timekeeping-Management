import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import {
  useEmployeeImages,
  useUploadEmployeeImage,
  useDeleteEmployeeImage,
} from "@/api/employees";

interface FaceImageDialogProps {
  employee: any;
  trigger?: React.ReactNode;
}

export function FaceImageDialog({ employee, trigger }: FaceImageDialogProps) {
  const [open, setOpen] = useState(false);
  const imagesQuery = useEmployeeImages(employee.employee_id);
  const uploadImage = useUploadEmployeeImage(employee.employee_id);
  const deleteImage = useDeleteEmployeeImage(employee.employee_id);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadImage.mutateAsync(formData);
      toast.success("Image uploaded successfully ✅");
    } catch (err: any) {
      toast.error(err.message || "Upload failed ❌");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="flex gap-1">
            <ImageIcon className="w-4 h-4" /> Images
          </Button>
        )}
      </DialogTrigger>

      <DialogContent aria-describedby="image-modal" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Images — {employee.full_name}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 my-2">
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

        {imagesQuery.isLoading && <p>⏳ Loading...</p>}
        {imagesQuery.isError && (
          <p className="text-red-500">❌ Failed to load images</p>
        )}
        {!imagesQuery.isLoading && imagesQuery.data?.length === 0 && (
          <p>No images uploaded yet.</p>
        )}
        <div className="grid grid-cols-3 gap-3">
          {imagesQuery.data?.map((img: any) => (
            <div key={img.image_id} className="relative group">
              <img
                src={img.url}
                alt="face"
                className="w-full h-24 object-cover rounded border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                onClick={() =>
                  deleteImage.mutate(img.image_id, {
                    onSuccess: () => toast.success("Deleted image"),
                    onError: () => toast.error("Failed to delete image ❌"),
                  })
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

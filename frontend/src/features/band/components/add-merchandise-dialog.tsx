import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useState } from "react";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import useMerchandise from "@/features/band/hooks/useMerchandise";
import { toast } from "sonner";

interface AddMerchandiseDialogProps {
  bandId: string;
  onMerchandiseAdded?: () => void;
  trigger?: React.ReactNode;
}

const AddMerchandiseDialog = ({
  bandId,
  onMerchandiseAdded,
  trigger,
}: AddMerchandiseDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  const { addMerchandise, isCreating } = useMerchandise(bandId);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImagePreview("");
    setImageFile(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast("Please enter a name for the merchandise item", { duration: 3000 });
      return;
    }

    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast("Please enter a valid price", { duration: 3000 });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("bandId", bandId);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await addMerchandise(formData);

      toast("Merchandise item added successfully", { duration: 3000 });
      resetForm();
      setOpen(false);

      if (onMerchandiseAdded) {
        onMerchandiseAdded();
      }
    } catch (error) {
      toast(
        `Failed to add merchandise: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { duration: 5000 }
      );
      console.error("Error adding merchandise:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm">
            Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Merchandise</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="T-Shirt, Poster, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your merchandise..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="19.99"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2 border rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-contain"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Adding..." : "Add Merchandise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMerchandiseDialog;

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
import type Band from "@/features/band/types/band";
import { Label } from "@/shared/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

interface EditBandDialogProps {
  band: Band | undefined;
  handleBandUpdate: (updatedBand: Band) => Promise<void>;
}

const EditBandDialog = ({ band, handleBandUpdate }: EditBandDialogProps) => {
  const [updatedBand, setUpdatedBand] = useState<Band | undefined>(band);
  const [imagePreview, setImagePreview] = useState(band?.coverImage || "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (updatedBand) {
      setUpdatedBand({
        ...updatedBand,
        [name]: value,
      });
    }
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

  const handleSubmit = async () => {
    if (updatedBand) {
      const updatedData = { ...updatedBand, picture: imageFile };
      await handleBandUpdate(updatedData);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Band</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-center items-center gap-4 py-4">
          <Avatar className="w-[200px] h-[200px]">
            <AvatarImage
              src={
                typeof imagePreview === "string"
                  ? imagePreview.startsWith("data:")
                    ? imagePreview
                    : `data:image/jpeg;base64,${imagePreview}`
                  : ""
              }
              className="object-cover"
            />
            <AvatarFallback>BandPicture</AvatarFallback>
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border p-2 w-[90%] rounded"
          />
          <div className="flex flex-col gap-2 w-[90%]">
            <Label className="ml-1">Name</Label>
            <Input
              name="name"
              type="text"
              value={updatedBand?.name || ""}
              onChange={handleInputChange}
              className="border p-2 w-full max-w-md rounded"
            />
          </div>
          <div className="flex flex-col gap-2 w-[90%]">
            <Label className="ml-1">Description</Label>
            <Input
              name="description"
              type="text"
              value={updatedBand?.description || ""}
              onChange={handleInputChange}
              className="border p-2 w-full max-w-md rounded"
            />
          </div>
          <div className="flex flex-col gap-2 w-[90%]">
            <Label className="ml-1">Genre</Label>
            <Input
              name="genre"
              type="text"
              value={updatedBand?.genre || ""}
              onChange={handleInputChange}
              className="border p-2 w-full max-w-md rounded"
            />
          </div>
          <div className="flex flex-col gap-2 w-[90%]">
            <Label className="ml-1">Spotify ID</Label>
            <Input
              name="spotifyId"
              type="text"
              value={updatedBand?.spotifyId || ""}
              onChange={handleInputChange}
              className="border p-2 w-full max-w-md rounded"
            />
          </div>
          <div className="flex flex-col gap-2 w-[90%]">
            <Label className="ml-1">YouTube ID</Label>
            <Input
              name="youTubeEmbedId"
              type="text"
              value={updatedBand?.youTubeEmbedId || ""}
              onChange={handleInputChange}
              className="border p-2 w-full max-w-md rounded"
            />
          </div>
        </div>
        <DialogFooter className="w-[95%]">
          <DialogClose asChild>
            <Button type="submit" onClick={handleSubmit}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBandDialog;

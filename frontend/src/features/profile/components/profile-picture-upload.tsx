import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface ProfilePictureUploadProps {
  currentImage?: string;
  username: string;
  onUpload: (file: File) => Promise<void>;
}

const ProfilePictureUpload = ({
  currentImage,
  username,
  onUpload,
}: ProfilePictureUploadProps) => {
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    currentImage
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setImagePreview(currentImage);
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      setIsUploading(true);

      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        await onUpload(file);
        toast.success("Profile picture updated successfully");
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        toast.error("Failed to upload profile picture");
        setImagePreview(currentImage);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-32 h-32 border-4 border-muted">
        <AvatarImage
          src={imagePreview}
          alt={username}
          className="object-cover"
        />
        <AvatarFallback className="text-3xl">
          {username ? username.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>

      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isUploading}
        >
          <Upload size={16} /> {isUploading ? "Uploading..." : "Change Picture"}
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
          />
        </Button>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;

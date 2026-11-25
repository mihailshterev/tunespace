import { z } from "zod";
const fileSizeLimit = 5 * 1024 * 1024;

export const bandRegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  genre: z.string().trim(),
  description: z.string().trim(),
  picture: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Profile picture is required")
    .refine(
      (files) => files[0]?.size <= fileSizeLimit,
      "File size must be less than 2MB"
    )
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "image/webp"].includes(files[0]?.type),
      "Only JPG, PNG, or WEBP files are allowed"
    ),
});

export type BandRegisterInputs = z.infer<typeof bandRegisterSchema>;

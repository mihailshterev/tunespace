import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Username must be at least 2 characters"),
    email: z.string().email().trim(),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInputs = z.infer<typeof registerSchema>;

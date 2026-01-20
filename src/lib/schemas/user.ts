import { z } from "zod";

// User Validation Schemas

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address")
  .toLowerCase();

const roleNamesSchema = z
  .array(z.string())
  .min(1, "At least one role must be assigned")
  .max(5, "Cannot assign more than 5 roles");

export const userCreateSchema = z.object({
  email: emailSchema,
  
  portal_id: z
    .string()
    .uuid("Invalid portal ID")
    .optional()
    .nullable(),
  
  role_names: roleNamesSchema,
  
  send_otp: z.boolean().optional().default(false),
});

export const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  
  role_names: roleNamesSchema.optional(),
  
  is_active: z.boolean().optional(),
}).refine(
  (data) => data.email || data.role_names || data.is_active !== undefined,
  {
    message: "At least one field must be provided for update",
  }
);

// Type exports
export type UserCreateSchema = z.infer<typeof userCreateSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;

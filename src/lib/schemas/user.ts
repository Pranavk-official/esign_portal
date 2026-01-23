import { z } from "zod";

// User Validation Schemas

const emailSchema = z
  .email("Invalid email address")
  .trim()
  .min(1, "Email is required")
  .toLowerCase();

const roleNamesSchema = z
  .array(z.string())
  .min(1, "At least one role must be assigned")
  .max(5, "Cannot assign more than 5 roles");

export const userCreateSchema = z.object({
  email: emailSchema,

  portal_id: z.string().uuid("Invalid portal ID").optional().nullable(),

  role_names: roleNamesSchema,

  send_otp: z.boolean().optional(),
});

export const userUpdateSchema = z
  .object({
    email: emailSchema.optional(),

    role_names: roleNamesSchema.optional(),

    is_active: z.boolean().optional(),
  })
  .refine((data) => data.email || data.role_names || data.is_active !== undefined, {
    message: "At least one field must be provided for update",
  });

// Type exports - Request types
export type UserCreateRequest = z.infer<typeof userCreateSchema>;
export type UserUpdateRequest = z.infer<typeof userUpdateSchema>;

// Response Validation Schemas
export const userRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
});

export const userDetailResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  portal_id: z.string().uuid().nullable(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  role_names: z.array(z.string()),
});

export const userListResponseSchema = userDetailResponseSchema.extend({
  updated_at: z.string().datetime(),
});

// Response type exports
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserDetailResponse = z.infer<typeof userDetailResponseSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;

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

  portal_id: z.string().min(1, "Portal ID is required").optional().nullable(),

  role_names: roleNamesSchema,

  send_otp: z.boolean().optional(),
});

/**
 * Narrowed schema for Portal Admins creating users in their own portal.
 * portal_id is omitted — the backend derives it from the authenticated user's context.
 * send_otp is always true server-side, so it's not exposed.
 */
export const portalAdminUserCreateSchema = z.object({
  email: emailSchema,
  role_names: roleNamesSchema,
});

/**
 * Super Admin and Portal Admin update schema.
 * role_names is intentionally absent — use the dedicated role-assignment
 * endpoints (POST/DELETE /admin/users/{id}/roles) for role changes.
 */
export const userUpdateSchema = z
  .object({
    email: emailSchema.optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => data.email !== undefined || data.is_active !== undefined, {
    message: "At least one field must be provided for update",
  });

// Type exports - Request types
export type UserCreateRequest = z.infer<typeof userCreateSchema>;
export type PortalAdminUserCreateRequest = z.infer<typeof portalAdminUserCreateSchema>;
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

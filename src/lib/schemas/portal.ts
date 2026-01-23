import { z } from "zod";

// Portal Name Validation
const portalNameSchema = z
  .string()
  .trim()
  .min(2, "Portal name must be at least 2 characters")
  .max(100, "Portal name must not exceed 100 characters")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Portal name can only contain letters, numbers, spaces, hyphens, and underscores");

// Email Validation
const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address")
  .toLowerCase();

// Request Schemas
export const portalOnboardingSchema = z.object({
    portal_name: portalNameSchema,
    admin_email: emailSchema,
});

export const portalRevokeSchema = z.object({
    is_active: z.boolean(),
    reason: z.string().trim().min(10, "Reason must be at least 10 characters").optional().nullable(),
});

export const portalKeyLimitSchema = z.object({
    live_key_limit: z.number().int().positive("Limit must be a positive number").optional().nullable(),
});

// Type exports - Request types
export type PortalOnboardingRequest = z.infer<typeof portalOnboardingSchema>;
export type PortalRevokeRequest = z.infer<typeof portalRevokeSchema>;
export type PortalKeyLimitRequest = z.infer<typeof portalKeyLimitSchema>;

// Legacy exports for backwards compatibility
export type PortalOnboardingSchema = PortalOnboardingRequest;
export type PortalRevokeSchema = PortalRevokeRequest;
export type PortalKeyLimitSchema = PortalKeyLimitRequest;

// Response schemas (for runtime validation if needed)
export const portalResponseSchema = z.object({
    portal_id: z.string().uuid(),
    name: z.string(),
    is_active: z.boolean(),
    created_at: z.string().datetime(),
    live_key_limit: z.number().nullable().optional(),
});

export type PortalResponse = z.infer<typeof portalResponseSchema>;

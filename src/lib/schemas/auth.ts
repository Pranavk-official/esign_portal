import { z } from "zod";

// ─── Reusable Field Schemas ─────────────────────────────────

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required." })
  .email({ message: "Please enter a valid email address." })
  .toLowerCase();

const otpSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{6}$/, { message: "OTP must be exactly 6 digits." });

// ─── Form Schemas (input validation) ────────────────────────

export const otpRequestSchema = z.object({
  email: emailSchema,
  scope: z.enum(["LOGIN", "RESET_PASSWORD"]),
});

export const otpVerifySchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  scope: z.enum(["LOGIN", "RESET_PASSWORD"]),
});

export type OTPRequestForm = z.infer<typeof otpRequestSchema>;
export type OTPVerifyForm = z.infer<typeof otpVerifySchema>;

// ─── Response Schemas (runtime validation) ──────────────────

export const userRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

export const userDetailSchema = z.object({
  id: z.string(),
  email: z.string(),
  portal_id: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  roles: z.array(userRoleSchema),
});

export const otpRequestResponseSchema = z.object({
  message: z.string(),
});

export const authResponseSchema = z.object({
  message: z.string(),
  token_type: z.string().optional().default("bearer"),
  user: userDetailSchema.nullable(),
});

export const logoutResponseSchema = z.object({
  message: z.string(),
});

// ─── Inferred Types ─────────────────────────────────────────

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserDetailResponse = z.infer<typeof userDetailSchema>;
export type OTPRequestResponse = z.infer<typeof otpRequestResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;

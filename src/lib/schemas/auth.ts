import { z } from "zod";

// ─── Form Schemas (input validation only) ────────────────────
// Response types live in @/lib/api/auth aligned with the OpenAPI spec.

export const otpRequestSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export const otpVerifySchema = z.object({
  email: z.string().email(),
  // Field name is 'otp' per openapi.json (not otp_code)
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

export type OTPRequestForm = z.infer<typeof otpRequestSchema>;
export type OTPVerifyForm = z.infer<typeof otpVerifySchema>;

import { z } from "zod";

// Email validation with custom error messages
const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required." })
  .email({ message: "Please enter a valid email address." })
  .toLowerCase();

// OTP validation with strict format
const otpSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{6}$/, { message: "OTP must be exactly 6 digits." });

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

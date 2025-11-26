import { z } from "zod";

export const otpRequestSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export const otpVerifySchema = z.object({
  email: z.string().email(),
  // FIX: Field name is 'otp' per openapi.json
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

export type OTPRequestForm = z.infer<typeof otpRequestSchema>;
export type OTPVerifyForm = z.infer<typeof otpVerifySchema>;

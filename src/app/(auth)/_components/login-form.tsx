"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuthMutations } from "@/hooks/use-auth-mutations";
import {
  type OTPRequestForm,
  otpRequestSchema,
  type OTPVerifyForm,
  otpVerifySchema,
} from "@/lib/schemas/auth";

type LoginStep = "EMAIL" | "OTP";

const RESEND_COOLDOWN = 30; // seconds

export function LoginForm() {
  const [step, setStep] = useState<LoginStep>("EMAIL");
  const [resendTimer, setResendTimer] = useState(0);
  const { requestOTP, isRequestingOTP, verifyOTP, isVerifyingOTP } = useAuthMutations();

  // ── Resend cooldown timer ─────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // ── Email Form (Step 1) ───────────────────────────────────
  const emailForm = useForm<OTPRequestForm>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: "", scope: "LOGIN" },
  });

  // ── OTP Form (Step 2) ────────────────────────────────────
  const otpForm = useForm<OTPVerifyForm>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { email: "", otp: "", scope: "LOGIN" },
  });

  // ── Handlers ──────────────────────────────────────────────
  const handleEmailSubmit = (data: OTPRequestForm) => {
    requestOTP(data, {
      onSuccess: () => {
        otpForm.setValue("email", data.email);
        setStep("OTP");
        setResendTimer(RESEND_COOLDOWN);
      },
    });
  };

  const handleOtpSubmit = (data: OTPVerifyForm) => {
    verifyOTP(data);
  };

  const handleResendOTP = useCallback(() => {
    const email = otpForm.getValues("email");
    if (!email) {
      toast.error("Session lost. Please reload.");
      return;
    }
    setResendTimer(RESEND_COOLDOWN);
    requestOTP({ email, scope: "LOGIN" });
  }, [requestOTP, otpForm]);

  const handleChangeEmail = useCallback(() => {
    otpForm.reset();
    setStep("EMAIL");
  }, [otpForm]);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="grid gap-6">
      {step === "EMAIL" ? (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" disabled={isRequestingOTP} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isRequestingOTP}>
              {isRequestingOTP && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request OTP
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
            <div className="text-muted-foreground mb-4 text-center text-sm">
              Sent to{" "}
              <span className="text-foreground font-medium">{otpForm.getValues("email")}</span>
            </div>

            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center">
                  <FormLabel className="sr-only">One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} disabled={isVerifyingOTP} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit" disabled={isVerifyingOTP}>
              {isVerifyingOTP && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Login
            </Button>

            <div className="mt-4 space-y-2">
              {resendTimer > 0 ? (
                <p className="text-muted-foreground text-center text-sm">
                  Resend OTP in {resendTimer}s
                </p>
              ) : (
                <Button
                  variant="link"
                  className="w-full"
                  size="sm"
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isRequestingOTP}
                >
                  {isRequestingOTP && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend OTP
                </Button>
              )}
              <Button
                variant="link"
                className="w-full"
                size="sm"
                type="button"
                onClick={handleChangeEmail}
                disabled={isVerifyingOTP}
              >
                Change Email
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}

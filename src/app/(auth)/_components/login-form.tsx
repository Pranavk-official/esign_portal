"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { authApi } from "@/lib/api/auth"
import { AppError } from "@/lib/errors"
// Schemas
import {
  type OTPRequestForm,
  otpRequestSchema,
  type OTPVerifyForm,
  otpVerifySchema} from "@/lib/schemas/auth"
import { useAuthStore } from "@/lib/stores/auth-store"

type LoginStep = "EMAIL" | "OTP"

export function LoginForm() {
  const [step, setStep] = React.useState<LoginStep>("EMAIL")
  const [email, setEmail] = React.useState<string>("")
  const { setUser } = useAuthStore()

  // Auto-focus OTP input after email submission
  React.useEffect(() => {
    if (step === "OTP") {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        // Find the actual input element inside the OTP component
        const otpInput = document.querySelector('[data-slot="input-otp"] input')
        if (otpInput instanceof HTMLInputElement) {
          otpInput.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [step])

  // --- Form 1: Request OTP ---
  const emailForm = useForm<OTPRequestForm>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: "" },
  })

  // --- Form 2: Verify OTP ---
  // Default values use 'otp' (not otp_code)
  const otpForm = useForm<OTPVerifyForm>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { email: "", otp: "" },
  })

  // --- Mutation 1: Request OTP ---
  const requestOTPMutation = useMutation({
    mutationFn: authApi.requestOTP,
    onSuccess: () => {
      setStep("OTP")
      toast.success("OTP sent to your email")
    },
    // onError handled globally
  })

  function onEmailSubmit(data: OTPRequestForm) {
    setEmail(data.email)
    // Sync email to second form immediately
    otpForm.setValue("email", data.email)
    requestOTPMutation.mutate({ ...data, scope: "LOGIN" })
  }

  // --- Mutation 2: Verify & Login Chain ---
  const verifyOTPMutation = useMutation<
    void,           // Returns nothing (we handle flow manually)
    AppError,       // Error type
    OTPVerifyForm   // Input variables
  >({
    mutationFn: async (variables) => {
      // 1. Verify OTP — backend sets HttpOnly auth cookies AND returns user info.
      const authResponse = await authApi.verifyOTP({ ...variables, scope: 'LOGIN' });

      // 2. Use the user from the verifyOTP response directly (avoids an extra
      //    cross-origin /users/me round-trip before cookies propagate).
      //    Fall back to getMe only if the response didn't include the user.
      const user = authResponse.user ?? await authApi.getMe();

      // 3. Update auth store.
      setUser(user);
    },
    onSuccess: () => {
      const user = useAuthStore.getState().user;
      console.log('[LOGIN] User logged in:', user);
      toast.success("Login successful");

      // 4. Role-based Redirect
      const roles = user?.roles || [];
      console.log('[LOGIN] User roles:', roles);

      // Handle both string roles and object roles (if backend changes)
      const hasRole = (roleName: string) => {
        return roles.some((r: any) => {
          const rName = typeof r === 'string' ? r : r.name;
          return rName.toUpperCase() === roleName.toUpperCase();
        });
      };

      let targetRoute = "/portal";
      if (hasRole('SUPER_ADMIN')) {
        targetRoute = "/admin";
      } else if (hasRole('PORTAL_ADMIN')) {
        targetRoute = "/portal";
      }

      console.log('[LOGIN] Redirecting to:', targetRoute);
      console.log('[LOGIN] About to execute redirect...');

      // Small delay to ensure state is saved, then hard redirect
      setTimeout(() => {
        console.log('[LOGIN] Executing redirect NOW');
        window.location.href = targetRoute;
      }, 100);
    },
    onError: (error) => {
      console.error("Login Failed:", error);
      otpForm.resetField("otp"); // Clear OTP on failure
    },
  })

  function onOtpSubmit(data: OTPVerifyForm) {
    // Use state email as fallback
    const finalEmail = email || otpForm.getValues("email");

    if (!finalEmail) {
      toast.error("Session lost. Please reload.");
      return;
    }

    verifyOTPMutation.mutate({
      email: finalEmail,
      otp: data.otp // Correct field name 'otp'
    })
  }

  return (
    <div className="grid gap-6">
      {step === "EMAIL" ? (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="admin@example.com"
                      disabled={requestOTPMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={requestOTPMutation.isPending}>
              {requestOTPMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Request OTP
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
            <div className="mb-4 text-center text-sm text-muted-foreground">
              Sent to <span className="font-medium text-foreground">{email}</span>
            </div>

            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center">
                  <FormLabel className="sr-only">One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      disabled={verifyOTPMutation.isPending}
                      {...field}
                    >
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
            <Button className="w-full" type="submit" disabled={verifyOTPMutation.isPending}>
              {verifyOTPMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify Login
            </Button>
            <Button
              variant="link"
              className="w-full"
              size="sm"
              type="button"
              onClick={() => setStep("EMAIL")}
              disabled={verifyOTPMutation.isPending}
            >
              Change Email
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}

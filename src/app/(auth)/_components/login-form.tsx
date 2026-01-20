"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

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

// Schemas & Hooks
import {
  otpRequestSchema,
  otpVerifySchema,
  type OTPRequestForm,
  type OTPVerifyForm
} from "@/lib/schemas/auth"

import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

type LoginStep = "EMAIL" | "OTP"

export function LoginForm() {
  const [step, setStep] = React.useState<LoginStep>("EMAIL")
  const [email, setEmail] = React.useState<string>("")
  const { requestOTP, isRequestingOTP, verifyOTP, isVerifyingOTP } = useAuth()

  // --- Form 1: Request OTP ---
  const emailForm = useForm<z.input<typeof otpRequestSchema>>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: "", scope: "LOGIN" },
  })

  // --- Form 2: Verify OTP ---
  const otpForm = useForm<z.input<typeof otpVerifySchema>>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { email: "", otp: "", scope: "LOGIN" },
  })

  const onEmailSubmit = (data: z.output<typeof otpRequestSchema>) => {
    setEmail(data.email)
    otpForm.setValue("email", data.email)
    requestOTP(data, {
      onSuccess: () => setStep("OTP")
    })
  }

  const onOtpSubmit = (data: any) => {
    const finalEmail = email || otpForm.getValues("email")
    if (!finalEmail) {
      toast.error("Session lost. Please reload.")
      return
    }
    verifyOTP({ ...data, email: finalEmail } as OTPVerifyForm)
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
                      disabled={isRequestingOTP}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isRequestingOTP}>
              {isRequestingOTP && (
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
                      disabled={isVerifyingOTP}
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
            <Button className="w-full" type="submit" disabled={isVerifyingOTP}>
              {isVerifyingOTP && (
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
              disabled={isVerifyingOTP}
            >
              Change Email
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { PortalOnboardingRequest } from "@/types/portal"
import { portalOnboardingSchema, type PortalOnboardingSchema } from "@/lib/schemas/portal"
import { useOnboardPortal } from "@/hooks/use-portals"
import { Loader2 } from "lucide-react"

interface OnboardPortalDialogProps {
  children: React.ReactNode
  onSuccess?: (data: PortalOnboardingRequest) => void
}

export function OnboardPortalDialog({ children, onSuccess }: OnboardPortalDialogProps) {
  const [open, setOpen] = useState(false)

  // Use the React Query mutation hook
  const { mutate: onboardPortal, isPending } = useOnboardPortal();

  const form = useForm<PortalOnboardingSchema>({
    resolver: zodResolver(portalOnboardingSchema),
    defaultValues: {
      portal_name: "",
      admin_email: "",
    },
  })

  const onSubmit = (values: PortalOnboardingSchema) => {
    onboardPortal(values, {
      onSuccess: (data) => {
        // Cast response to expected type if necessary, or update prop type
        onSuccess?.(data as unknown as PortalOnboardingRequest);
        setOpen(false);
        form.reset();
      }
    });
  }

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Onboard New Portal</DialogTitle>
          <DialogDescription>
            Create a new portal and assign an initial administrator.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="portal_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HR Department" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="admin_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Onboarding...
                  </>
                ) : (
                  "Onboard Portal"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useOnboardPortal } from "@/hooks/use-portal-mutations";
import type { PortalOnboardingResponseV2 } from "@/lib/schemas/portal";
import type { PortalOnboardingRequest } from "@/lib/schemas/portal";
import { portalOnboardingSchema } from "@/lib/schemas/portal";

interface OnboardPortalDialogProps {
  children: React.ReactNode;
  onSuccess?: (data: PortalOnboardingResponseV2) => void;
}

export function OnboardPortalDialog({ children, onSuccess }: OnboardPortalDialogProps) {
  const [open, setOpen] = useState(false);

  // Use the React Query mutation hook
  const { mutate: onboardPortal, isPending } = useOnboardPortal();

  const form = useForm<PortalOnboardingRequest>({
    resolver: zodResolver(portalOnboardingSchema),
    defaultValues: {
      portal_name: "",
      admin_email: "",
      live_key_limit: null,
    },
  });

  const onSubmit = (values: PortalOnboardingRequest) => {
    // Strip null live_key_limit if not set
    const payload = {
      ...values,
      live_key_limit: values.live_key_limit ?? undefined,
    };
    onboardPortal(payload, {
      onSuccess: (data) => {
        onSuccess?.(data);
        setOpen(false);
        form.reset();
      },
    });
  };

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
            <FormField
              control={form.control}
              name="live_key_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LIVE Key Limit (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Leave blank for unlimited"
                      disabled={isPending}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? null : parseInt(val, 10));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of active LIVE API keys for this portal.
                  </FormDescription>
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
  );
}

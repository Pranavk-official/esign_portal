"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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

const formSchema = z.object({
  portal_name: z.string().min(2, "Portal name must be at least 2 characters"),
  admin_email: z.string().email("Invalid email address"),
})

interface OnboardPortalDialogProps {
  children: React.ReactNode
  onSuccess?: (data: PortalOnboardingRequest) => void
}

export function OnboardPortalDialog({ children, onSuccess }: OnboardPortalDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portal_name: "",
      admin_email: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Here we would typically call the API
    console.log(values)
    onSuccess?.(values)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                    <Input placeholder="e.g. HR Department" {...field} />
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
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Onboard Portal</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

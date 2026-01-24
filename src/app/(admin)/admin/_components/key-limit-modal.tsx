"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Settings } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { usePortalMutations } from "@/hooks/use-portal-mutations";
import type { PortalListResponse } from "@/lib/api/types";
import {
  type PortalKeyLimitFormData,
  portalKeyLimitFormSchema,
} from "@/lib/schemas/portal";

interface KeyLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portal: PortalListResponse | null;
}

export function KeyLimitModal({ open, onOpenChange, portal }: KeyLimitModalProps) {
  const { updateKeyLimits } = usePortalMutations();

  const form = useForm<PortalKeyLimitFormData>({
    resolver: zodResolver(portalKeyLimitFormSchema),
    defaultValues: {
      max_keys: (portal?.max_keys || portal?.live_key_limit)?.toString() || "",
    },
  });

  useEffect(() => {
    if (portal) {
      form.reset({
        max_keys: (portal.max_keys || portal.live_key_limit)?.toString() || "",
      });
    }
  }, [portal, form]);

  const onSubmit = async (data: PortalKeyLimitFormData) => {
    if (!portal) return;

    const transformedData = {
      max_keys: data.max_keys ? parseInt(data.max_keys, 10) : null,
    };

    await updateKeyLimits.mutateAsync({
      portalId: portal.portal_id,
      data: transformedData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Update API Key Limit
          </DialogTitle>
          <DialogDescription>
            Set the maximum number of LIVE API keys for {portal?.name}. Set to 0 for unlimited.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="max_keys"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum LIVE API Keys</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0 for unlimited"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? null : parseInt(val));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Current: {portal?.max_keys || portal?.live_key_limit || "Unlimited"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateKeyLimits.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateKeyLimits.isPending}>
                {updateKeyLimits.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Limit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

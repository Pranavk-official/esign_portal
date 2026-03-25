"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserDetailResponse, UserRole } from "@/lib/schemas/user";
import { type UserCreateRequest, userCreateSchema } from "@/lib/schemas/user";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserDetailResponse | null;
  mode: "create" | "edit";
  onSubmit: (data: UserCreateRequest) => Promise<void>;
  isLoading?: boolean;
  availableRoles?: UserRole[];
  portalOptions?: Array<{ id: string; name: string }>;
  showPortalField?: boolean;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  mode,
  onSubmit,
  isLoading = false,
  availableRoles = [],
  portalOptions = [],
  showPortalField = true,
}: UserFormDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const form = useForm<UserCreateRequest>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: "",
      portal_id: null,
      role_names: [],
      send_otp: true,
    },
  });

  // Reset form when user changes or dialog opens
  useEffect(() => {
    if (open) {
      if (user && mode === "edit") {
        const roleNames = user.role_names || [];
        form.reset({
          email: user.email,
          portal_id: user.portal_id,
          role_names: roleNames,
          send_otp: false,
        });
        // Use setTimeout to defer state update to next tick
        setTimeout(() => setSelectedRoles(roleNames), 0);
      } else {
        form.reset({
          email: "",
          portal_id: null,
          role_names: [],
          send_otp: true,
        });
        setTimeout(() => setSelectedRoles([]), 0);
      }
    }
  }, [open, user, mode, form]);

  const handleSubmit = async (data: UserCreateRequest) => {
    await onSubmit(data);
    form.reset();
    setSelectedRoles([]);
  };

  const addRole = (roleName: string) => {
    if (!selectedRoles.includes(roleName)) {
      const newRoles = [...selectedRoles, roleName];
      setSelectedRoles(newRoles);
      form.setValue("role_names", newRoles);
    }
  };

  const removeRole = (roleName: string) => {
    const newRoles = selectedRoles.filter((r) => r !== roleName);
    setSelectedRoles(newRoles);
    form.setValue("role_names", newRoles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new user to the system. An OTP will be sent to their email."
              : "Update user information and roles."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} disabled={mode === "edit"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showPortalField && (
              <FormField
                control={form.control}
                name="portal_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portal (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a portal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Portal</SelectItem>
                        {portalOptions.map((portal) => (
                          <SelectItem key={portal.id} value={portal.id}>
                            {portal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Assign user to a specific portal or leave as super admin
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="role_names"
              render={() => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <Select onValueChange={addRole}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select roles" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles
                        .filter((role) => !selectedRoles.includes(role.name))
                        .map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedRoles.map((roleName) => (
                      <Badge key={roleName} variant="secondary">
                        {roleName}
                        <button
                          type="button"
                          onClick={() => removeRole(roleName)}
                          className="hover:text-destructive ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "create" && (
              <FormField
                control={form.control}
                name="send_otp"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Send OTP to user</FormLabel>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create User" : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { useGenerateApiKey } from "@/hooks/use-api-keys";
import { type ApiKeyGenerateRequest, apiKeyGenerateSchema } from "@/lib/schemas/api-key";

export function GenerateKeyDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { mutate: generateKey, isPending } = useGenerateApiKey();

  const form = useForm<ApiKeyGenerateRequest>({
    resolver: zodResolver(apiKeyGenerateSchema),
    defaultValues: {
      key_name: "",
      environment: "TEST",
      callback_url: "",
      max_txn_count: 1000,
    },
  });

  const onSubmit = (values: ApiKeyGenerateRequest) => {
    generateKey(
      {
        key_name: values.key_name,
        environment: values.environment,
        callback_url: values.callback_url || "",
        max_txn_count: values.max_txn_count,
      },
      {
        onSuccess: (data) => {
          setGeneratedKey(data.api_key);
          toast.success("API Key generated successfully");
        },
      }
    );
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setGeneratedKey(null);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {!generatedKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Generate API Key</DialogTitle>
              <DialogDescription>Create a new API key for your application.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="key_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Production Billing"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TEST">Test (Sandbox)</SelectItem>
                          <SelectItem value="LIVE">Live (Production)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_txn_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Transaction Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 1000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="callback_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Callback URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://api.myapp.com/callback"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Key
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>API Key Generated</DialogTitle>
              <DialogDescription className="font-semibold text-red-500">
                IMPORTANT: Copy this key now. It will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex items-center gap-2 rounded-md bg-gray-100 p-3">
              <code className="flex-1 font-mono text-xs break-all">{generatedKey}</code>
              <Button size="icon" variant="ghost" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={() => setOpen(false)} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

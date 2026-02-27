"use client";

import { AlertCircle, LogIn, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  // Check for auth errors by message content since instanceof might be flaky across boundaries
  const isAuthError =
    error.message.includes("Unauthorized") ||
    error.message.includes("Forbidden") ||
    error.message.includes("Session expired");

  return (
    <div className="flex h-[80vh] w-full items-center justify-center p-4">
      <Card className="border-destructive/50 w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {isAuthError
              ? "Your session has expired or you do not have permission to access this resource."
              : error.message || "An unexpected system error occurred."}
          </p>

          <div className="flex gap-2">
            <Button onClick={() => reset()} variant="default" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            {isAuthError && (
              <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Log In
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

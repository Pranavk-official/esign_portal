'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Global Error Caught:', error);
  }, [error]);

  // Check for auth errors by message content since instanceof might be flaky across boundaries
  const isAuthError = 
    error.message.includes('Unauthorized') || 
    error.message.includes('Forbidden') ||
    error.message.includes('Session expired');

  return (
    <div className="flex h-[80vh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
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
               <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
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

"use client";

import { ArrowLeft, FileQuestion, Home } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className="bg-muted rounded-full p-6">
          <FileQuestion className="text-muted-foreground h-16 w-16" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-muted-foreground text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Please check the
            URL or return to the admin dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="default">
            <Link href="/admin">
              <Home className="mr-2 h-4 w-4" />
              Go to Admin Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" onClick={() => window.history.back()}>
            <a>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

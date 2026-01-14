"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, LogIn, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center gap-6 text-center w-full max-w-md">
            {/* Icon */}
            <div className="rounded-full bg-muted p-6">
                <FileQuestion className="h-16 w-16 text-muted-foreground" />
            </div>

            {/* Text Content */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">404</h1>
                <h2 className="text-2xl font-semibold text-muted-foreground">
                    Page Not Found
                </h2>
                <p className="max-w-md text-sm text-muted-foreground">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Please return to the login page.
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row w-full">
                <Button asChild variant="default" className="flex-1">
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Go to Login
                    </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1" onClick={() => window.history.back()}>
                    <a>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </a>
                </Button>
            </div>
        </div>
    );
}

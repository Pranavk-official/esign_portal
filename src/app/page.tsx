"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUser } from "@/hooks/use-auth";
import { getRedirectPath } from "@/lib/auth/roles";

export default function Home() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    router.replace(getRedirectPath(user));
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    </div>
  );
}

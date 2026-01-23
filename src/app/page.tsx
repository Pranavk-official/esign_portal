"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getRedirectPathForUser } from "@/lib/auth-utils";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Redirect based on user role
    const redirectPath = getRedirectPathForUser(user);
    router.replace(redirectPath);
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    </div>
  );
}

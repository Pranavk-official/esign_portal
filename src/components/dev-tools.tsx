"use client"

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";

export function DevTools() {
  const [mounted, setMounted] = useState(false);
  const { user, setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (process.env.NODE_ENV !== "development") return null;

  const currentRole = user?.roles[0] || "NONE";

  const handleRoleChange = (role: string) => {
    if (!user) {
        // If logged out, log in as dev user with that role
        setUser({
            id: 'dev-user',
            email: 'dev@example.com',
            portal_id: 'dev-portal',
            is_active: true,
            roles: [role]
        });
    } else {
        setUser({
            ...user,
            roles: [role],
        });
    }
    
    // Force reload to trigger redirects
    window.location.href = "/";
  };

  const handleLogout = () => {
      clearAuth();
      window.location.href = "/";
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-background border rounded-lg shadow-lg flex flex-col gap-2 w-64">
      <h3 className="font-bold text-xs uppercase text-muted-foreground">Dev Tools</h3>
      <div className="text-xs mb-2">Current Role: <span className="font-mono font-bold">{currentRole}</span></div>
      
      <div className="grid grid-cols-1 gap-2">
        <Button variant="outline" size="sm" onClick={() => handleRoleChange("SUPER_ADMIN")}>
          Switch to Super Admin
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleRoleChange("PORTAL_ADMIN")}>
          Switch to Portal Admin
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleRoleChange("USER")}>
          Switch to User
        </Button>
        <Button variant="destructive" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}

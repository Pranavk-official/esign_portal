import { SidebarProvider } from "@/components/ui/sidebar";

import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";
import { SuperAdminGuard } from "./_components/super-admin-guard";

/**
 * Admin group layout
 *
 * All routes under /admin are wrapped in SuperAdminGuard which:
 *  - Hydrates the auth store if needed (calls /users/me once)
 *  - Verifies the user holds the SUPER_ADMIN role
 *  - Redirects non-super-admins to /portal
 *
 * This is the *client-side* enforcement layer. The backend independently
 * enforces the same rules via `Depends(get_super_admin_user)` on every
 * protected endpoint.
 */
export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminGuard>
      <div className="bg-background min-h-screen flex">
        <SidebarProvider defaultOpen={false}>
          <AdminSidebar />
          <div className="flex min-h-screen w-full flex-col">
            <AdminHeader />
            <main className="m-2 mt-0 flex-1 rounded-md border border-indigo-200 bg-card/40 backdrop-blur-sm p-4 transition-all duration-300 hover:border-indigo-300">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </div>
    </SuperAdminGuard>
  );
}

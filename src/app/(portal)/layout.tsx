import { SidebarProvider } from "@/components/ui/sidebar";

import { PortalHeader } from "./_components/portal-header";
import { PortalRoleGuard } from "./_components/portal-role-guard";
import { PortalSidebar } from "./_components/portal-sidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalRoleGuard>
      <div className="bg-background min-h-screen flex">
        <SidebarProvider defaultOpen={false}>
          <PortalSidebar />
          <div className="flex min-h-screen w-full flex-col">
            <PortalHeader />
            <main className="m-2 mt-0 flex-1 rounded-md border border-zinc-300 p-4">{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </PortalRoleGuard>
  );
}

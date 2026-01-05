import { SidebarProvider } from "@/components/ui/sidebar";
import { PortalSidebar } from "./_components/portal-sidebar";
import { PortalHeader } from "./_components/portal-header";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <body className="bg-background min-h-screen">
      <SidebarProvider defaultOpen={false}>
        <PortalSidebar />
        <div className="flex min-h-screen w-full flex-col">
          <PortalHeader />
          <main className="m-4 mt-0 flex-1 rounded-md border p-4">{children}</main>
        </div>
      </SidebarProvider>
    </body>
  );
}

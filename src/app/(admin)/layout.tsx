import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminHeader } from "./_components/admin-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <body className="bg-background min-h-screen">
            <SidebarProvider defaultOpen={false}>
                <AdminSidebar />
                <div className="flex min-h-screen w-full flex-col">
                    <AdminHeader />
                    <main className="m-2 mt-0 flex-1 rounded-md border border-zinc-300 p-4">{children}</main>
                </div>
            </SidebarProvider>
        </body>
    );
}

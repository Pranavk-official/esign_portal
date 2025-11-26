export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b mb-4">
        <h1 className="font-bold">PortalLayout Header</h1>
      </div>
      <main className="p-4">
        {children}
      </main>
    </div>
  );
}

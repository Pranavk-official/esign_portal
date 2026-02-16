export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-zinc-900 hidden flex-col justify-between p-10 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-medium">
          <div className="h-6 w-6 rounded bg-white/20" />
          ASP eSign Gateway
        </div>
        <div>
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Secure, automated, and scalable digital signature management for the
              enterprise.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">{children}</div>
    </div>
  );
}

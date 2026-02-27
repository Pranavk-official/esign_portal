export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col bg-zinc-900 text-white p-10 justify-between">
                <div className="flex items-center gap-2 text-lg font-medium">
                    <div className="h-6 w-6 rounded bg-white/20" />
                    ASP eSign Gateway
                </div>
                <div>
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Secure, automated, and scalable digital signature management for the enterprise.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>
            <div className="flex items-center justify-center py-12 px-6">
                {children}
            </div>
        </div>
    )
}

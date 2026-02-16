import { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = {
  title: "Login | ASP eSign Gateway",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] filter" />
      <div className="absolute top-[40%] right-[10%] h-[400px] w-[400px] rounded-full bg-secondary/30 blur-[100px] filter" />
      <div className="absolute bottom-[10%] left-[20%] h-[300px] w-[300px] rounded-full bg-accent/20 blur-[80px] filter" />

      <div className="relative z-10 w-full max-w-[420px] px-4 space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90 font-heading">ASP eSign Gateway</h1>
          <p className="text-muted-foreground">Secure & Seamless Digital Signing</p>
        </div>

        <Card className="glass-card border-white/10 dark:border-white/5 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription>Enter your email to sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} KSITM. All rights reserved.
        </p>
      </div>
    </div>
  );
}

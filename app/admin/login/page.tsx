import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Staff Sign In",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--tint)] px-6 py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Section } from "@/components/ui";
import ClientLoginForm from "@/components/portal/ClientLoginForm";

export const metadata: Metadata = {
  title: "Client Log In",
  description: "Log in to your Ozmo client dashboard.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Section backdrop="both">
      <Suspense fallback={<h1 className="text-[clamp(30px,4vw,38px)]">Log in to Ozmo</h1>}>
        <ClientLoginForm />
      </Suspense>
    </Section>
  );
}

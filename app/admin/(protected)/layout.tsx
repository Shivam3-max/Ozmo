import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import Shell from "@/components/admin/Shell";

export const metadata: Metadata = {
  title: "Ozmo Practice",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware checks too; this is the layer that actually gates rendering.
  const user = await requireStaff();
  return <Shell user={{ name: user.name, role: user.role }}>{children}</Shell>;
}

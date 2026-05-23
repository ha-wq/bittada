"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (pathname === "/admin/kirish") return;
    if (!user) {
      router.push("/admin/kirish");
    } else if (user.role === "STUDENT") {
      router.push("/dashboard");
    }
  }, [user, loading, pathname, router]);

  if (pathname === "/admin/kirish") return <>{children}</>;
  if (loading || !user || user.role === "STUDENT") return null;

  return <>{children}</>;
}

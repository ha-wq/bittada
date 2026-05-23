"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AdminIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/admin/kirish");
    else if (user.role === "STUDENT") router.replace("/dashboard");
    else if (user.role === "SUPER_ADMIN") router.replace("/admin/super");
    else router.replace("/admin/universitet");
  }, [user, loading, router]);

  return null;
}

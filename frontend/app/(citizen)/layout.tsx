"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GovPageShell from "@/components/layout/GovPageShell";
import { isAuthenticated, clearAuth } from "@/lib/streaming";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  const logout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <GovPageShell variant="citizen" onLogout={logout}>
      <main>{children}</main>
    </GovPageShell>
  );
}

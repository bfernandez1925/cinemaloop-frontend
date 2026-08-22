"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Bloquea el acceso a pantallas de juego sin sesión (spec-auth.md). Es
 * export estático sin servidor (ADR-0007): la comprobación solo puede
 * hacerse en el cliente, después de hidratar — por eso no renderiza el
 * contenido protegido hasta que Firebase Auth confirma el estado real.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-text-secondary text-sm">Cargando…</p>
      </main>
    );
  }

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}

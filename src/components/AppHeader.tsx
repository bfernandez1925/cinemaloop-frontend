"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ICONS } from "@/design/icons";
import { useAuth } from "@/lib/auth/AuthProvider";
import { auth } from "@/lib/firebase";

/** Cabecera persistente (logo + nombre) en todas las pantallas ya
 * autenticadas — pedido explícito del propietario, sin frame de
 * handoff detrás (cada pantalla del handoff solo lleva su propio
 * título/botón de volver). Vive dentro de RequireAuth para no tener que
 * repetirla pantalla por pantalla.
 *
 * También muestra el usuario logueado y cerrar sesión (CIN-59, pedido
 * aparte). Tras confirmar, RequireAuth ya redirige a "/" en cuanto
 * onAuthStateChanged confirma user === null — no hace falta un
 * router.push manual aquí. */
export function AppHeader() {
  const { user } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const LogoutIcon = ICONS.logout;

  async function handleLogout() {
    setLoggingOut(true);
    await signOut(auth);
  }

  return (
    <header className="border-border flex items-center justify-between border-b px-4 py-3 lg:px-20 lg:py-4">
      <Link href="/inicio" className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- asset final del handoff, no un placeholder de TMDb */}
        <img src="/cinemaloop-logo.png" alt="" className="h-7 w-7 lg:h-8 lg:w-8" />
        <span className="font-display text-lg font-medium text-text-primary lg:text-xl">
          CinemaLoop
        </span>
      </Link>

      {user && (
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[140px] truncate text-sm text-text-secondary sm:inline lg:max-w-[220px]">
            {user.displayName ?? "Jugador"}
          </span>
          <button
            type="button"
            aria-label="Cerrar sesión"
            onClick={() => setConfirmingLogout(true)}
            className="border-border bg-surface flex h-8 w-8 items-center justify-center rounded-control border lg:h-9 lg:w-9"
          >
            <LogoutIcon className="text-text-secondary h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      )}

      {confirmingLogout && (
        <ConfirmDialog
          title="¿Cerrar sesión?"
          description="Volverás a la pantalla de inicio y tendrás que iniciar sesión de nuevo para jugar."
          confirmLabel="Cerrar sesión"
          confirming={loggingOut}
          onConfirm={() => void handleLogout()}
          onClose={() => setConfirmingLogout(false)}
        />
      )}
    </header>
  );
}

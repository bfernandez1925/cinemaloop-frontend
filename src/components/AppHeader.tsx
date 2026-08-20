import Link from "next/link";

/** Cabecera persistente (logo + nombre) en todas las pantallas ya
 * autenticadas — pedido explícito del propietario, sin frame de
 * handoff detrás (cada pantalla del handoff solo lleva su propio
 * título/botón de volver). Vive dentro de RequireAuth para no tener que
 * repetirla pantalla por pantalla. */
export function AppHeader() {
  return (
    <header className="border-border flex items-center border-b px-4 py-3 lg:px-20 lg:py-4">
      <Link href="/inicio" className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- asset final del handoff, no un placeholder de TMDb */}
        <img src="/cinemaloop-logo.png" alt="" className="h-7 w-7 lg:h-8 lg:w-8" />
        <span className="font-display text-lg font-medium text-text-primary lg:text-xl">
          CinemaLoop
        </span>
      </Link>
    </header>
  );
}

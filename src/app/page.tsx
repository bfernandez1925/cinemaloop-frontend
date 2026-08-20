import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="font-display text-2xl font-medium">Cinemaloop</h1>
      <p className="max-w-md text-sm text-text-secondary">
        Proyecto en construcción. La interfaz de juego se implementa siguiendo el backlog en Linear
        y las specs de <code>cinemaloop-specs</code>.
      </p>
      {/* Provisional: la pantalla Landing/Login (CIN-15) sustituirá esta
          home y enlazará a /modos tras el login. */}
      <Link href="/modos" className="text-orange mt-2 text-sm font-semibold underline">
        Jugar
      </Link>
    </main>
  );
}

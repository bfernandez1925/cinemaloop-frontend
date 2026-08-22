// Único caso circular de todo el sistema (spec-frontend-ux.md: "foto de
// actor... nunca circular, salvo el avatar del ranking que sí es
// circular"). getLeaderboard no devuelve ninguna foto de perfil — solo
// nombre_usuario — así que se muestra la inicial en vez de una imagen.
export function Avatar({ nombre, size }: { nombre: string | null; size: number }) {
  const initial = (nombre?.trim()[0] ?? "?").toUpperCase();

  return (
    <div
      className="bg-surface-elevated border-border flex shrink-0 items-center justify-center rounded-full border"
      style={{ width: size, height: size }}
    >
      <span className="font-display text-text-secondary" style={{ fontSize: size * 0.4 }}>
        {initial}
      </span>
    </div>
  );
}

// Circunferencia real del trazado (r=42 en un viewBox 96×96, ver el SVG
// más abajo) — coincide con las "264 unidades" que documenta la spec y
// con el valor literal usado en el handoff (stroke-dasharray="264").
const CIRCUMFERENCE = 264;
// Último 30% del turno: el anillo pasa de violeta a naranja (spec-frontend-ux.md).
const URGENT_THRESHOLD = 0.3;

type TimerRingProps = {
  /** Segundos que quedan del turno, calculados por quien use el componente
   * a partir del límite y el instante de inicio que devuelve el servidor
   * (ver spec-game-engine.md) — nunca un contador propio: este componente
   * no tiene ningún temporizador interno, solo pinta lo que recibe. */
  remainingSeconds: number;
  /** Límite total del turno en segundos (25s en modo Clásico, ver
   * TURN_TIME_LIMIT_SECONDS en cinemaloop-backend). */
  totalSeconds: number;
};

export function TimerRing({ remainingSeconds, totalSeconds }: TimerRingProps) {
  const fraction = totalSeconds > 0 ? Math.min(1, Math.max(0, remainingSeconds / totalSeconds)) : 0;
  const isUrgent = fraction <= URGENT_THRESHOLD;
  const dashoffset = CIRCUMFERENCE * (1 - fraction);
  const displaySeconds = Math.max(0, Math.ceil(remainingSeconds));
  const colorClass = isUrgent ? "text-orange" : "text-violet";

  return (
    <div
      role="timer"
      aria-label={`${displaySeconds} segundos restantes`}
      className="relative h-20 w-20 lg:h-[110px] lg:w-[110px]"
    >
      <svg viewBox="0 0 96 96" className="-rotate-90" width="100%" height="100%">
        <circle
          cx="48"
          cy="48"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth={7}
          className="text-divider"
        />
        <circle
          cx="48"
          cy="48"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashoffset}
          className={`cl-timer-progress ${colorClass}`}
        />
      </svg>
      <div
        aria-hidden="true"
        className={`font-display text-timer-number lg:text-timer-number-lg absolute inset-0 flex items-center justify-center ${colorClass}`}
      >
        {displaySeconds}
      </div>
    </div>
  );
}

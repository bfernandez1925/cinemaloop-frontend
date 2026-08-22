import Link from "next/link";
import { ICONS } from "@/design/icons";

export function BackButton({ href }: { href: string }) {
  const ChevronLeft = ICONS.back;

  return (
    <Link
      href={href}
      aria-label="Volver"
      className="border-border bg-surface text-text-primary flex h-9 w-9 items-center justify-center rounded-[10px] border lg:h-10 lg:w-10"
    >
      <ChevronLeft className="h-4 w-4 lg:h-[18px] lg:w-[18px]" strokeWidth={1.8} />
    </Link>
  );
}

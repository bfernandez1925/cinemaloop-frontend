import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";
import { ModeGrid } from "@/components/ModeGrid";
import { RequireAuth } from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Elige tu modo — Cinemaloop",
};

export default function ModeSelectPage() {
  return (
    <RequireAuth>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pt-2 pb-10 lg:px-20 lg:py-10">
        <div className="mb-6 flex items-center gap-[14px] lg:mb-10 lg:gap-4">
          <BackButton href="/" />
          <h2 className="font-display text-screen-title lg:text-screen-title-lg text-text-primary">
            Elige tu modo
          </h2>
        </div>

        <ModeGrid />
      </main>
    </RequireAuth>
  );
}

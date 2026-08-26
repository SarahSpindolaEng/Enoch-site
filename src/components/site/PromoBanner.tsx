import { Link } from "react-router-dom";
import { ArrowRight, Timer } from "lucide-react";

export function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-[linear-gradient(120deg,color-mix(in_oklab,var(--primary)_18%,var(--surface)),var(--surface)_60%)] px-6 py-6 sm:px-8">
      <div className="pointer-events-none absolute -right-10 -top-16 size-56 animate-pulse rounded-full bg-primary/25 blur-3xl [animation-duration:4s]" />
      <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Timer className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Semana Enoch
            </p>
            <p className="mt-1 text-sm text-foreground/90 sm:text-base">
              Até <strong className="font-semibold text-foreground">30% OFF</strong>{" "}
              em fones selecionados — por tempo limitado.
            </p>
          </div>
        </div>
        <Link
          to="/produtos?categoria=Áudio"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_32px_-8px_var(--primary)]"
        >
          Aproveitar
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

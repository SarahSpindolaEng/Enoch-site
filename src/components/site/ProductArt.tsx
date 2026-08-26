import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ilustração de produto em SVG/ícone puro — usada como placeholder visual
 * até termos fotografia real dos produtos. Sem dependência de imagens
 * externas, mantém o visual "clean tech" consistente em qualquer tela.
 */
export function ProductArt({
  Icon,
  tone = "default",
  className,
}: {
  Icon: LucideIcon;
  tone?: "default" | "bright";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden",
        tone === "bright"
          ? "bg-[radial-gradient(120%_100%_at_50%_0%,color-mix(in_oklab,var(--primary)_32%,transparent),var(--background)_65%)]"
          : "bg-[linear-gradient(160deg,var(--surface),var(--background))]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.15] [mask-image:radial-gradient(65%_65%_at_50%_45%,black,transparent)]" />
      <div className="absolute size-2/3 rounded-full bg-primary/25 blur-3xl" />
      <Icon
        className="relative size-[38%] text-foreground/90 drop-shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
        strokeWidth={1.1}
      />
    </div>
  );
}

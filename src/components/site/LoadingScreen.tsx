import { EnochMark } from "@/components/site/EnochLogo";

/** Tela de carregamento cheia — usada como fallback do Suspense (ex: painel
 * admin carregando) e em qualquer lugar que precise de um loading de tela
 * inteira com a cara da marca, em vez de uma tela em branco. */
export function LoadingScreen() {
  return (
    <div className="relative grid min-h-screen place-items-center bg-background">
      <div className="pointer-events-none absolute inset-0 hero-glow opacity-50" />
      <div className="relative flex flex-col items-center gap-4">
        <EnochMark className="h-10 animate-pulse" />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

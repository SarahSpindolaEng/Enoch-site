import { cn } from "@/lib/utils";
import logoFull from "@/assets/logo-full.webp";
import logoMark from "@/assets/logo-mark.webp";

/**
 * Logo oficial da Enoch Tech, enviada pela cliente (arquivo com fundo
 * transparente). Renderizada como <img>, então mantém sempre a proporção
 * original — nunca fica esticada, independente do tamanho definido via
 * className (ex: h-9, h-10, h-14...). A imagem já vem embutida em base64
 * no bundle (ver assetsInlineLimit em vite.config.ts), então funciona
 * tanto local quanto no artifact publicado, sem depender de rede externa.
 */
export function EnochLogo({ className }: { className?: string }) {
  return (
    <img
      src={logoFull}
      alt="Enoch Tech"
      className={cn("h-9 w-auto object-contain", className)}
    />
  );
}

/** Versão compacta (só o símbolo) — usada em telas de login, avatares, loaders. */
export function EnochMark({ className }: { className?: string }) {
  return (
    <img
      src={logoMark}
      alt="Enoch Tech"
      className={cn("h-6 w-auto object-contain", className)}
    />
  );
}

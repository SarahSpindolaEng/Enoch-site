import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { EnochMark } from "@/components/site/EnochLogo";

export function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <div className="pointer-events-none absolute inset-0 hero-glow opacity-60" />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30 [mask-image:radial-gradient(60%_50%_at_50%_40%,black,transparent)]" />

      <Reveal className="relative flex max-w-md flex-col items-center text-center">
        <EnochMark className="h-10" />

        <span className="mt-8 grid size-14 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <Compass className="size-6" />
        </span>

        <h1 className="mt-6 text-balance text-3xl font-bold sm:text-4xl">
          Essa página saiu do mapa.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          O link pode estar errado ou a página foi movida. Vamos te levar de volta pra onde tem
          coisa de verdade pra ver.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_40px_-10px_var(--primary)]"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Voltar para a home
          </Link>
          <Link
            to="/produtos"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary"
          >
            Ver catálogo
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

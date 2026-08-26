import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Truck, Undo2 } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { EnochMark } from "@/components/site/EnochLogo";
import { products } from "@/lib/products";
import homeSquare from "@/assets/home-square.webp";

const valores = [
  {
    Icon: BadgeCheck,
    title: "Curadoria de verdade",
    text: "Testamos e selecionamos só os eletrônicos que valem o preço — de marcas parceiras confiáveis.",
  },
  {
    Icon: Undo2,
    title: "Garantia e trocas",
    text: "Cobertura total pelo prazo do fabricante, suporte humano e troca sem burocracia.",
  },
  {
    Icon: Truck,
    title: "Entrega expressa",
    text: "Frete grátis para todo o Brasil em pedidos acima de R$ 499.",
  },
];

export function Home() {
  const destaques = products;

  return (
    <div>
      {/* Hero — mais compacto: a loja precisa aparecer rápido, não só o hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hero-glow" />
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-6 pt-28 sm:px-8 lg:pb-8 lg:pt-36">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-8">
            <Reveal className="min-w-0">
              <h1 className="text-balance text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
                Curadoria de verdade.
                <br />
                Tecnologia que <span className="text-gradient">vale o preço</span>.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                Curadoria de eletrônicos premium: selecionamos as melhores marcas
                do mercado para você não precisar escolher errado.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/produtos"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_44px_-10px_var(--primary)]"
                >
                  Explorar produtos
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="mt-12 border-t border-border" />
            </Reveal>

            <Reveal delay={120} className="min-w-0">
              <div className="h-full w-full overflow-hidden rounded-3xl">
                <img
                  src={homeSquare}
                  alt="Enoch Tech — tecnologia que move o seu mundo"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:pb-20 lg:pt-10">
        <Reveal className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Coleção</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Nosso catálogo</h2>
          </div>
          <Link
            to="/produtos"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Ver tudo
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destaques.map((product, i) => (
            <Reveal key={product.slug} delay={(i % 3) * 80}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Institucional */}
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <Reveal className="min-w-0">
              <EnochMark className="h-16 w-auto drop-shadow-[0_0_40px_oklch(0.58_0.216_262/0.55)]" />
              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-primary">A marca</p>
              <h2 className="mt-3 text-balance text-3xl font-bold leading-tight sm:text-4xl">
                Menos escolhas ruins. Mais curadoria.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                A Enoch Tech nasceu de uma ideia simples: com tanta opção de
                eletrônico por aí, alguém precisa filtrar o que realmente vale a
                pena. Selecionamos e revendemos só os produtos que passariam no
                nosso próprio teste de compra.
              </p>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-3 lg:gap-5">
              {valores.map(({ Icon, title, text }, i) => (
                <Reveal key={title} delay={i * 90}>
                  <div className="group h-full rounded-2xl border border-border bg-background p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-[0_0_26px_-6px_var(--primary)]">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-base font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-16 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 hero-glow" />
            <div className="relative mx-auto max-w-xl">
              <h2 className="text-balance text-3xl font-bold sm:text-4xl">
                Pronto para ouvir a diferença?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Troca garantida em até 30 dias em toda a nossa curadoria de áudio.
              </p>
              <Link
                to="/produtos"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_44px_-10px_var(--primary)]"
              >
                Ver catálogo completo
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

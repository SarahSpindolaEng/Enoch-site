import {
  BadgeCheck,
  Handshake,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Tag,
  Trophy,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { EnochMark } from "@/components/site/EnochLogo";
import sobreBanner from "@/assets/sobre-banner.webp";

const valores = [
  {
    Icon: BadgeCheck,
    title: "Qualidade",
    text: "Oferecer produtos de qualidade e buscar sempre o melhor para nossos clientes.",
  },
  {
    Icon: Tag,
    title: "Preço justo",
    text: "Trabalhar com preços competitivos e acessíveis, entregando o melhor custo-benefício.",
  },
  {
    Icon: HeartHandshake,
    title: "Honestidade",
    text: "Manter relações transparentes e verdadeiras com clientes e parceiros.",
  },
  {
    Icon: ShieldCheck,
    title: "Confiança",
    text: "Construir uma marca em que nossos clientes possam confiar.",
  },
  {
    Icon: Users,
    title: "Respeito",
    text: "Valorizar cada cliente, parceiro e colaborador.",
  },
  {
    Icon: Handshake,
    title: "Compromisso",
    text: "Fazer o nosso melhor para cumprir aquilo que prometemos.",
  },
  {
    Icon: Lightbulb,
    title: "Inovação",
    text: "Buscar constantemente novos produtos e tecnologias para acompanhar as necessidades do mercado.",
  },
  {
    Icon: Trophy,
    title: "Excelência",
    text: "Trabalhar todos os dias para melhorar nossos produtos, serviços e atendimento.",
  },
];

export function Sobre() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 hero-glow opacity-70" />

      <section className="relative mx-auto max-w-7xl px-5 pt-32 sm:px-8 lg:pt-44">
        <Reveal className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Sobre nós</p>
          <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
            Qualidade, tecnologia e preço justo para você.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A Enoch Tech foi criada em 2025 por Luciano e Djanir, com o
            propósito de levar aos nossos clientes produtos de qualidade,
            tecnologia e inovação com preço justo. Somos uma revendedora
            especializada em eletrônicos — não fabricamos os produtos, mas
            testamos e escolhemos a dedo o que vale a pena, de marcas
            parceiras que confiamos.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-6">
          <img
            src={sobreBanner}
            alt="Enoch Tech — tecnologia que conecta o futuro"
            className="w-full"
          />
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Missão</p>
          <h2 className="mt-3 text-balance text-3xl font-bold leading-tight sm:text-4xl">
            Uma experiência de compra com confiança, transparência e bom
            atendimento.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Nossa missão é oferecer produtos que realmente agreguem valor à
            vida das pessoas, proporcionando uma experiência de compra com
            confiança, transparência, qualidade e bom atendimento.
            Trabalhamos para crescer junto com nossos clientes, sempre
            buscando as melhores oportunidades e novidades do mercado.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <Reveal className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Valores</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">O que guia a Enoch Tech</h2>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {valores.map(({ Icon, title, text }, i) => (
              <Reveal key={title} delay={(i % 4) * 80}>
                <div className="group h-full rounded-2xl border border-border bg-background p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-[0_0_26px_-6px_var(--primary)]">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 lg:py-20">
        <Reveal>
          <p className="mx-auto max-w-xl text-balance text-lg font-semibold sm:text-xl">
            <EnochMark className="mb-3 inline-block h-7 w-auto" />
            <br />
            Enoch Tech — Qualidade, tecnologia e preço justo para você.
          </p>
        </Reveal>
      </section>
    </div>
  );
}

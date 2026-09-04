import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const canais = [
  {
    Icon: Mail,
    title: "E-mail",
    value: "Lucianoenochtech@gmail.com",
    href: "mailto:Lucianoenochtech@gmail.com",
  },
  {
    Icon: MessageCircle,
    title: "WhatsApp",
    value: "(62) 9314-5116",
    href: "https://wa.me/556293145116",
  },
  {
    Icon: Instagram,
    title: "Instagram",
    value: "@Enoch.Tech_",
    href: "https://instagram.com/Enoch.Tech_",
  },
];

export function Contato() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 hero-glow opacity-70" />

      <section className="relative mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8 lg:pt-44">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Contato</p>
          <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.08] sm:text-5xl">
            Vamos conversar.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Dúvidas sobre um produto, garantia ou parcerias — respondemos em até
            1 dia útil pelo WhatsApp, e-mail ou Instagram.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Atendimento: segunda a sexta, das 8h às 18h.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-10 space-y-4">
          {canais.map(({ Icon, title, value, href }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary transition-all duration-300 group-hover:bg-primary/20">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="truncate text-sm text-muted-foreground">{value}</p>
              </div>
            </a>
          ))}
        </Reveal>
      </section>
    </div>
  );
}

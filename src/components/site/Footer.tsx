import { Link } from "react-router-dom";
import { Instagram, MessageCircle } from "lucide-react";
import { EnochMark } from "@/components/site/EnochLogo";

const columns = [
  {
    title: "Loja",
    links: [
      { label: "Todos os produtos", to: "/produtos" },
      { label: "Áudio", to: "/produtos" },
      { label: "Vestíveis", to: "/produtos" },
      { label: "Acessórios", to: "/produtos" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", to: "/sobre" },
      { label: "Contato", to: "/contato" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar / cadastrar", to: "/login" },
      { label: "Meu perfil", to: "/perfil" },
      { label: "Lista de desejos", to: "/lista-de-desejos" },
      { label: "Carrinho", to: "/carrinho" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { label: "Central de dúvidas", to: "/duvidas" },
      { label: "Garantia", to: "/duvidas" },
      { label: "Entrega e frete", to: "/duvidas" },
      { label: "Fale conosco", to: "/contato" },
    ],
  },
] as const;

const socials = [
  { Icon: Instagram, label: "Instagram", href: "https://instagram.com/Enoch.Tech_" },
  { Icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/556293145116" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <EnochMark className="h-8 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Curadoria de eletrônicos premium: selecionamos as melhores
              marcas do mercado para você não precisar escolher errado.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title} className="min-w-0">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link, i) => (
                    <li key={`${col.title}-${i}`}>
                      <Link
                        to={link.to}
                        className="text-sm text-foreground/80 transition-colors duration-300 hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-start gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Enoch Tech. Todos os direitos reservados. A
            Enoch Tech é uma revendedora autorizada — não fabricamos os produtos
            listados.
          </p>
          <div className="flex items-center gap-2">
            {socials.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target={href !== "#" ? "_blank" : undefined}
                rel={href !== "#" ? "noreferrer" : undefined}
                aria-label={label}
                className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

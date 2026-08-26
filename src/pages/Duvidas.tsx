import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

const grupos = [
  {
    categoria: "Pedidos",
    perguntas: [
      {
        q: "Como acompanho meu pedido?",
        a: "Assim que a compra é confirmada, você recebe um código de rastreio por e-mail. Também dá pra acompanhar pela sua página de Perfil, em \"Meus pedidos\".",
      },
      {
        q: "Posso cancelar um pedido depois de finalizado?",
        a: "Sim, em até 24h após a compra, direto pelo Perfil ou pelo nosso suporte, sem custo.",
      },
    ],
  },
  {
    categoria: "Entrega e frete",
    perguntas: [
      {
        q: "Como é calculado o frete?",
        a: "Usamos o Melhor Envio para calcular e contratar o transporte. O valor considera o CEP de destino, peso, dimensões do produto, quantidade de itens e a modalidade de envio escolhida — as opções de prazo e preço aparecem no fechamento da compra, conforme disponibilidade para a sua região.",
      },
      {
        q: "Quem cuida da entrega depois que o pedido é postado?",
        a: "Depois da confirmação do pagamento, preparamos e postamos o pedido dentro do prazo informado. A partir daí, o transporte é feito pela transportadora escolhida através do Melhor Envio. Se houver atraso, extravio ou qualquer ocorrência durante o transporte, damos suporte ao cliente e resolvemos junto à transportadora e à plataforma.",
      },
    ],
  },
  {
    categoria: "Troca e devolução",
    perguntas: [
      {
        q: "Posso devolver um produto se eu me arrepender da compra?",
        a: "Sim. Você pode solicitar a devolução em até 7 dias corridos após o recebimento, conforme previsto no Código de Defesa do Consumidor para compras feitas fora do estabelecimento comercial. O produto deve ser devolvido, preferencialmente, em suas condições originais, com acessórios, manuais e embalagem.",
      },
      {
        q: "O produto chegou com defeito ou diferente do que eu pedi, e agora?",
        a: "Entre em contato com a gente para analisarmos a situação e te orientar sobre o procedimento de troca ou devolução.",
      },
    ],
  },
  {
    categoria: "Garantia",
    perguntas: [
      {
        q: "A Enoch Tech fabrica os produtos?",
        a: "Não — somos uma revendedora. A garantia segue as condições estabelecidas pelo fabricante ou fornecedor de cada produto. Quando há garantia do fabricante, o contato e a assistência são direcionados a ele, conforme as regras específicas de cada produto — e a Enoch Tech também oferece orientação sobre todo o procedimento.",
      },
      {
        q: "O que a garantia não cobre?",
        a: "Danos causados por mau uso, quedas, acidentes, instalação incorreta, alterações no produto ou uso em desacordo com as orientações do fabricante.",
      },
    ],
  },
  {
    categoria: "Pagamento",
    perguntas: [
      {
        q: "Quais formas de pagamento vocês aceitam?",
        a: "Cartão de crédito e Pix.",
      },
      {
        q: "É seguro comprar no site?",
        a: "Sim, todo o processo de pagamento é criptografado ponta a ponta.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium sm:text-base">{q}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180 text-primary",
          )}
        />
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function Duvidas() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 hero-glow opacity-70" />

      <section className="relative mx-auto max-w-4xl px-5 pb-24 pt-32 sm:px-8 lg:pt-44">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Central de dúvidas</p>
          <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.08] sm:text-5xl">
            Perguntas frequentes
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Não achou o que precisava?{" "}
            <Link to="/contato" className="text-primary hover:underline">
              Fale com a gente
            </Link>
            .
          </p>
        </Reveal>

        <div className="mt-12 space-y-10">
          {grupos.map((grupo, gi) => (
            <Reveal key={grupo.categoria} delay={gi * 60}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {grupo.categoria}
              </h2>
              <div className="space-y-3">
                {grupo.perguntas.map((p) => (
                  <FaqItem key={p.q} q={p.q} a={p.a} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={grupos.length * 60} className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Compromisso Enoch Tech
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Nosso compromisso é oferecer produtos de qualidade, preço justo,
            transparência e segurança em todas as etapas da compra. A Enoch
            Tech busca construir uma relação de confiança com seus clientes,
            oferecendo atendimento responsável antes, durante e após a
            compra.
          </p>
        </Reveal>
      </section>
    </div>
  );
}

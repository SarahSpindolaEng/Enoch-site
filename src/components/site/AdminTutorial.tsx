import { useState } from "react";
import {
  ArrowRight,
  Check,
  History,
  LayoutGrid,
  RotateCcw,
  ShieldAlert,
  ShoppingBag,
  User as UserIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CHAVE_VISTO = "enoch-admin-tutorial-visto";

export function tutorialJaVisto(): boolean {
  try {
    return localStorage.getItem(CHAVE_VISTO) === "1";
  } catch {
    return true;
  }
}

function marcarTutorialVisto() {
  try {
    localStorage.setItem(CHAVE_VISTO, "1");
  } catch {
    // ambiente sem storage — sem problema, só volta a mostrar da próxima vez
  }
}

// Diagrama simples (caixa + seta) pra ilustrar onde cada coisa fica, sem
// depender de tirar print da tela real (que quebraria a cada mudança de
// layout). Não é pixel-perfect, é só uma referência visual.
// Cores batem exatamente com o estilo real do botão no painel — "primary"
// é o botão cheio (ação principal), "neutro" é o botão com borda (ação
// secundária), "amber"/"red" são só pra destacar avisos, não botões.
type CorChip = "primary" | "neutro" | "amber" | "red";
const estilosChip: Record<CorChip, string> = {
  primary: "border-primary/50 bg-primary text-primary-foreground",
  neutro: "border-border bg-background text-muted-foreground",
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  red: "border-destructive/40 bg-destructive/10 text-destructive",
};

function Diagrama({ chips }: { chips: { texto: string; cor: CorChip }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-border bg-background p-5">
      <svg width="34" height="24" viewBox="0 0 34 24" className="shrink-0 text-muted-foreground">
        <path
          d="M2 20 Q 16 20 30 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd="url(#seta)"
        />
        <defs>
          <marker id="seta" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>
      {chips.map((chip) => (
        <span
          key={chip.texto}
          className={cn("rounded-full border px-4 py-2 text-xs font-semibold", estilosChip[chip.cor])}
        >
          {chip.texto}
        </span>
      ))}
    </div>
  );
}

type Passo = {
  Icon: typeof ShoppingBag;
  titulo: string;
  texto: string;
  chips: { texto: string; cor: CorChip }[];
};

const passos: Passo[] = [
  {
    Icon: ShoppingBag,
    titulo: "Aba Pedidos",
    texto:
      'Aqui aparecem os pedidos já pagos pelo cliente. Clique em "Aceitar pedido" pra confirmar que vai preparar e enviar — só depois disso ele entra na esteira de envio. "Cancelar pedido" cancela e, se já tiver sido pago, estorna o dinheiro pro cliente automaticamente no Mercado Pago.',
    chips: [
      { texto: "Aceitar pedido", cor: "primary" },
      { texto: "Cancelar pedido", cor: "neutro" },
    ],
  },
  {
    Icon: LayoutGrid,
    titulo: "Aba Produtos",
    texto:
      'Cadastre e edite produtos: nome, preço, estoque, fotos (pode subir várias, além da capa), especificações e cores. O campo "Frete especial" é só pra itens grandes demais pra encomenda comum (scooter, triciclo) — nesses, o cliente é direcionado pro WhatsApp em vez de comprar direto.',
    chips: [{ texto: "Adicionar produto", cor: "primary" }],
  },
  {
    Icon: RotateCcw,
    titulo: "Aba Reembolsos",
    texto:
      'Quando um cliente pede reembolso de um pedido ainda não aceito, a solicitação aparece aqui. "Aprovar (estornar)" estorna o valor de verdade no Mercado Pago e cancela o pedido; "Rejeitar" só recusa a solicitação, sem mexer no pagamento.',
    chips: [
      { texto: "Aprovar (estornar)", cor: "primary" },
      { texto: "Rejeitar", cor: "neutro" },
    ],
  },
  {
    Icon: History,
    titulo: "Aba Atividade",
    texto: "Histórico de tudo que foi feito no painel — quem editou o quê e quando. Útil pra conferir depois.",
    chips: [{ texto: "Quem · O quê · Quando", cor: "neutro" }],
  },
  {
    Icon: UserIcon,
    titulo: "O que o cliente vê e consegue fazer",
    texto:
      'No perfil dele, o cliente vê os próprios pedidos, pode pagar um pedido pendente de novo ("Pagar agora"), pedir reembolso de um pedido recém-pago ("Solicitar reembolso"), e falar com o suporte pelo WhatsApp direto de um pedido específico. Ele NUNCA vê pedidos ou dados de outros clientes.',
    chips: [
      { texto: "Pagar agora", cor: "primary" },
      { texto: "Solicitar reembolso", cor: "neutro" },
    ],
  },
  {
    Icon: ShieldAlert,
    titulo: "Segurança da conta admin",
    texto:
      "O painel exige autenticação em duas etapas (2FA) ativa pra qualquer conta admin — sem isso, mesmo logado, as funções de admin ficam bloqueadas. Nunca compartilhe o código do 2FA com ninguém.",
    chips: [{ texto: "2FA obrigatório", cor: "red" }],
  },
];

export function AdminTutorial({ onFechar }: { onFechar: () => void }) {
  const [passo, setPasso] = useState(0);
  const ultimo = passo === passos.length - 1;
  const atual = passos[passo];

  const fechar = () => {
    marcarTutorialVisto();
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
              <atual.Icon className="size-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Guia do painel · {passo + 1}/{passos.length}
              </p>
              <h2 className="text-lg font-bold">{atual.titulo}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar guia"
            className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5">
          <Diagrama chips={atual.chips} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{atual.texto}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {passos.map((_, i) => (
              <span
                key={i}
                className={cn("size-1.5 rounded-full", i === passo ? "bg-primary" : "bg-border")}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {passo > 0 ? (
              <button
                type="button"
                onClick={() => setPasso((p) => p - 1)}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Voltar
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => (ultimo ? fechar() : setPasso((p) => p + 1))}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110"
            >
              {ultimo ? (
                <>
                  <Check className="size-3.5" />
                  Entendi
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

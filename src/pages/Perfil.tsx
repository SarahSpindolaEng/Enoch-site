import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ExternalLink,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User as UserIcon,
  X,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ContaSeguranca } from "@/components/site/ContaSeguranca";
import { useAuth } from "@/lib/auth";
import { useAdminAuth } from "@/lib/adminAuth";
import { useCart } from "@/lib/cart";
import { useAddress, type Address } from "@/lib/address";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";

function formatarCampo(key: string, valor: string): string {
  if (key === "cep") {
    const digitos = valor.replace(/\D/g, "").slice(0, 8);
    return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
  }
  if (key === "number") return valor.replace(/\D/g, "");
  if (key === "state") return valor.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
  return valor;
}

const enderecoVazio: Address = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

function EnderecoCartao() {
  const { address, salvar } = useAddress();
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState<Address>(enderecoVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepInvalido, setCepInvalido] = useState(false);

  const iniciarEdicao = () => {
    setRascunho(address ?? enderecoVazio);
    setErro(null);
    setCepInvalido(false);
    setEditando(true);
  };

  // Consulta o CEP no ViaCEP (base oficial dos Correios) — confirma que o
  // CEP existe de verdade e já preenche rua/bairro/cidade/UF, mas os campos
  // continuam editáveis: é só um ponto de partida, não trava o valor.
  const buscarCep = async (cepFormatado: string) => {
    const digitos = cepFormatado.replace(/\D/g, "");
    if (digitos.length !== 8) return;
    setCepInvalido(false);
    setBuscandoCep(true);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      const dados = await resposta.json();
      if (dados.erro) {
        setCepInvalido(true);
      } else {
        setRascunho((prev) => ({
          ...prev,
          street: dados.logradouro || prev.street,
          neighborhood: dados.bairro || prev.neighborhood,
          city: dados.localidade || prev.city,
          state: dados.uf || prev.state,
        }));
      }
    } catch {
      // API fora do ar não deve travar o cadastro — a pessoa preenche na mão
    } finally {
      setBuscandoCep(false);
    }
  };

  const salvarEndereco = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const { error } = await salvar(rascunho);
    setSalvando(false);
    if (error) return setErro(error);
    setEditando(false);
  };

  if (editando) {
    return (
      <form
        onSubmit={salvarEndereco}
        className="mt-4 grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-6"
      >
        {[
          { key: "cep", label: "CEP", span: "sm:col-span-2", inputMode: "numeric" as const, maxLength: 9 },
          { key: "street", label: "Rua", span: "sm:col-span-4" },
          { key: "number", label: "Número", span: "sm:col-span-2", inputMode: "numeric" as const },
          { key: "complement", label: "Complemento", span: "sm:col-span-4" },
          { key: "neighborhood", label: "Bairro", span: "sm:col-span-3" },
          { key: "city", label: "Cidade", span: "sm:col-span-3" },
          { key: "state", label: "UF", span: "sm:col-span-2", maxLength: 2 },
        ].map(({ key, label, span, inputMode, maxLength }) => (
          <label key={key} className={cn("block", span)}>
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
            <input
              required
              value={rascunho[key as keyof Address] ?? ""}
              onChange={(e) => {
                const valor = formatarCampo(key, e.target.value);
                setRascunho({ ...rascunho, [key]: valor });
                if (key === "cep") void buscarCep(valor);
              }}
              inputMode={inputMode}
              maxLength={maxLength}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
            />
            {key === "cep" && buscandoCep ? (
              <span className="mt-1 block text-[11px] text-muted-foreground">Buscando CEP…</span>
            ) : null}
            {key === "cep" && cepInvalido ? (
              <span className="mt-1 block text-[11px] text-destructive">CEP não encontrado.</span>
            ) : null}
          </label>
        ))}

        {erro ? (
          <p className="sm:col-span-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
            {erro}
          </p>
        ) : null}

        <div className="flex gap-2 sm:col-span-6">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-60"
          >
            {salvando ? "Salvando…" : "Salvar endereço"}
          </button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="rounded-full border border-border px-5 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-5 text-sm">
      <div className="flex items-start gap-3 text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
        {address ? (
          <span>
            {address.street}, {address.number}
            {address.complement ? ` — ${address.complement}` : ""}
            <br />
            {address.neighborhood} · {address.city}/{address.state} · CEP {address.cep}
          </span>
        ) : (
          "Endereço ainda não cadastrado."
        )}
      </div>
      <button
        type="button"
        onClick={iniciarEdicao}
        className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary"
      >
        {address ? "Editar" : "Cadastrar endereço"}
      </button>
    </div>
  );
}

type PedidoItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  products: { slug: string } | { slug: string }[] | null;
};
type Pedido = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  tracking_code: string | null;
  tracking_url: string | null;
  expires_at: string | null;
  order_items: PedidoItem[];
};

const statusLabel: Record<string, string> = {
  pendente: "Aguardando pagamento",
  preparando: "Preparando pedido",
  enviado: "Pedido enviado",
  em_transito: "Em trânsito",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const statusEstilo: Record<string, string> = {
  pendente: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  preparando: "border-primary/40 bg-primary/10 text-primary",
  enviado: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  em_transito: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  entregue: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  cancelado: "border-red-400/30 bg-red-400/10 text-red-400",
};

// Ordem das etapas visíveis na timeline — "pendente" fica fora porque só
// existe enquanto o Pix não caiu; a partir de "preparando" o pedido já
// está confirmado e segue essa esteira até "entregue".
const etapasRastreio = ["preparando", "enviado", "em_transito", "entregue"] as const;

function TimelinePedido({ pedido }: { pedido: Pedido }) {
  if (pedido.status === "cancelado") {
    return (
      <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <X className="size-4 shrink-0" />
        Pedido cancelado.
      </div>
    );
  }

  if (pedido.status === "pendente") {
    return (
      <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
        <Package className="size-4 shrink-0" />
        <span>
          Aguardando confirmação do pagamento via Pix.
          {pedido.expires_at ? (
            <>
              {" "}
              Se não cair até{" "}
              {new Date(pedido.expires_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              , o pedido é cancelado automaticamente.
            </>
          ) : null}
        </span>
      </div>
    );
  }

  const passoAtual = etapasRastreio.indexOf(pedido.status as (typeof etapasRastreio)[number]);

  return (
    <div className="mt-5">
      <div className="flex items-center">
        {etapasRastreio.map((etapa, i) => {
          const concluida = i <= passoAtual;
          return (
            <div key={etapa} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                    concluida
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {concluida ? <Check className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "max-w-20 text-[11px] leading-tight",
                    concluida ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {statusLabel[etapa]}
                </span>
              </div>
              {i < etapasRastreio.length - 1 ? (
                <span
                  className={cn(
                    "mx-1 mb-5 h-0.5 flex-1 transition-colors",
                    i < passoAtual ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {pedido.tracking_url ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              O envio e o rastreio são feitos pelo{" "}
              <span className="font-medium text-foreground">Melhor Envio</span>.
              {pedido.tracking_code ? (
                <>
                  {" "}
                  Código: <span className="font-mono text-foreground">{pedido.tracking_code}</span>.
                </>
              ) : null}{" "}
              Pra acompanhar com mais detalhes, é só clicar no botão abaixo.
            </p>
          </div>
          <a
            href={pedido.tracking_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
          >
            Acompanhar rastreio
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      ) : pedido.tracking_code ? (
        <p className="mt-5 text-xs text-muted-foreground">Código de rastreio: {pedido.tracking_code}</p>
      ) : null}
    </div>
  );
}

const WHATSAPP_SUPORTE = "5562982384648";

function primeiroProduto(products: PedidoItem["products"]): { slug: string } | null {
  if (!products) return null;
  return Array.isArray(products) ? (products[0] ?? null) : products;
}

// Sem chat ao vivo no site (o admin não ia acompanhar) — o pedido de ajuda
// vira uma mensagem pronta que abre direto no WhatsApp, com o link de cada
// produto do pedido e o que a pessoa escreveu. Zero backend, zero risco de
// mensagem parada esperando resposta que não vem.
function SuportePedido({ pedido }: { pedido: Pedido }) {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const linkBase = `${window.location.origin}${window.location.pathname}#/produtos/`;
    const itens = pedido.order_items
      .map((item) => {
        const produto = primeiroProduto(item.products);
        return produto?.slug
          ? `${item.quantity}x ${item.product_name} (${linkBase}${produto.slug})`
          : `${item.quantity}x ${item.product_name}`;
      })
      .join("\n");
    const texto =
      `Olá! Preciso de ajuda com o pedido #${pedido.id.slice(0, 8)}.\n\n` +
      `Itens:\n${itens}\n\n` +
      `Problema: ${mensagem}`;
    window.open(`https://wa.me/${WHATSAPP_SUPORTE}?text=${encodeURIComponent(texto)}`, "_blank");
    setMensagem("");
    setAberto(false);
  };

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary"
      >
        <MessageCircle className="size-3.5" />
        Suporte sobre este pedido
      </button>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-4 grid gap-2.5 rounded-xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">
        Conte o que houve com o pedido #{pedido.id.slice(0, 8)} — ao enviar, abre o WhatsApp com uma
        mensagem já pronta, com o link dos produtos e o que você escrever aqui.
      </p>
      <textarea
        required
        autoFocus
        rows={3}
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Ex: o produto não chegou, veio com defeito, quero trocar…"
        className="w-full resize-none rounded-lg border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-primary/60"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!mensagem.trim()}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
        >
          <MessageCircle className="size-3.5" />
          Abrir no WhatsApp
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function PedidoCard({ pedido }: { pedido: Pedido }) {
  const [aberto, setAberto] = useState(false);
  const resumoItens = pedido.order_items.map((i) => i.product_name).join(", ");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-background/40"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-medium">Pedido #{pedido.id.slice(0, 8)}</span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                statusEstilo[pedido.status] ?? "border-border bg-background text-muted-foreground",
              )}
            >
              {statusLabel[pedido.status] ?? pedido.status}
            </span>
          </div>
          <p className="mt-1.5 truncate text-sm text-muted-foreground">{resumoItens}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <div className="text-right">
            <p className="font-semibold">{formatPrice(pedido.total)}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", aberto && "rotate-180")} />
        </div>
      </button>

      {aberto ? (
        <div className="border-t border-border p-5">
          <div className="grid gap-2">
            {pedido.order_items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.product_name}
                </span>
                <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <TimelinePedido pedido={pedido} />
          <SuportePedido pedido={pedido} />
        </div>
      ) : null}
    </div>
  );
}

export function Perfil() {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdminAuth();
  const { cartCount, wishlistCount } = useCart();
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);

  useEffect(() => {
    if (!user) {
      setPedidos(null);
      return;
    }
    let active = true;
    supabase
      .from("orders")
      .select(
        "id, status, total, created_at, tracking_code, tracking_url, expires_at, order_items(product_name, quantity, unit_price, products(slug))",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) setPedidos((data as Pedido[] | null) ?? []);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-5 px-5 pt-32 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary/12 text-primary">
          <UserIcon className="size-6" />
        </span>
        <h1 className="text-2xl font-bold">Você ainda não entrou</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Entre ou crie uma conta para ver seus pedidos, endereços e lista de
          desejos.
        </p>
        <Link
          to="/login"
          className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
        >
          Entrar / criar conta
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 hero-glow opacity-70" />

      <section className="relative mx-auto max-w-5xl px-5 pb-24 pt-32 sm:px-8 lg:pt-44">
        <Reveal className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Minha conta</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Olá, {user.name}.</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm text-primary transition-all duration-300 hover:brightness-110"
              >
                <ShieldCheck className="size-4" />
                Painel administrativo
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { Icon: Package, label: "Pedidos", value: pedidos?.length ?? 0 },
            { Icon: Heart, label: "Lista de desejos", value: wishlistCount },
            { Icon: ShoppingBag, label: "No carrinho", value: cartCount },
          ].map(({ Icon, label, value }) => (
            <Reveal key={label}>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 font-display text-2xl font-bold">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <h2 className="text-lg font-semibold">Pedidos recentes</h2>
          {pedidos === null ? (
            <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
          ) : pedidos.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
              Você ainda não fez nenhum pedido.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {pedidos.map((p) => (
                <PedidoCard key={p.id} pedido={p} />
              ))}
            </div>
          )}
        </Reveal>

        <Reveal className="mt-10">
          <h2 className="text-lg font-semibold">Endereço</h2>
          <EnderecoCartao />
        </Reveal>

        <Reveal className="mt-10">
          <h2 className="text-lg font-semibold">Conta e segurança</h2>
          <div className="mt-4">
            <ContaSeguranca />
          </div>
        </Reveal>
      </section>
    </div>
  );
}

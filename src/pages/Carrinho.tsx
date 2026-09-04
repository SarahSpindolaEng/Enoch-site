import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, Minus, Plus, ShoppingBag, Truck, Trash2 } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ProductArt } from "@/components/site/ProductArt";
import { formatPrice, useProducts } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useAddress } from "@/lib/address";
import { supabase } from "@/lib/supabaseClient";

type OpcaoFrete = { id: number; empresa: string; servico: string; preco: number; prazoDias: number };

export function Carrinho() {
  const { lines, setQty, removeFromCart, subtotal, checkout } = useCart();
  const { user } = useAuth();
  const { address } = useAddress();
  const produtos = useProducts();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<string | null>(null);

  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[] | null>(null);
  const [carregandoFrete, setCarregandoFrete] = useState(false);
  const [erroFrete, setErroFrete] = useState<string | null>(null);
  const [freteEscolhido, setFreteEscolhido] = useState<number | null>(null);

  useEffect(() => {
    if (!address?.cep || lines.length === 0) {
      setOpcoesFrete(null);
      return;
    }
    let active = true;
    setCarregandoFrete(true);
    setErroFrete(null);
    supabase.functions
      .invoke("calculate-shipping", { body: { cep: address.cep, items: lines } })
      .then(({ data, error }) => {
        if (!active) return;
        setCarregandoFrete(false);
        if (error || !data?.opcoes?.length) {
          setErroFrete("Não foi possível calcular o frete pro seu endereço agora.");
          setOpcoesFrete(null);
          return;
        }
        const ordenadas = [...data.opcoes].sort((a, b) => a.preco - b.preco);
        setOpcoesFrete(ordenadas);
        setFreteEscolhido(ordenadas[0].id);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address?.cep, lines.length]);

  const opcaoAtual = opcoesFrete?.find((o) => o.id === freteEscolhido) ?? null;
  const frete = opcaoAtual?.preco ?? 0;
  const total = subtotal + frete;

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setErro(null);
    setCarregando(true);
    const { orderId, error } = await checkout();
    setCarregando(false);
    if (error) return setErro(error);
    setPedidoId(orderId);
  };

  if (pedidoId) {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-5 px-5 pt-32 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary/12 text-primary">
          <CheckCircle2 className="size-6" />
        </span>
        <h1 className="text-2xl font-bold">Pedido criado!</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Seu pedido <span className="font-medium text-foreground">#{pedidoId.slice(0, 8)}</span>{" "}
          está com status <span className="text-primary">pendente</span>. O pagamento ainda não
          está conectado — em breve avisamos como concluir.
        </p>
        <Link
          to="/perfil"
          className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
        >
          Ver meus pedidos
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-5 px-5 pt-32 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary/12 text-primary">
          <ShoppingBag className="size-6" />
        </span>
        <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Explore o catálogo e adicione produtos para vê-los por aqui.
        </p>
        <Link
          to="/produtos"
          className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 hero-glow opacity-70" />

      <section className="relative mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8 lg:pt-44">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Carrinho</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Seu carrinho</h1>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Reveal className="min-w-0 space-y-4">
            {lines.map((line) => {
              const p = produtos?.find((x) => x.slug === line.slug);
              if (!p) return null;
              return (
                <div
                  key={line.slug}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
                >
                  <Link
                    to={`/produtos/${p.slug}`}
                    className="size-20 shrink-0 overflow-hidden rounded-xl border border-border"
                  >
                    <ProductArt Icon={p.icon} imageUrl={p.imageUrl} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/produtos/${p.slug}`} className="truncate text-sm font-semibold hover:text-primary">
                      {p.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{p.brand}</p>
                    <p className="mt-2 font-display text-base font-bold">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 rounded-full border border-border px-2 py-1.5">
                    <button
                      type="button"
                      aria-label="Diminuir quantidade"
                      onClick={() => setQty(p.slug, line.qty - 1)}
                      className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm">{line.qty}</span>
                    <button
                      type="button"
                      aria-label="Aumentar quantidade"
                      onClick={() => setQty(p.slug, line.qty + 1)}
                      className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remover"
                    onClick={() => removeFromCart(p.slug)}
                    className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </Reveal>

          <Reveal delay={100} className="min-w-0">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Resumo
              </h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span>
                    {!address ? "—" : carregandoFrete ? "Calculando…" : opcaoAtual ? formatPrice(frete) : "—"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {!address ? null : erroFrete ? (
                <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {erroFrete}
                </p>
              ) : opcoesFrete && opcoesFrete.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Truck className="size-3.5" />
                    Opções de envio
                  </p>
                  {opcoesFrete.map((o) => (
                    <label
                      key={o.id}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-xs transition-colors ${
                        freteEscolhido === o.id ? "border-primary/50 bg-primary/5" : "border-border"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="frete"
                          checked={freteEscolhido === o.id}
                          onChange={() => setFreteEscolhido(o.id)}
                          className="accent-primary"
                        />
                        <span>
                          <span className="font-medium text-foreground">
                            {o.empresa} — {o.servico}
                          </span>
                          <br />
                          <span className="text-muted-foreground">até {o.prazoDias} dias úteis</span>
                        </span>
                      </span>
                      <span className="font-semibold">{formatPrice(o.preco)}</span>
                    </label>
                  ))}
                </div>
              ) : null}

              {user ? (
                <div className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-xs">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {address ? (
                      <span>
                        {address.street}, {address.number}
                        {address.complement ? ` — ${address.complement}` : ""}
                        <br />
                        {address.neighborhood} · {address.city}/{address.state} · CEP {address.cep}
                      </span>
                    ) : (
                      <span>Nenhum endereço cadastrado.</span>
                    )}
                  </div>
                  <Link
                    to="/perfil"
                    className="shrink-0 font-medium text-primary hover:brightness-110"
                  >
                    {address ? "Trocar" : "Cadastrar"}
                  </Link>
                </div>
              ) : null}

              {erro ? (
                <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {erro}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={carregando || (user ? !address || !opcaoAtual : false)}
                className="mt-6 w-full rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_40px_-10px_var(--primary)] active:scale-[0.99] disabled:opacity-60"
              >
                {carregando ? "Processando…" : "Finalizar compra"}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {!user
                  ? "Você precisa entrar na sua conta para finalizar a compra."
                  : !address
                    ? "Cadastre um endereço pra calcular o frete e finalizar a compra."
                    : !opcaoAtual
                      ? "Escolha uma opção de envio pra continuar."
                      : "Pagamento ainda não conectado — o pedido fica registrado como pendente."}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

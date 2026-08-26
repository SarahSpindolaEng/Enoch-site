import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ProductArt } from "@/components/site/ProductArt";
import { formatPrice, getProduct } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export function Carrinho() {
  const { lines, setQty, removeFromCart, subtotal, checkout } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<string | null>(null);

  const frete = subtotal > 0 && subtotal < 499 ? 39 : 0;
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
              const p = getProduct(line.slug);
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
                    <ProductArt Icon={p.icon} />
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
                  <span>{frete === 0 ? "Grátis" : formatPrice(frete)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {erro ? (
                <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {erro}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={carregando}
                className="mt-6 w-full rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_40px_-10px_var(--primary)] active:scale-[0.99] disabled:opacity-60"
              >
                {carregando ? "Processando…" : "Finalizar compra"}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {user
                  ? "Pagamento ainda não conectado — o pedido fica registrado como pendente."
                  : "Você precisa entrar na sua conta para finalizar a compra."}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

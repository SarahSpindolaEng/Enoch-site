import { Link, Navigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Check, Heart, ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductArt } from "@/components/site/ProductArt";
import { formatPrice, useProduct, useProducts } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function ProdutoDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const product = useProduct(slug);
  const produtos = useProducts();
  const [cor, setCor] = useState(0);
  const [added, setAdded] = useState(false);
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  if (product === undefined) {
    return <p className="pt-40 text-center text-sm text-muted-foreground">Carregando…</p>;
  }
  if (product === null) return <Navigate to="/produtos" replace />;

  const relacionados = (produtos ?? []).filter((p) => p.slug !== product.slug).slice(0, 3);
  const wishlisted = isWishlisted(product.slug);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] hero-glow opacity-60" />

      <section className="relative mx-auto max-w-7xl px-5 pt-28 sm:px-8 lg:pt-36">
        <Link
          to="/produtos"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Voltar ao catálogo
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Galeria */}
          <Reveal className="min-w-0">
            <div className="aspect-square overflow-hidden rounded-3xl border border-border bg-surface">
              <ProductArt Icon={product.icon} imageUrl={product.imageUrl} tone="bright" />
            </div>
          </Reveal>

          {/* Info */}
          <Reveal delay={100} className="min-w-0">
            <div className="lg:sticky lg:top-28">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {product.category} · {product.brand}
                </span>
                {product.badge ? (
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                    {product.badge}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-balance text-4xl font-bold leading-tight sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 text-base text-muted-foreground">{product.tagline}</p>

              <div className="mt-7 flex items-end gap-3">
                <span className="font-display text-3xl font-bold sm:text-4xl">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice ? (
                  <span className="pb-1 text-base text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                ou 12x de {formatPrice(Math.round(product.price / 12))} sem juros
              </p>

              <p className="mt-7 max-w-lg text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              <div className="mt-8">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Cor — {product.colors[cor]?.name}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCor(i)}
                      aria-label={c.name}
                      className={cn(
                        "grid size-10 place-items-center rounded-full border transition-all duration-300 hover:scale-105",
                        cor === i
                          ? "border-primary shadow-[0_0_24px_-8px_var(--primary)]"
                          : "border-border",
                      )}
                    >
                      <span
                        className="grid size-7 place-items-center rounded-full"
                        style={{ backgroundColor: c.value }}
                      >
                        {cor === i ? <Check className="size-3.5 text-primary-foreground" /> : null}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(product.slug);
                    setAdded(true);
                    window.setTimeout(() => setAdded(false), 1800);
                  }}
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_44px_-10px_var(--primary)] active:scale-[0.99]"
                >
                  <ShoppingBag className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                  {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.slug)}
                  aria-label="Favoritar"
                  className={cn(
                    "grid size-14 shrink-0 place-items-center rounded-full border transition-all duration-300 sm:size-auto sm:px-6",
                    wishlisted
                      ? "border-primary/60 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
                  )}
                >
                  <Heart className={cn("size-4", wishlisted && "fill-primary")} />
                </button>
              </div>

            </div>
          </Reveal>
        </div>
      </section>

      {/* Especificações */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Ficha técnica</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Especificações</h2>
        </Reveal>
        <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {product.specs.map((spec, i) => (
            <Reveal key={spec.label} delay={(i % 2) * 70}>
              <div className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 bg-background px-6 py-5">
                <dt className="min-w-0 text-sm text-muted-foreground">{spec.label}</dt>
                <dd className="min-w-0 text-sm font-medium">{spec.value}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Relacionados */}
      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <Reveal>
            <h2 className="text-3xl font-bold sm:text-4xl">Produtos relacionados</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relacionados.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

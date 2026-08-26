import { Link } from "react-router-dom";
import { ArrowUpRight, Heart } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { ProductArt } from "./ProductArt";

export function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.slug);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_30px_70px_-40px_var(--primary)]">
      <Link
        to={`/produtos/${product.slug}`}
        className="relative block aspect-4/3 shrink-0 overflow-hidden"
      >
        <ProductArt
          Icon={product.icon}
          tone={product.badge ? "bright" : "default"}
          className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        {product.badge ? (
          <span className="absolute left-4 top-4 rounded-full border border-primary/40 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur-md">
            {product.badge}
          </span>
        ) : null}
        <span className="absolute right-4 top-4 grid size-9 translate-y-2 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </Link>

      {/* Bloco de texto com altura reservada fixa: independente do tamanho
          do nome/tagline, o card nunca muda de altura dentro da grade. */}
      <div className="flex flex-1 flex-col gap-1 p-5">
        <p className="h-4 truncate text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {product.category} · {product.brand}
        </p>
        <Link to={`/produtos/${product.slug}`} className="min-w-0">
          <h3 className="h-7 truncate text-lg font-semibold">{product.name}</h3>
        </Link>
        <p className="line-clamp-2 h-10 text-sm leading-5 text-muted-foreground">
          {product.tagline}
        </p>
        <div className="mt-4 flex flex-1 items-end justify-between gap-2">
          <div className="flex items-end gap-2">
            <span className="font-display text-xl font-bold">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice ? (
              <span className="pb-0.5 text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            aria-label={wishlisted ? "Remover dos desejos" : "Adicionar aos desejos"}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.slug);
            }}
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 hover:scale-105",
              wishlisted
                ? "border-primary/60 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
            )}
          >
            <Heart className={cn("size-4", wishlisted && "fill-primary")} />
          </button>
        </div>
      </div>
    </div>
  );
}

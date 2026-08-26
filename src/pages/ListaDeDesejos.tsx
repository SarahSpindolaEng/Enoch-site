import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ListaDeDesejos() {
  const { wishlist } = useCart();
  const itens = products.filter((p) => wishlist.includes(p.slug));

  if (itens.length === 0) {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-5 px-5 pt-32 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary/12 text-primary">
          <Heart className="size-6" />
        </span>
        <h1 className="text-2xl font-bold">Sua lista de desejos está vazia</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Clique no coração de qualquer produto para salvá-lo aqui.
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

      <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 lg:pt-44">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Lista de desejos</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Seus favoritos ({itens.length})
          </h1>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { PromoBanner } from "@/components/site/PromoBanner";
import { categories, products } from "@/lib/products";
import { cn } from "@/lib/utils";

const ordenacoes = ["Relevância", "Menor preço", "Maior preço"] as const;

export function Catalogo() {
  const [searchParams] = useSearchParams();
  const categoriaUrl = searchParams.get("categoria");
  const categoriaInicial =
    categoriaUrl && (categories as readonly string[]).includes(categoriaUrl)
      ? categoriaUrl
      : "Todos";

  const [categoria, setCategoria] = useState<string>(categoriaInicial);
  const [ordem, setOrdem] = useState<string>("Relevância");

  // Sincroniza o filtro quando o parâmetro ?categoria= muda por um link
  // clicado enquanto já se está nesta página (ex: banner de promoção) —
  // sem isso, a navegação atualiza a URL mas o filtro fica parado.
  useEffect(() => {
    if (categoriaUrl && (categories as readonly string[]).includes(categoriaUrl)) {
      setCategoria(categoriaUrl);
    }
  }, [categoriaUrl]);

  const lista = useMemo(() => {
    const filtrados =
      categoria === "Todos" ? [...products] : products.filter((p) => p.category === categoria);
    if (ordem === "Menor preço") filtrados.sort((a, b) => a.price - b.price);
    if (ordem === "Maior preço") filtrados.sort((a, b) => b.price - a.price);
    return filtrados;
  }, [categoria, ordem]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 hero-glow opacity-70" />

      <section className="relative mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-8 lg:pt-40">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Catálogo</p>
          <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
            Todos os produtos
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Uma curadoria curta e deliberada. {products.length} produtos de marcas
            parceiras, cada um selecionado pra durar anos.
          </p>
        </Reveal>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-6">
          <PromoBanner />
        </Reveal>

        <Reveal>
          <div className="sticky top-20 z-30 grid gap-4 rounded-2xl border border-border bg-background/80 p-3 backdrop-blur-xl lg:flex lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoria(cat)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-all duration-300",
                    categoria === cat
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2 border-t border-border pt-3 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
              <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
              {ordenacoes.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrdem(o)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs transition-colors duration-300",
                    ordem === o ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((product, i) => (
            <Reveal key={product.slug} delay={(i % 3) * 80}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

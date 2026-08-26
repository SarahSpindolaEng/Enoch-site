import type { LucideIcon } from "lucide-react";
import { AudioLines, Headphones, Keyboard, Watch } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase, type DbProduct } from "@/lib/supabaseClient";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  description: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  category: string;
  imageUrl: string | null;
  icon: LucideIcon;
  colors: { name: string; value: string }[];
  specs: { label: string; value: string }[];
  stock: number;
  installments: number;
};

export const categories = ["Todos", "Áudio", "Vestíveis", "Acessórios"] as const;

// Sem foto cadastrada, cai num ícone por categoria — mantém o visual
// "clean tech" consistente enquanto o produto não tem imagem própria.
const iconePorCategoria: Record<string, LucideIcon> = {
  Áudio: Headphones,
  Vestíveis: Watch,
  Acessórios: Keyboard,
};

function paraProduto(p: DbProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    price: p.price,
    oldPrice: p.old_price,
    badge: p.badge,
    category: p.category,
    imageUrl: p.image_url,
    icon: iconePorCategoria[p.category] ?? AudioLines,
    colors: p.colors,
    specs: p.specs,
    stock: p.stock,
    installments: p.installments,
  };
}

// Catálogo público vem do banco (mesma tabela usada no checkout) — cache em
// memória compartilhado entre as páginas, carregado uma vez por sessão.
let cache: Product[] | null = null;
let carregando = false;
const ouvintes = new Set<() => void>();

function carregar() {
  if (cache || carregando) return;
  carregando = true;
  void supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .then(({ data }) => {
      cache = ((data as DbProduct[] | null) ?? []).map(paraProduto);
      carregando = false;
      ouvintes.forEach((f) => f());
    });
}

export function useProducts(): Product[] | null {
  const [, tick] = useState(0);
  useEffect(() => {
    const ouvinte = () => tick((n) => n + 1);
    ouvintes.add(ouvinte);
    carregar();
    return () => {
      ouvintes.delete(ouvinte);
    };
  }, []);
  return cache;
}

// Chamado pelo painel admin depois de criar/editar/remover um produto —
// sem isso, quem já tinha a vitrine aberta continuaria vendo os dados
// antigos até recarregar a página inteira.
export function invalidateProducts() {
  cache = null;
  ouvintes.forEach((f) => f());
  carregar();
}

// undefined = ainda carregando, null = não existe, Product = encontrado.
export function useProduct(slug: string | undefined): Product | null | undefined {
  const produtos = useProducts();
  if (!slug || !produtos) return undefined;
  return produtos.find((p) => p.slug === slug) ?? null;
}

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

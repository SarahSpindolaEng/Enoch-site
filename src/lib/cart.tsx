import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getProduct } from "@/lib/products";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";

type CartLine = { slug: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  wishlist: string[];
  cartCount: number;
  wishlistCount: number;
  addToCart: (slug: string, qty?: number) => void;
  removeFromCart: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  subtotal: number;
  checkout: () => Promise<{ orderId: string | null; error: string | null }>;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ambiente sem storage disponível — segue só em memória
  }
}

// Mapa slug (usado no catálogo estático do site) <-> id real do produto no
// Supabase. O catálogo é o mesmo para todo mundo, então um cache simples em
// memória evita reconsultar isso toda hora.
let slugToIdCache: Map<string, string> | null = null;
async function getSlugToId(): Promise<Map<string, string>> {
  if (slugToIdCache) return slugToIdCache;
  const { data, error } = await supabase.from("products").select("id, slug");
  if (error || !data) return new Map();
  const map = new Map<string, string>();
  for (const row of data as { id: string; slug: string }[]) map.set(row.slug, row.id);
  slugToIdCache = map;
  return map;
}

async function syncCartLine(userId: string, slug: string, qty: number) {
  const map = await getSlugToId();
  const productId = map.get(slug);
  if (!productId) return;
  if (qty <= 0) {
    await supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", productId);
  } else {
    await supabase
      .from("cart_items")
      .upsert(
        { user_id: userId, product_id: productId, quantity: qty },
        { onConflict: "user_id,product_id" },
      );
  }
}

async function syncWishlistLine(userId: string, slug: string, add: boolean) {
  const map = await getSlugToId();
  const productId = map.get(slug);
  if (!productId) return;
  if (add) {
    await supabase
      .from("wishlist_items")
      .upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" });
  } else {
    await supabase.from("wishlist_items").delete().eq("user_id", userId).eq("product_id", productId);
  }
}

function traduzErroPedido(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("não autenticado")) return "Você precisa entrar na sua conta para finalizar a compra.";
  if (m.includes("carrinho vazio")) return "Seu carrinho está vazio.";
  if (m.includes("produto não encontrado")) return "Um dos produtos não está mais disponível.";
  if (m.includes("estoque insuficiente") || m.includes("quantidade inválida")) return message;
  return "Não foi possível concluir o pedido agora. Tente novamente em instantes.";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lines, setLines] = useState<CartLine[]>(() => readStorage("enoch-cart", []));
  const [wishlist, setWishlist] = useState<string[]>(() => readStorage("enoch-wishlist", []));
  const syncedForUser = useRef<string | null>(null);

  // Visitante sem login: carrinho e desejos ficam só no navegador.
  useEffect(() => {
    if (!user) writeStorage("enoch-cart", lines);
  }, [lines, user]);
  useEffect(() => {
    if (!user) writeStorage("enoch-wishlist", wishlist);
  }, [wishlist, user]);

  // Ao entrar na conta: manda o que estava salvo localmente pro banco (se
  // houver) e passa a ler/escrever direto no Supabase — carrinho e lista de
  // desejos ficam salvos na conta, não só no navegador.
  useEffect(() => {
    if (!user) {
      syncedForUser.current = null;
      return;
    }
    if (syncedForUser.current === user.id) return;
    syncedForUser.current = user.id;

    (async () => {
      const map = await getSlugToId();
      const guestCart = readStorage<CartLine[]>("enoch-cart", []);
      const guestWishlist = readStorage<string[]>("enoch-wishlist", []);

      if (guestCart.length) {
        const rows = guestCart
          .map((l) => ({ user_id: user.id, product_id: map.get(l.slug), quantity: l.qty }))
          .filter((r): r is { user_id: string; product_id: string; quantity: number } =>
            Boolean(r.product_id),
          );
        if (rows.length) await supabase.from("cart_items").upsert(rows, { onConflict: "user_id,product_id" });
      }
      if (guestWishlist.length) {
        const rows = guestWishlist
          .map((slug) => ({ user_id: user.id, product_id: map.get(slug) }))
          .filter((r): r is { user_id: string; product_id: string } => Boolean(r.product_id));
        if (rows.length)
          await supabase.from("wishlist_items").upsert(rows, { onConflict: "user_id,product_id" });
      }
      writeStorage("enoch-cart", []);
      writeStorage("enoch-wishlist", []);

      const idToSlug = new Map(Array.from(map.entries()).map(([slug, id]) => [id, slug]));

      const [{ data: cartRows }, { data: wishRows }] = await Promise.all([
        supabase.from("cart_items").select("product_id, quantity").eq("user_id", user.id),
        supabase.from("wishlist_items").select("product_id").eq("user_id", user.id),
      ]);

      setLines(
        (cartRows ?? [])
          .map((r) => ({ slug: idToSlug.get(r.product_id as string), qty: r.quantity as number }))
          .filter((l): l is CartLine => Boolean(l.slug)),
      );
      setWishlist(
        (wishRows ?? [])
          .map((r) => idToSlug.get(r.product_id as string))
          .filter((s): s is string => Boolean(s)),
      );
    })();
  }, [user]);

  const addToCart = (slug: string, qty = 1) => {
    let newQty = qty;
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      newQty = existing ? existing.qty + qty : qty;
      if (existing) return prev.map((l) => (l.slug === slug ? { ...l, qty: newQty } : l));
      return [...prev, { slug, qty }];
    });
    if (user) void syncCartLine(user.id, slug, newQty);
  };

  const removeFromCart = (slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
    if (user) void syncCartLine(user.id, slug, 0);
  };

  const setQty = (slug: string, qty: number) => {
    if (qty <= 0) return removeFromCart(slug);
    setLines((prev) => prev.map((l) => (l.slug === slug ? { ...l, qty } : l)));
    if (user) void syncCartLine(user.id, slug, qty);
  };

  const toggleWishlist = (slug: string) => {
    setWishlist((prev) => {
      const has = prev.includes(slug);
      if (user) void syncWishlistLine(user.id, slug, !has);
      return has ? prev.filter((s) => s !== slug) : [...prev, slug];
    });
  };

  const isWishlisted = (slug: string) => wishlist.includes(slug);

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const p = getProduct(l.slug);
        return p ? sum + p.price * l.qty : sum;
      }, 0),
    [lines],
  );

  const cartCount = lines.reduce((sum, l) => sum + l.qty, 0);

  const checkout: CartContextValue["checkout"] = async () => {
    if (!user) return { orderId: null, error: "Você precisa entrar na sua conta para finalizar a compra." };
    if (lines.length === 0) return { orderId: null, error: "Seu carrinho está vazio." };

    const map = await getSlugToId();
    const items = lines
      .map((l) => ({ product_id: map.get(l.slug), quantity: l.qty }))
      .filter((i): i is { product_id: string; quantity: number } => Boolean(i.product_id));

    // O preço NUNCA é enviado daqui — a função `create_order` no banco é
    // quem lê o preço real da tabela de produtos no momento da compra,
    // então não tem como alguém alterar o valor pelo navegador.
    const { data, error } = await supabase.rpc("create_order", { items });
    if (error) return { orderId: null, error: traduzErroPedido(error.message) };

    setLines([]);
    return { orderId: data as string, error: null };
  };

  const value: CartContextValue = {
    lines,
    wishlist,
    cartCount,
    wishlistCount: wishlist.length,
    addToCart,
    removeFromCart,
    setQty,
    toggleWishlist,
    isWishlisted,
    subtotal,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}

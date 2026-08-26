import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  LayoutGrid,
  LogOut,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { EnochMark } from "@/components/site/EnochLogo";
import { useAdminAuth } from "@/lib/adminAuth";
import { supabase, type DbProduct } from "@/lib/supabaseClient";
import { categories, formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";

type Profile = { id: string; name: string | null; email: string | null };
type OrderItem = { product_name: string; quantity: number; unit_price: number };
type Order = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

const statusOptions = ["pendente", "pago", "enviado", "entregue", "cancelado"] as const;
const statusEstilo: Record<string, string> = {
  pendente: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  pago: "border-primary/40 bg-primary/10 text-primary",
  enviado: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  entregue: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  cancelado: "border-red-400/30 bg-red-400/10 text-red-400",
};
const produtoCategorias = categories.filter((c) => c !== "Todos");

function PedidosTab() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: orderRows }, { data: profileRows }] = await Promise.all([
        supabase
          .from("orders")
          .select("id, user_id, status, total, created_at, order_items(product_name, quantity, unit_price)")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, name, email"),
      ]);
      if (!active) return;
      setOrders((orderRows as Order[] | null) ?? []);
      setProfiles(new Map(((profileRows as Profile[] | null) ?? []).map((p) => [p.id, p])));
    })();
    return () => {
      active = false;
    };
  }, []);

  const mudarStatus = (id: string, status: string) => {
    setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, status } : o)) ?? null);
    void supabase.from("orders").update({ status }).eq("id", id);
  };

  if (orders === null) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (orders.length === 0)
    return (
      <p className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
        Nenhum pedido ainda.
      </p>
    );

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-5 py-3 font-medium">Pedido</th>
            <th className="px-5 py-3 font-medium">Cliente</th>
            <th className="px-5 py-3 font-medium">Itens</th>
            <th className="px-5 py-3 font-medium">Valor</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Data</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const cliente = profiles.get(o.user_id);
            return (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                <td className="px-5 py-3.5 font-medium">#{o.id.slice(0, 8)}</td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {cliente?.name ?? cliente?.email ?? o.user_id.slice(0, 8)}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {o.order_items.map((i) => `${i.quantity}x ${i.product_name}`).join(", ")}
                </td>
                <td className="px-5 py-3.5 tabular-nums">{formatPrice(o.total)}</td>
                <td className="px-5 py-3.5">
                  <select
                    value={o.status}
                    onChange={(e) => mudarStatus(o.id, e.target.value)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium capitalize outline-none",
                      statusEstilo[o.status] ?? "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProdutosTab() {
  const [produtos, setProdutos] = useState<DbProduct[] | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) setProdutos((data as DbProduct[] | null) ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  const remover = (id: string) => {
    setProdutos((prev) => prev?.filter((p) => p.id !== id) ?? null);
    void supabase.from("products").delete().eq("id", id);
  };

  const alternarAtivo = (p: DbProduct) => {
    setProdutos((prev) => prev?.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x)) ?? null);
    void supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
  };

  const editarLocal = (id: string, patch: Partial<DbProduct>) => {
    setProdutos((prev) => prev?.map((x) => (x.id === id ? { ...x, ...patch } : x)) ?? null);
  };

  const salvarCampo = (id: string, patch: Partial<DbProduct>) => {
    void supabase.from("products").update(patch).eq("id", id);
  };

  const adicionar = async () => {
    const novo = {
      slug: `novo-produto-${Date.now()}`,
      name: "Novo produto",
      brand: "Marca",
      category: produtoCategorias[0],
      price: 0,
      stock: 0,
      is_active: true,
    };
    const { data } = await supabase.from("products").insert(novo).select().single();
    if (data) setProdutos((prev) => [data as DbProduct, ...(prev ?? [])]);
  };

  if (produtos === null) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={adicionar}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
        >
          <Plus className="size-4" />
          Adicionar produto
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 font-medium">Produto</th>
              <th className="px-5 py-3 font-medium">Categoria</th>
              <th className="px-5 py-3 font-medium">Preço</th>
              <th className="px-5 py-3 font-medium">Estoque</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                <td className="px-5 py-3.5">
                  <input
                    value={p.name}
                    onChange={(e) => editarLocal(p.id, { name: e.target.value })}
                    onBlur={(e) => salvarCampo(p.id, { name: e.target.value })}
                    className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 font-medium outline-none focus:border-primary/50 focus:bg-background"
                  />
                  <input
                    value={p.brand}
                    onChange={(e) => editarLocal(p.id, { brand: e.target.value })}
                    onBlur={(e) => salvarCampo(p.id, { brand: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-xs text-muted-foreground outline-none focus:border-primary/50 focus:bg-background"
                  />
                </td>
                <td className="px-5 py-3.5">
                  <select
                    value={p.category}
                    onChange={(e) => {
                      editarLocal(p.id, { category: e.target.value });
                      salvarCampo(p.id, { category: e.target.value });
                    }}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none"
                  >
                    {produtoCategorias.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) => editarLocal(p.id, { price: Number(e.target.value) || 0 })}
                    onBlur={(e) => salvarCampo(p.id, { price: Number(e.target.value) || 0 })}
                    className="w-24 rounded-lg border border-input bg-background px-2 py-1 text-sm outline-none"
                  />
                </td>
                <td className="px-5 py-3.5">
                  <input
                    type="number"
                    value={p.stock}
                    onChange={(e) => editarLocal(p.id, { stock: Number(e.target.value) || 0 })}
                    onBlur={(e) => salvarCampo(p.id, { stock: Number(e.target.value) || 0 })}
                    className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-sm outline-none"
                  />
                </td>
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => alternarAtivo(p)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium",
                      p.is_active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {p.is_active ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => remover(p.id)}
                      className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-red-400/50 hover:text-red-400"
                      aria-label="Remover produto"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { isAdmin, loading, logout } = useAdminAuth();
  const [aba, setAba] = useState<"pedidos" | "produtos">("pedidos");

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Verificando acesso…
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <EnochMark className="h-7 w-auto" />
            <span className="text-sm font-semibold text-muted-foreground">Painel administrativo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Ver site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary"
            >
              <LogOut className="size-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Visão geral</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pedidos e produtos aqui são os dados reais do banco — preço e estoque editados aqui valem
          para o checkout. A vitrine pública ainda usa um catálogo fixo no código, então uma mudança
          de nome/preço/imagem visível pro cliente precisa ser feita lá também.
        </p>

        <div className="mt-8 flex gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setAba("pedidos")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
              aba === "pedidos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <ShoppingBag className="size-4" />
            Pedidos
          </button>
          <button
            type="button"
            onClick={() => setAba("produtos")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
              aba === "produtos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-4" />
            Produtos
          </button>
        </div>

        <div className="mt-6">{aba === "pedidos" ? <PedidosTab /> : <ProdutosTab />}</div>
      </main>
    </div>
  );
}

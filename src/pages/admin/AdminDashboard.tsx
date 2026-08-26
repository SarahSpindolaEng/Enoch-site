import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Check,
  ImagePlus,
  LayoutGrid,
  LogOut,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  X,
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

type Rascunho = {
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  is_active: boolean;
  image_url: string | null;
};

function paraRascunho(p: DbProduct): Rascunho {
  return {
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    stock: p.stock,
    is_active: p.is_active,
    image_url: p.image_url,
  };
}

const rascunhoVazio: Rascunho = {
  name: "",
  brand: "",
  category: produtoCategorias[0],
  price: 0,
  stock: 0,
  is_active: true,
  image_url: null,
};

function ProdutosTab() {
  const [produtos, setProdutos] = useState<DbProduct[] | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);

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

  const iniciarEdicao = (p: DbProduct) => {
    setEditId(p.id);
    setRascunho(paraRascunho(p));
    setImagemArquivo(null);
  };

  const iniciarNovo = () => {
    setEditId("__novo__");
    setRascunho({ ...rascunhoVazio });
    setImagemArquivo(null);
  };

  const cancelar = () => {
    setEditId(null);
    setRascunho(null);
    setImagemArquivo(null);
  };

  const salvar = async () => {
    if (!rascunho) return;
    setSalvando(true);

    let imageUrl = rascunho.image_url;
    if (imagemArquivo) {
      const caminho = `${Date.now()}-${imagemArquivo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(caminho, imagemArquivo);
      if (!uploadError) {
        imageUrl = supabase.storage.from("product-images").getPublicUrl(caminho).data.publicUrl;
      }
    }

    const payload = { ...rascunho, image_url: imageUrl };

    if (editId === "__novo__") {
      const { data } = await supabase
        .from("products")
        .insert({ ...payload, slug: `produto-${Date.now()}` })
        .select()
        .single();
      if (data) setProdutos((prev) => [data as DbProduct, ...(prev ?? [])]);
    } else if (editId) {
      await supabase.from("products").update(payload).eq("id", editId);
      setProdutos((prev) => prev?.map((p) => (p.id === editId ? { ...p, ...payload } : p)) ?? null);
    }

    setSalvando(false);
    cancelar();
  };

  if (produtos === null) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={iniciarNovo}
          disabled={editId !== null}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-50"
        >
          <Plus className="size-4" />
          Adicionar produto
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 font-medium">Imagem</th>
              <th className="px-5 py-3 font-medium">Produto</th>
              <th className="px-5 py-3 font-medium">Categoria</th>
              <th className="px-5 py-3 font-medium">Preço</th>
              <th className="px-5 py-3 font-medium">Estoque</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {editId === "__novo__" && rascunho ? (
              <ProdutoLinhaEdicao
                rascunho={rascunho}
                setRascunho={setRascunho}
                imagemArquivo={imagemArquivo}
                setImagemArquivo={setImagemArquivo}
                imagemAtual={null}
                salvando={salvando}
                onSalvar={salvar}
                onCancelar={cancelar}
              />
            ) : null}
            {produtos.map((p) =>
              editId === p.id && rascunho ? (
                <ProdutoLinhaEdicao
                  key={p.id}
                  rascunho={rascunho}
                  setRascunho={setRascunho}
                  imagemArquivo={imagemArquivo}
                  setImagemArquivo={setImagemArquivo}
                  imagemAtual={p.image_url}
                  salvando={salvando}
                  onSalvar={salvar}
                  onCancelar={cancelar}
                />
              ) : (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                  <td className="px-5 py-3.5">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="size-12 rounded-lg object-cover" />
                    ) : (
                      <span className="grid size-12 place-items-center rounded-lg border border-dashed border-border text-[10px] text-muted-foreground">
                        sem foto
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3.5 tabular-nums">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3.5 tabular-nums">{p.stock}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-medium",
                        p.is_active
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {p.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(p)}
                        disabled={editId !== null}
                        className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
                        aria-label="Editar produto"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remover(p.id)}
                        disabled={editId !== null}
                        className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-red-400/50 hover:text-red-400 disabled:opacity-50"
                        aria-label="Remover produto"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProdutoLinhaEdicao({
  rascunho,
  setRascunho,
  imagemArquivo,
  setImagemArquivo,
  imagemAtual,
  salvando,
  onSalvar,
  onCancelar,
}: {
  rascunho: Rascunho;
  setRascunho: (r: Rascunho) => void;
  imagemArquivo: File | null;
  setImagemArquivo: (f: File | null) => void;
  imagemAtual: string | null;
  salvando: boolean;
  onSalvar: () => void;
  onCancelar: () => void;
}) {
  const preview = imagemArquivo ? URL.createObjectURL(imagemArquivo) : imagemAtual;

  return (
    <tr className="border-b border-border bg-primary/5">
      <td className="px-5 py-3.5">
        <label className="grid size-12 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-primary/50 text-[10px] text-muted-foreground hover:border-primary">
          {preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-4 text-primary" />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImagemArquivo(e.target.files?.[0] ?? null)}
          />
        </label>
      </td>
      <td className="px-5 py-3.5">
        <input
          value={rascunho.name}
          onChange={(e) => setRascunho({ ...rascunho, name: e.target.value })}
          placeholder="Nome do produto"
          autoFocus
          className="w-full rounded-lg border border-input bg-background px-2 py-1 font-medium outline-none"
        />
        <input
          value={rascunho.brand}
          onChange={(e) => setRascunho({ ...rascunho, brand: e.target.value })}
          placeholder="Marca"
          className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1 text-xs outline-none"
        />
      </td>
      <td className="px-5 py-3.5">
        <select
          value={rascunho.category}
          onChange={(e) => setRascunho({ ...rascunho, category: e.target.value })}
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
          value={rascunho.price}
          onChange={(e) => setRascunho({ ...rascunho, price: Number(e.target.value) || 0 })}
          className="w-24 rounded-lg border border-input bg-background px-2 py-1 text-sm outline-none"
        />
      </td>
      <td className="px-5 py-3.5">
        <input
          type="number"
          value={rascunho.stock}
          onChange={(e) => setRascunho({ ...rascunho, stock: Number(e.target.value) || 0 })}
          className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-sm outline-none"
        />
      </td>
      <td className="px-5 py-3.5">
        <button
          type="button"
          onClick={() => setRascunho({ ...rascunho, is_active: !rascunho.is_active })}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium",
            rascunho.is_active
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground",
          )}
        >
          {rascunho.is_active ? "Ativo" : "Inativo"}
        </button>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onSalvar}
            disabled={salvando || !rascunho.name.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-50"
          >
            <Check className="size-3.5" />
            {salvando ? "Salvando…" : "Aplicar"}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            disabled={salvando}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-red-400/50 hover:text-red-400 disabled:opacity-50"
          >
            <X className="size-3.5" />
            Cancelar
          </button>
        </div>
      </td>
    </tr>
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

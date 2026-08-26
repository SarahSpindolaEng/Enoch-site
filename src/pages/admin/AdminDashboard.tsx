import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  AlertTriangle,
  LayoutGrid,
  LogOut,
  Package,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { EnochMark } from "@/components/site/EnochLogo";
import { useAdminAuth } from "@/lib/adminAuth";
import { categories, formatPrice, products as produtosIniciais, type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

type Pedido = {
  id: string;
  cliente: string;
  produto: string;
  valor: number;
  status: "Pago" | "Enviado" | "Entregue" | "Pendente";
  data: string;
};

// Pedidos fictícios só pra dar forma ao painel — quando o backend/gateway
// estiver ligado, isso vem do banco de dados de verdade.
const pedidosMock: Pedido[] = [
  { id: "#1042", cliente: "Marina Souza", produto: "Aura Max", valor: 2499, status: "Pago", data: "22/08/2026" },
  { id: "#1041", cliente: "Rafael Lima", produto: "Pulse Watch 2", valor: 1899, status: "Enviado", data: "21/08/2026" },
  { id: "#1040", cliente: "Camila Alves", produto: "Echo Buds Pro", valor: 1099, status: "Entregue", data: "19/08/2026" },
  { id: "#1039", cliente: "Diego Ferreira", produto: "Type 75 Low", valor: 1299, status: "Pendente", data: "18/08/2026" },
  { id: "#1038", cliente: "Juliana Prado", produto: "Cylinder 360", valor: 1499, status: "Entregue", data: "15/08/2026" },
];

const statusEstilo: Record<Pedido["status"], string> = {
  Pago: "border-primary/40 bg-primary/10 text-primary",
  Enviado: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  Entregue: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  Pendente: "border-amber-400/30 bg-amber-400/10 text-amber-300",
};

function PedidosTab() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-5 py-3 font-medium">Pedido</th>
            <th className="px-5 py-3 font-medium">Cliente</th>
            <th className="px-5 py-3 font-medium">Produto</th>
            <th className="px-5 py-3 font-medium">Valor</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Data</th>
          </tr>
        </thead>
        <tbody>
          {pedidosMock.map((p) => (
            <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface/60">
              <td className="px-5 py-3.5 font-medium">{p.id}</td>
              <td className="px-5 py-3.5 text-muted-foreground">{p.cliente}</td>
              <td className="px-5 py-3.5 text-muted-foreground">{p.produto}</td>
              <td className="px-5 py-3.5 tabular-nums">{formatPrice(p.valor)}</td>
              <td className="px-5 py-3.5">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium",
                    statusEstilo[p.status],
                  )}
                >
                  {p.status}
                </span>
              </td>
              <td className="px-5 py-3.5 text-muted-foreground">{p.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProdutosTab() {
  const [produtos, setProdutos] = useState<Product[]>(produtosIniciais);
  const [editando, setEditando] = useState<string | null>(null);

  const remover = (slug: string) => setProdutos((prev) => prev.filter((p) => p.slug !== slug));

  const atualizarPreco = (slug: string, price: number) =>
    setProdutos((prev) => prev.map((p) => (p.slug === slug ? { ...p, price } : p)));

  const adicionar = () => {
    const novo: Product = {
      slug: `novo-produto-${Date.now()}`,
      name: "Novo produto",
      brand: "Marca",
      tagline: "Descrição curta do produto",
      description: "Descrição completa do produto.",
      price: 0,
      category: categories[1],
      icon: Package,
      colors: [],
      specs: [],
    };
    setProdutos((prev) => [novo, ...prev]);
    setEditando(novo.slug);
  };

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
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 font-medium">Produto</th>
              <th className="px-5 py-3 font-medium">Categoria</th>
              <th className="px-5 py-3 font-medium">Preço</th>
              <th className="px-5 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.slug} className="border-b border-border last:border-0 hover:bg-surface/60">
                <td className="px-5 py-3.5">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{p.category}</td>
                <td className="px-5 py-3.5">
                  {editando === p.slug ? (
                    <input
                      type="number"
                      autoFocus
                      value={p.price}
                      onChange={(e) => atualizarPreco(p.slug, Number(e.target.value) || 0)}
                      onBlur={() => setEditando(null)}
                      className="w-28 rounded-lg border border-primary/50 bg-background px-2 py-1 text-sm outline-none"
                    />
                  ) : (
                    <span className="tabular-nums">{formatPrice(p.price)}</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditando(editando === p.slug ? null : p.slug)}
                      className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      aria-label="Editar preço"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remover(p.slug)}
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
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            O login deste painel agora é real: só entra quem tem uma conta
            marcada como administradora no banco de dados. Os pedidos abaixo
            ainda são fictícios e as alterações em produtos ficam só nesta
            sessão do navegador — a próxima etapa é ligar esta aba também ao
            banco de dados de verdade (ver plano de segurança).
          </p>
        </div>

        <h1 className="text-2xl font-bold sm:text-3xl">Visão geral</h1>

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

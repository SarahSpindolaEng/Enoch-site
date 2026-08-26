import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, LogOut, MapPin, Package, ShoppingBag, User as UserIcon } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/products";

type PedidoItem = { product_name: string; quantity: number; unit_price: number };
type Pedido = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: PedidoItem[];
};

const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function Perfil() {
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);

  useEffect(() => {
    if (!user) {
      setPedidos(null);
      return;
    }
    let active = true;
    supabase
      .from("orders")
      .select("id, status, total, created_at, order_items(product_name, quantity, unit_price)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) setPedidos((data as Pedido[] | null) ?? []);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-5 px-5 pt-32 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary/12 text-primary">
          <UserIcon className="size-6" />
        </span>
        <h1 className="text-2xl font-bold">Você ainda não entrou</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Entre ou crie uma conta para ver seus pedidos, endereços e lista de
          desejos.
        </p>
        <Link
          to="/login"
          className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
        >
          Entrar / criar conta
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 hero-glow opacity-70" />

      <section className="relative mx-auto max-w-5xl px-5 pb-24 pt-32 sm:px-8 lg:pt-44">
        <Reveal className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Minha conta</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Olá, {user.name}.</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { Icon: Package, label: "Pedidos", value: pedidos?.length ?? 0 },
            { Icon: Heart, label: "Lista de desejos", value: wishlistCount },
            { Icon: ShoppingBag, label: "No carrinho", value: cartCount },
          ].map(({ Icon, label, value }) => (
            <Reveal key={label}>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 font-display text-2xl font-bold">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <h2 className="text-lg font-semibold">Pedidos recentes</h2>
          {pedidos === null ? (
            <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
          ) : pedidos.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
              Você ainda não fez nenhum pedido.
            </p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              {pedidos.map((p, i) => (
                <div
                  key={p.id}
                  className={
                    "flex flex-wrap items-center justify-between gap-3 bg-surface px-5 py-4 text-sm" +
                    (i > 0 ? " border-t border-border" : "")
                  }
                >
                  <span className="font-medium">#{p.id.slice(0, 8)}</span>
                  <span className="text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="text-primary">{statusLabel[p.status] ?? p.status}</span>
                  <span className="font-semibold">{formatPrice(p.total)}</span>
                </div>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal className="mt-10">
          <h2 className="text-lg font-semibold">Endereço</h2>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            Endereço ainda não cadastrado.
          </div>
        </Reveal>
      </section>
    </div>
  );
}

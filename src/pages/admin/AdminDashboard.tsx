import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Check,
  ImagePlus,
  LayoutGrid,
  LogOut,
  Mail,
  Pencil,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { EnochMark } from "@/components/site/EnochLogo";
import { DoisFatores } from "@/components/site/ContaSeguranca";
import { useAdminAuth } from "@/lib/adminAuth";
import { supabase, type DbProduct } from "@/lib/supabaseClient";
import { categories, formatPrice, invalidateProducts } from "@/lib/products";
import { cn } from "@/lib/utils";

// Confere os magic bytes de verdade em vez de confiar na extensão do
// arquivo ou no accept="image/*" do input (client-side, ambos triviais de
// burlar). Cobre os formatos que o Storage/navegador realmente exibem como
// imagem.
async function pareceImagemValida(file: File): Promise<boolean> {
  const MAX_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_BYTES) return false;
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.startsWith("ffd8ff")) return true; // JPEG
  if (hex.startsWith("89504e470d0a1a0a")) return true; // PNG
  if (hex.startsWith("47494638")) return true; // GIF
  if (hex.startsWith("52494646") && hex.slice(16, 24) === "57454250")
    return true; // WEBP (RIFF....WEBP)
  return false;
}

type Profile = { id: string; name: string | null; email: string | null };
type OrderItem = { product_name: string; quantity: number; unit_price: number };
type Order = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
  tracking_code: string | null;
  tracking_url: string | null;
  order_items: OrderItem[];
};

// "pendente" não entra aqui: é só um estado transitório enquanto o Pix não
// cai (ou expira sozinho em 30min) — o admin nunca vê nem edita pedido
// nesse status, só a partir de "preparando" (pago).
const statusOptions = ["preparando", "enviado", "em_transito", "entregue", "cancelado"] as const;
const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  preparando: "Preparando pedido",
  enviado: "Pedido enviado",
  em_transito: "Em trânsito",
  entregue: "Entregue",
  cancelado: "Cancelado",
};
const statusEstilo: Record<string, string> = {
  pendente: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  preparando: "border-primary/40 bg-primary/10 text-primary",
  enviado: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  em_transito: "border-blue-400/30 bg-blue-400/10 text-blue-300",
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
          .select(
            "id, user_id, status, total, created_at, tracking_code, tracking_url, order_items(product_name, quantity, unit_price)",
          )
          // Pendente = Pix ainda não caiu (ou já expirou e virou cancelado
          // sozinho) — só entra na lista do admin depois de pago de verdade.
          .neq("status", "pendente")
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

  const mudarRastreio = (id: string, patch: { tracking_code?: string; tracking_url?: string }) => {
    setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, ...patch } : o)) ?? null);
    void supabase.from("orders").update(patch).eq("id", id);
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
            <th className="px-5 py-3 font-medium">Rastreio</th>
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
                  <p className="font-medium text-foreground">{cliente?.name ?? o.user_id.slice(0, 8)}</p>
                  {cliente?.email ? (
                    <a href={`mailto:${cliente.email}`} className="text-xs text-primary hover:brightness-110">
                      {cliente.email}
                    </a>
                  ) : null}
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
                      "rounded-full border px-2.5 py-1 text-xs font-medium outline-none",
                      statusEstilo[o.status] ?? "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <div className="grid gap-1.5">
                    <input
                      defaultValue={o.tracking_code ?? ""}
                      placeholder="Código de rastreio"
                      onBlur={(e) => mudarRastreio(o.id, { tracking_code: e.target.value || undefined })}
                      className="w-40 rounded-lg border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary/60"
                    />
                    <input
                      defaultValue={o.tracking_url ?? ""}
                      placeholder="Link de rastreio (Melhor Envio)"
                      onBlur={(e) => mudarRastreio(o.id, { tracking_url: e.target.value || undefined })}
                      className="w-40 rounded-lg border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary/60"
                    />
                  </div>
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

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "novo" | "lido";
  created_at: string;
  user_id: string | null;
};
type ContactReply = { id: string; sender: "cliente" | "admin"; message: string; created_at: string };

function MensagensTab() {
  const [mensagens, setMensagens] = useState<ContactMessage[] | null>(null);
  const [threadAberta, setThreadAberta] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, ContactReply[]>>({});
  const [resposta, setResposta] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) setMensagens((data as ContactMessage[] | null) ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  const marcarLida = (id: string) => {
    setMensagens((prev) => prev?.map((m) => (m.id === id ? { ...m, status: "lido" } : m)) ?? null);
    void supabase.from("contact_messages").update({ status: "lido" }).eq("id", id);
  };

  const abrirThread = async (m: ContactMessage) => {
    const abrindo = threadAberta !== m.id;
    setThreadAberta(abrindo ? m.id : null);
    setResposta("");
    if (m.status === "novo") marcarLida(m.id);
    if (!abrindo || respostas[m.id]) return;
    const { data } = await supabase
      .from("contact_replies")
      .select("id, sender, message, created_at")
      .eq("thread_id", m.id)
      .order("created_at", { ascending: true });
    setRespostas((prev) => ({ ...prev, [m.id]: (data as ContactReply[] | null) ?? [] }));
  };

  const enviarResposta = async (threadId: string) => {
    if (!resposta.trim()) return;
    setEnviando(true);
    const { data } = await supabase
      .from("contact_replies")
      .insert({ thread_id: threadId, sender: "admin", message: resposta.trim() })
      .select()
      .single();
    setEnviando(false);
    if (data) {
      setRespostas((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), data as ContactReply] }));
      setResposta("");
    }
  };

  // Apaga a mensagem e todas as respostas (contact_replies tem cascade) —
  // usado quando o atendimento termina, pra não acumular histórico de chat
  // sem necessidade nem guardar dado pessoal além do preciso.
  const encerrar = (id: string) => {
    setMensagens((prev) => prev?.filter((m) => m.id !== id) ?? null);
    if (threadAberta === id) setThreadAberta(null);
    void supabase.from("contact_messages").delete().eq("id", id);
  };

  if (mensagens === null) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (mensagens.length === 0)
    return (
      <p className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
        Nenhuma mensagem ainda.
      </p>
    );

  return (
    <div className="grid gap-3">
      {mensagens.map((m) => (
        <div
          key={m.id}
          className={cn(
            "rounded-2xl border p-5",
            m.status === "novo" ? "border-primary/40 bg-primary/5" : "border-border bg-surface",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => void abrirThread(m)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                {m.status === "novo" ? (
                  <span className="size-2 shrink-0 rounded-full bg-primary" />
                ) : null}
                {m.subject}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {m.name} · {m.email} · {new Date(m.created_at).toLocaleString("pt-BR")}
                {!m.user_id ? " · sem conta (não recebe resposta no site)" : ""}
              </p>
            </button>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => encerrar(m.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-red-400/50 hover:text-red-400"
              >
                <Trash2 className="size-3.5" />
                Encerrar conversa
              </button>
            </div>
          </div>
          {threadAberta === m.id ? (
            // Mesmo layout do chat que o cliente vê: a mensagem original
            // entra como o primeiro balão da conversa, seguida das
            // respostas em ordem — não só um texto solto acima do chat.
            <div className="mt-4 border-t border-border pt-4">
              <div className="grid gap-2">
                <div className="max-w-[80%] rounded-xl bg-background px-3.5 py-2 text-xs leading-relaxed text-foreground">
                  {m.message}
                </div>
                {(respostas[m.id] ?? []).map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      "max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed",
                      r.sender === "admin"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-background text-foreground",
                    )}
                  >
                    {r.message}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  placeholder={m.user_id ? "Responder…" : "Responder (cliente sem conta não verá isso no site)"}
                  className="flex-1 rounded-full border border-input bg-background px-3.5 py-2 text-xs outline-none focus:border-primary/60"
                />
                <button
                  type="button"
                  onClick={() => void enviarResposta(m.id)}
                  disabled={enviando || !resposta.trim()}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  Enviar
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{m.message}</p>
          )}
        </div>
      ))}
    </div>
  );
}

type Especificacao = { label: string; value: string };

type Cor = { name: string; value: string };

type Rascunho = {
  name: string;
  brand: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  old_price: number | null;
  badge: string | null;
  stock: number;
  installments: number;
  is_active: boolean;
  image_url: string | null;
  specs: Especificacao[];
  colors: Cor[];
};

function paraRascunho(p: DbProduct): Rascunho {
  return {
    name: p.name,
    brand: p.brand,
    category: p.category,
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    price: p.price,
    old_price: p.old_price,
    badge: p.badge,
    stock: p.stock,
    installments: p.installments,
    is_active: p.is_active,
    image_url: p.image_url,
    specs: p.specs ?? [],
    colors: p.colors ?? [],
  };
}

const rascunhoVazio: Rascunho = {
  name: "",
  brand: "",
  category: produtoCategorias[0],
  tagline: "",
  description: "",
  price: 0,
  old_price: null,
  badge: null,
  stock: 0,
  installments: 12,
  is_active: true,
  image_url: null,
  specs: [],
  colors: [],
};

function ProdutosTab() {
  const [produtos, setProdutos] = useState<DbProduct[] | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [desfazer, setDesfazer] = useState<{ produto: DbProduct; timeoutId: number } | null>(null);

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

  // Exclusão com desfazer: some da lista na hora, mas só apaga do banco de
  // verdade alguns segundos depois — dá tempo de arrepender sem perder nada.
  const remover = (produto: DbProduct) => {
    setProdutos((prev) => prev?.filter((p) => p.id !== produto.id) ?? null);
    const timeoutId = window.setTimeout(async () => {
      await supabase.from("products").delete().eq("id", produto.id);
      invalidateProducts();
      setDesfazer((atual) => (atual?.produto.id === produto.id ? null : atual));
    }, 5000);
    setDesfazer({ produto, timeoutId });
  };

  const desfazerExclusao = () => {
    if (!desfazer) return;
    window.clearTimeout(desfazer.timeoutId);
    setProdutos((prev) => [desfazer.produto, ...(prev ?? [])]);
    setDesfazer(null);
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
      const nomeSeguro = imagemArquivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const caminho = `${Date.now()}-${nomeSeguro}`;
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

    invalidateProducts();
    setSalvando(false);
    cancelar();
  };

  if (produtos === null) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div>
      {desfazer ? (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-3 text-sm">
          <span>
            <strong>{desfazer.produto.name}</strong> removido.
          </span>
          <button
            type="button"
            onClick={desfazerExclusao}
            className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
          >
            Desfazer
          </button>
        </div>
      ) : null}

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
                        onClick={() => remover(p)}
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

  const atualizarSpec = (i: number, patch: Partial<Especificacao>) => {
    const specs = rascunho.specs.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    setRascunho({ ...rascunho, specs });
  };
  const adicionarSpec = () => setRascunho({ ...rascunho, specs: [...rascunho.specs, { label: "", value: "" }] });
  const removerSpec = (i: number) =>
    setRascunho({ ...rascunho, specs: rascunho.specs.filter((_, idx) => idx !== i) });

  const atualizarCor = (i: number, patch: Partial<Cor>) => {
    const colors = rascunho.colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c));
    setRascunho({ ...rascunho, colors });
  };
  const adicionarCor = () =>
    setRascunho({ ...rascunho, colors: [...rascunho.colors, { name: "", value: "#000000" }] });
  const removerCor = (i: number) =>
    setRascunho({ ...rascunho, colors: rascunho.colors.filter((_, idx) => idx !== i) });

  return (
    <>
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
            onChange={async (e) => {
              const file = e.target.files?.[0] ?? null;
              e.target.value = "";
              if (!file) return setImagemArquivo(null);
              if (!(await pareceImagemValida(file))) {
                alert("Arquivo inválido: envie uma imagem JPEG, PNG, GIF ou WEBP de até 5MB.");
                return;
              }
              setImagemArquivo(file);
            }}
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
    <tr className="border-b border-border bg-primary/5">
      <td colSpan={7} className="px-5 pb-5">
        <div className="grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Subtítulo (aparece no card do produto)
            </span>
            <input
              value={rascunho.tagline}
              onChange={(e) => setRascunho({ ...rascunho, tagline: e.target.value })}
              placeholder="Frase curta que resume o produto"
              className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Descrição completa
            </span>
            <textarea
              value={rascunho.description}
              onChange={(e) => setRascunho({ ...rascunho, description: e.target.value })}
              rows={3}
              placeholder="Texto que aparece na página do produto"
              className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Parcelamento (sem juros)
            </span>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={24}
                value={rascunho.installments}
                onChange={(e) =>
                  setRascunho({ ...rascunho, installments: Math.max(1, Number(e.target.value) || 1) })
                }
                className="w-20 rounded-lg border border-input bg-surface px-3 py-2 text-sm outline-none"
              />
              <span className="text-xs text-muted-foreground">vezes</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Selo (badge, opcional)
            </span>
            <input
              value={rascunho.badge ?? ""}
              onChange={(e) => setRascunho({ ...rascunho, badge: e.target.value || null })}
              placeholder="Ex: NOVO"
              className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Preço antigo (riscado, opcional)
            </span>
            <input
              type="number"
              value={rascunho.old_price ?? ""}
              onChange={(e) =>
                setRascunho({ ...rascunho, old_price: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="Ex: 1599"
              className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>

          <div className="sm:col-span-2">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Cores disponíveis
            </span>
            <div className="mt-1.5 space-y-2">
              {rascunho.colors.map((cor, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(cor.value) ? cor.value : "#000000"}
                    onChange={(e) => atualizarCor(i, { value: e.target.value })}
                    className="size-9 shrink-0 cursor-pointer rounded-lg border border-input bg-surface p-0.5"
                    aria-label="Escolher cor"
                  />
                  <input
                    value={cor.name}
                    onChange={(e) => atualizarCor(i, { name: e.target.value })}
                    placeholder="Ex: Preto grafite"
                    className="flex-1 rounded-lg border border-input bg-surface px-3 py-1.5 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removerCor(i)}
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground hover:border-red-400/50 hover:text-red-400"
                    aria-label="Remover cor"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={adicionarCor}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
              >
                <Plus className="size-3.5" />
                Adicionar cor
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Especificações técnicas
            </span>
            <div className="mt-1.5 space-y-2">
              {rascunho.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={spec.label}
                    onChange={(e) => atualizarSpec(i, { label: e.target.value })}
                    placeholder="Ex: Autonomia"
                    className="w-1/3 rounded-lg border border-input bg-surface px-3 py-1.5 text-sm outline-none"
                  />
                  <input
                    value={spec.value}
                    onChange={(e) => atualizarSpec(i, { value: e.target.value })}
                    placeholder="Ex: 40 horas"
                    className="flex-1 rounded-lg border border-input bg-surface px-3 py-1.5 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removerSpec(i)}
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground hover:border-red-400/50 hover:text-red-400"
                    aria-label="Remover especificação"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={adicionarSpec}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
              >
                <Plus className="size-3.5" />
                Adicionar especificação
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
    </>
  );
}

export function AdminDashboard() {
  const { isAdmin, precisaAtivar2FA, loading, logout, recarregar } = useAdminAuth();
  const [aba, setAba] = useState<"pedidos" | "produtos" | "mensagens">("pedidos");

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Verificando acesso…
      </div>
    );
  }

  if (precisaAtivar2FA) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
        <div className="w-full max-w-md">
          <div className="flex justify-center">
            <EnochMark className="h-8" />
          </div>
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-300">
            <p className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="size-4 shrink-0" />
              2FA obrigatório para administradores
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-amber-300/90">
              Por segurança, só é possível usar o painel administrativo com a autenticação em duas
              etapas ativada nesta conta. Ative agora pra continuar — leva menos de um minuto.
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-surface p-1">
            <DoisFatores onAtivado={recarregar} />
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-6 mx-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
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
          Pedidos e produtos aqui são os dados reais do banco — preço, estoque, nome e imagem
          editados aqui já valem direto na vitrine pública e no checkout.
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
          <button
            type="button"
            onClick={() => setAba("mensagens")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
              aba === "mensagens"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Mail className="size-4" />
            Mensagens
          </button>
        </div>

        <div className="mt-6">
          {aba === "pedidos" ? <PedidosTab /> : aba === "produtos" ? <ProdutosTab /> : <MensagensTab />}
        </div>
      </main>
    </div>
  );
}

import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

type Thread = {
  id: string;
  subject: string;
  message: string;
  created_at: string;
  last_read_by_customer: string | null;
  contact_replies: { sender: "cliente" | "admin"; created_at: string }[];
};
type Reply = { id: string; thread_id: string; sender: "cliente" | "admin"; message: string; created_at: string };

const OpenThreadContext = createContext<(threadId: string) => void>(() => {});

// Chamado depois de mandar uma mensagem de suporte (ex: no perfil) — abre o
// chat direto naquela conversa, em qualquer página logada.
export function useOpenSupportThread() {
  return useContext(OpenThreadContext);
}

// Bolão de chat flutuante — só existe pra quem já está logado (conversa é
// vinculada à conta) e só aparece quando existe pelo menos uma conversa,
// em qualquer página do site. Envolve as rotas (ver Layout.tsx) pra poder
// ser aberto de qualquer página via useOpenSupportThread().
export function SupportChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [threadAberta, setThreadAberta] = useState<string | null>(null);
  const [resposta, setResposta] = useState("");
  const [enviando, setEnviando] = useState(false);

  const carregarThreads = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("contact_messages")
      .select("id, subject, message, created_at, last_read_by_customer, contact_replies(sender, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setThreads((data as Thread[] | null) ?? []);
  };

  useEffect(() => {
    if (user) void carregarThreads();
    else {
      setThreads([]);
      setAberto(false);
    }
  }, [user]);

  const abrirThread = async (threadId: string) => {
    setThreadAberta(threadId);
    const { data } = await supabase
      .from("contact_replies")
      .select("id, thread_id, sender, message, created_at")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    setReplies((prev) => ({ ...prev, [threadId]: (data as Reply[] | null) ?? [] }));
    const agora = new Date().toISOString();
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, last_read_by_customer: agora } : t)));
    void supabase.from("contact_messages").update({ last_read_by_customer: agora }).eq("id", threadId);
  };

  // Exposto via contexto: qualquer página logada (ex: o formulário de
  // suporte no perfil) pode chamar isso pra abrir o chat direto na
  // conversa recém-criada, sem precisar montar o SupportChat de novo.
  const abrirDeFora = async (threadId: string) => {
    await carregarThreads();
    setAberto(true);
    await abrirThread(threadId);
  };

  const enviarResposta = async (e: FormEvent) => {
    e.preventDefault();
    if (!threadAberta || !resposta.trim()) return;
    setEnviando(true);
    const { data } = await supabase
      .from("contact_replies")
      .insert({ thread_id: threadAberta, sender: "cliente", message: resposta.trim() })
      .select()
      .single();
    setEnviando(false);
    if (data) {
      setReplies((prev) => ({ ...prev, [threadAberta]: [...(prev[threadAberta] ?? []), data as Reply] }));
      setResposta("");
    }
  };

  const threadTemNaoLida = (t: Thread) =>
    t.contact_replies.some(
      (r) => r.sender === "admin" && (!t.last_read_by_customer || r.created_at > t.last_read_by_customer),
    );
  // Sem realtime: a badge é recalculada toda vez que a lista de threads
  // recarrega (ex: trocar de página) — não atualiza sozinha com a página aberta.
  const naoLidas = threads.filter(threadTemNaoLida).length;
  const threadAtual = threads.find((t) => t.id === threadAberta);
  const mostrarBolao = Boolean(user) && (threads.length > 0 || aberto);

  return (
    <OpenThreadContext.Provider value={(id) => void abrirDeFora(id)}>
      {children}

      {mostrarBolao ? (
        <div className="fixed bottom-6 right-6 z-50">
          {aberto ? (
            <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
                <div className="flex items-center gap-2">
                  {threadAberta ? (
                    <button
                      type="button"
                      onClick={() => setThreadAberta(null)}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      ← Voltar
                    </button>
                  ) : (
                    <p className="text-sm font-semibold">Suporte</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {threadAberta && threadAtual ? (
                <>
                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    <div className="rounded-xl border border-border bg-background p-3 text-xs">
                      <p className="font-medium">{threadAtual.subject}</p>
                      <p className="mt-1 text-muted-foreground">{threadAtual.message}</p>
                    </div>
                    {(replies[threadAberta] ?? []).map((r) => (
                      <div
                        key={r.id}
                        className={cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                          r.sender === "admin"
                            ? "bg-primary/10 text-foreground"
                            : "ml-auto bg-primary text-primary-foreground",
                        )}
                      >
                        {r.message}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={enviarResposta} className="flex gap-2 border-t border-border p-3">
                    <input
                      value={resposta}
                      onChange={(e) => setResposta(e.target.value)}
                      placeholder="Escreva uma mensagem…"
                      className="flex-1 rounded-full border border-input bg-background px-3.5 py-2 text-xs outline-none focus:border-primary/60"
                    />
                    <button
                      type="submit"
                      disabled={enviando || !resposta.trim()}
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-60"
                    >
                      <Send className="size-3.5" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 overflow-y-auto p-3">
                  {threads.length === 0 ? (
                    <p className="p-3 text-center text-xs text-muted-foreground">Nenhuma conversa ainda.</p>
                  ) : (
                    <div className="grid gap-2">
                      {threads.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => void abrirThread(t.id)}
                          className="flex items-start justify-between gap-2 rounded-xl border border-border bg-background p-3 text-left text-xs hover:border-primary/40"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{t.subject}</p>
                            <p className="mt-0.5 truncate text-muted-foreground">{t.message}</p>
                          </div>
                          {threadTemNaoLida(t) ? (
                            <span className="mt-0.5 size-2 shrink-0 rounded-full bg-primary" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setAberto((a) => !a);
              if (!aberto) void carregarThreads();
            }}
            className="relative grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:brightness-110"
          >
            <MessageCircle className="size-6" />
            {!aberto && naoLidas > 0 ? (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {naoLidas}
              </span>
            ) : null}
          </button>
        </div>
      ) : null}
    </OpenThreadContext.Provider>
  );
}

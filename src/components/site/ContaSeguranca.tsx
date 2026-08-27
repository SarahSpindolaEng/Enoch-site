import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Lock, Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { vezesVazada } from "@/lib/pwnedPassword";
import { cn } from "@/lib/utils";

const LIMITE_VAZAMENTOS = 100;

function Cartao({ titulo, Icon, children }: { titulo: string; Icon: typeof UserIcon; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-primary/12 text-primary">
          <Icon className="size-4" />
        </span>
        <h3 className="text-sm font-semibold">{titulo}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Mensagem({ msg }: { msg: { tipo: "ok" | "erro"; texto: string } | null }) {
  if (!msg) return null;
  return (
    <p
      className={cn(
        "mt-3 rounded-xl border px-4 py-2.5 text-xs",
        msg.tipo === "ok"
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {msg.texto}
    </p>
  );
}

function DadosPessoais() {
  const { user } = useAuth();
  const [nome, setNome] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSalvando(true);
    const emailMudou = email.trim() !== user?.email;
    const { error } = await supabase.auth.updateUser({
      data: { name: nome.trim() },
      ...(emailMudou ? { email: email.trim() } : {}),
    });
    setSalvando(false);
    if (error) return setMsg({ tipo: "erro", texto: "Não foi possível salvar. Tente novamente." });
    setMsg({
      tipo: "ok",
      texto: emailMudou
        ? "Nome atualizado. Enviamos um link de confirmação para o e-mail atual e para o novo — a troca só vale depois de confirmar os dois."
        : "Dados atualizados.",
    });
  };

  return (
    <Cartao titulo="Dados pessoais" Icon={UserIcon}>
      <form className="grid gap-3" onSubmit={salvar}>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nome</span>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3.5 py-2.5">
            <UserIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">E-mail</span>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3.5 py-2.5">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>
        <button
          type="submit"
          disabled={salvando}
          className="mt-1 w-fit rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-60"
        >
          {salvando ? "Salvando…" : "Salvar dados"}
        </button>
      </form>
      <Mensagem msg={msg} />
    </Cartao>
  );
}

function AlterarSenha() {
  const [senhaNova, setSenhaNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (senhaNova.length < 6) return setMsg({ tipo: "erro", texto: "A senha precisa ter pelo menos 6 caracteres." });
    if (senhaNova !== confirmar) return setMsg({ tipo: "erro", texto: "As senhas não coincidem." });

    setSalvando(true);
    const vazamentos = await vezesVazada(senhaNova);
    if (vazamentos > LIMITE_VAZAMENTOS) {
      setSalvando(false);
      return setMsg({
        tipo: "erro",
        texto: `Essa senha já apareceu em ${vazamentos.toLocaleString("pt-BR")} vazamentos conhecidos. Escolha outra.`,
      });
    }

    const { error } = await supabase.auth.updateUser({ password: senhaNova });
    setSalvando(false);
    if (error) return setMsg({ tipo: "erro", texto: "Não foi possível trocar a senha. Tente novamente." });
    setSenhaNova("");
    setConfirmar("");
    setMsg({ tipo: "ok", texto: "Senha alterada com sucesso." });
  };

  return (
    <Cartao titulo="Alterar senha" Icon={Lock}>
      <form className="grid gap-3" onSubmit={salvar}>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nova senha</span>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3.5 py-2.5">
            <Lock className="size-4 shrink-0 text-muted-foreground" />
            <input
              required
              minLength={6}
              type="password"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Confirmar nova senha</span>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3.5 py-2.5">
            <Lock className="size-4 shrink-0 text-muted-foreground" />
            <input
              required
              minLength={6}
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>
        <button
          type="submit"
          disabled={salvando}
          className="mt-1 w-fit rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-60"
        >
          {salvando ? "Trocando…" : "Trocar senha"}
        </button>
      </form>
      <Mensagem msg={msg} />
    </Cartao>
  );
}

type Fator = { id: string; status: string };

export function DoisFatores({ onAtivado }: { onAtivado?: () => void } = {}) {
  const [fatores, setFatores] = useState<Fator[] | null>(null);
  const [inscrevendo, setInscrevendo] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const carregarFatores = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFatores(data?.totp ?? []);
  };

  useEffect(() => {
    void carregarFatores();
  }, []);

  const ativado = fatores?.some((f) => f.status === "verified") ?? false;

  const iniciarAtivacao = async () => {
    setMsg(null);
    setCarregando(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setCarregando(false);
    if (error || !data) return setMsg({ tipo: "erro", texto: "Não foi possível iniciar a ativação." });
    setInscrevendo({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirmarAtivacao = async (e: FormEvent) => {
    e.preventDefault();
    if (!inscrevendo) return;
    setCarregando(true);
    setMsg(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: inscrevendo.factorId,
      code: codigo,
    });
    setCarregando(false);
    if (error) return setMsg({ tipo: "erro", texto: "Código inválido. Confira o app e tente de novo." });
    setInscrevendo(null);
    setCodigo("");
    setMsg({ tipo: "ok", texto: "Autenticação em duas etapas ativada." });
    void carregarFatores();
    onAtivado?.();
  };

  const cancelarAtivacao = async () => {
    if (inscrevendo) await supabase.auth.mfa.unenroll({ factorId: inscrevendo.factorId });
    setInscrevendo(null);
    setCodigo("");
    setMsg(null);
  };

  const desativar = async (factorId: string) => {
    setCarregando(true);
    await supabase.auth.mfa.unenroll({ factorId });
    setCarregando(false);
    setMsg({ tipo: "ok", texto: "Autenticação em duas etapas desativada." });
    void carregarFatores();
  };

  return (
    <Cartao titulo="Autenticação em duas etapas (2FA)" Icon={ShieldCheck}>
      {fatores === null ? (
        <p className="text-xs text-muted-foreground">Carregando…</p>
      ) : inscrevendo ? (
        <form className="grid gap-3" onSubmit={confirmarAtivacao}>
          <p className="text-xs text-muted-foreground">
            Escaneie o QR code com um app autenticador (Google Authenticator, Authy, etc.) e digite o
            código de 6 dígitos gerado.
          </p>
          <img
            src={inscrevendo.qrCode}
            alt="QR code para ativar autenticação em duas etapas"
            className="mx-auto size-40 rounded-xl border border-border bg-white p-2"
          />
          <p className="break-all text-center text-[11px] text-muted-foreground">
            Não consegue escanear? Digite manualmente: <span className="font-mono">{inscrevendo.secret}</span>
          </p>
          <input
            required
            autoFocus
            inputMode="numeric"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-center text-lg tracking-[0.4em] outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={carregando || codigo.length !== 6}
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-60"
            >
              {carregando ? "Confirmando…" : "Confirmar ativação"}
            </button>
            <button
              type="button"
              onClick={cancelarAtivacao}
              className="rounded-full border border-border px-5 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : ativado ? (
        <div>
          <p className="flex items-center gap-2 text-xs text-primary">
            <ShieldCheck className="size-4" />
            Ativada — sua conta pede um código extra a cada login.
          </p>
          <button
            type="button"
            onClick={() => {
              const fator = fatores.find((f) => f.status === "verified");
              if (fator) void desativar(fator.id);
            }}
            disabled={carregando}
            className="mt-3 rounded-full border border-border px-5 py-2 text-xs text-muted-foreground transition-colors hover:border-red-400/50 hover:text-red-400 disabled:opacity-60"
          >
            Desativar 2FA
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-muted-foreground">
            Adicione uma camada extra: além da senha, o login vai pedir um código gerado por um app
            autenticador no seu celular.
          </p>
          <button
            type="button"
            onClick={iniciarAtivacao}
            disabled={carregando}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-60"
          >
            <KeyRound className="size-3.5" />
            {carregando ? "Um instante…" : "Ativar 2FA"}
          </button>
        </div>
      )}
      <Mensagem msg={msg} />
    </Cartao>
  );
}

export function ContaSeguranca() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <DadosPessoais />
      <AlterarSenha />
      <DoisFatores />
    </div>
  );
}

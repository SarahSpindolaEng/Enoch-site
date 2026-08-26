import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Lock, Mail, ShieldAlert, ShieldCheck, User as UserIcon } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { EnochMark } from "@/components/site/EnochLogo";
import { Turnstile } from "@/components/site/Turnstile";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { vezesVazada } from "@/lib/pwnedPassword";
import { cn } from "@/lib/utils";

export function Login() {
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [mfaPendente, setMfaPendente] = useState(false);
  const [codigoMfa, setCodigoMfa] = useState("");
  const [sugerir2fa, setSugerir2fa] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const { signIn, signUp, verifyMfaCode } = useAuth();
  const navigate = useNavigate();

  // Depois de qualquer login/cadastro concluído: se a conta ainda não tem
  // 2FA, sugere ativar em vez de já mandar direto pro perfil.
  const seguirParaPerfilOuSugerir2fa = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const tem2fa = (data?.totp.length ?? 0) > 0;
    if (tem2fa) {
      navigate("/perfil");
    } else {
      setSugerir2fa(true);
    }
  };

  const handleVerifyMfa = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const { error } = await verifyMfaCode(codigoMfa);
    setCarregando(false);
    if (error) return setErro(error);
    navigate("/perfil");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setAviso(null);

    if (!captchaToken) {
      return setErro("Aguarde a verificação de segurança terminar de carregar e tente de novo.");
    }
    setCarregando(true);

    if (modo === "criar") {
      // Abaixo disso, uma ou duas ocorrências podem ser coincidência de hash
      // e não valem travar o cadastro — mas qualquer senha realmente comum
      // já passa longe desse número.
      const LIMITE_VAZAMENTOS = 100;
      const vazamentos = await vezesVazada(senha);
      if (vazamentos > LIMITE_VAZAMENTOS) {
        setCarregando(false);
        return setErro(
          `Essa senha já apareceu em ${vazamentos.toLocaleString("pt-BR")} vazamentos conhecidos. Escolha uma senha diferente, que você não use em outro site.`,
        );
      }

      const { error, needsEmailConfirmation } = await signUp(email, senha, nome, captchaToken);
      setCarregando(false);
      setCaptchaToken(null);
      setTurnstileKey((k) => k + 1);
      if (error) return setErro(error);
      if (needsEmailConfirmation) {
        setAviso(
          "Conta criada! Enviamos um link de confirmação para o seu e-mail — confirme para poder entrar.",
        );
        setModo("entrar");
        return;
      }
      // Conta acabada de criar nunca tem 2FA ainda — sugere de cara.
      setSugerir2fa(true);
      return;
    }

    const { error, mfaRequired } = await signIn(email, senha, captchaToken);
    setCarregando(false);
    setCaptchaToken(null);
    setTurnstileKey((k) => k + 1);
    if (error) return setErro(error);
    if (mfaRequired) {
      setMfaPendente(true);
      return;
    }
    void seguirParaPerfilOuSugerir2fa();
  };

  if (sugerir2fa) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-background/85 px-5 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Proteja sua conta</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sua conta ainda não tem autenticação em duas etapas (2FA). Com ela ativa, mesmo que
            alguém descubra sua senha, não consegue entrar sem o código do seu celular.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate("/perfil")}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
            >
              Ativar agora
            </button>
            <button
              type="button"
              onClick={() => navigate("/perfil")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 pb-20 pt-32 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 hero-glow opacity-70" />

      <Reveal className="relative w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-8">
          <div className="flex justify-center">
            <EnochMark className="h-8" />
          </div>

          {mfaPendente ? (
            <form className="mt-8 grid gap-4" onSubmit={handleVerifyMfa}>
              <div className="text-center">
                <span className="mx-auto grid size-11 place-items-center rounded-full bg-primary/12 text-primary">
                  <KeyRound className="size-5" />
                </span>
                <h2 className="mt-3 text-base font-semibold">Autenticação em duas etapas</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Digite o código de 6 dígitos do seu app autenticador.
                </p>
              </div>

              <input
                required
                autoFocus
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={codigoMfa}
                onChange={(e) => setCodigoMfa(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-primary/60"
              />

              {erro ? (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {erro}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={carregando || codigoMfa.length !== 6}
                className="rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-60"
              >
                {carregando ? "Verificando…" : "Confirmar"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMfaPendente(false);
                  setCodigoMfa("");
                  setErro(null);
                }}
                className="text-center text-xs text-muted-foreground hover:text-foreground"
              >
                ← Voltar
              </button>
            </form>
          ) : (
            <>
              <div className="mt-6 flex rounded-full border border-border bg-background p-1 text-sm">
                {(["entrar", "criar"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setModo(m);
                      setErro(null);
                      setAviso(null);
                    }}
                    className={cn(
                      "flex-1 rounded-full py-2 font-medium transition-all duration-300",
                      modo === m ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {m === "entrar" ? "Entrar" : "Criar conta"}
                  </button>
                ))}
              </div>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            {modo === "criar" ? (
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Nome
                </span>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-3 focus-within:border-primary/60 focus-within:shadow-[0_0_28px_-14px_var(--primary)]">
                  <UserIcon className="size-4 text-muted-foreground" />
                  <input
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </label>
            ) : null}

            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                E-mail
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-3 focus-within:border-primary/60 focus-within:shadow-[0_0_28px_-14px_var(--primary)]">
                <Mail className="size-4 text-muted-foreground" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Senha
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-3 focus-within:border-primary/60 focus-within:shadow-[0_0_28px_-14px_var(--primary)]">
                <Lock className="size-4 text-muted-foreground" />
                <input
                  required
                  minLength={6}
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>

            <div className="flex justify-center">
              <Turnstile key={turnstileKey} onToken={setCaptchaToken} />
            </div>

            {erro ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {erro}
              </p>
            ) : null}

            {aviso ? (
              <p className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                {aviso}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={carregando || !captchaToken}
              className="mt-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_40px_-10px_var(--primary)] active:scale-[0.99] disabled:opacity-60"
            >
              {carregando
                ? "Um instante…"
                : modo === "entrar"
                  ? "Entrar"
                  : "Criar minha conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Sua conta é protegida por autenticação real — seus dados ficam
            salvos com segurança, não só no navegador.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-xs leading-relaxed text-muted-foreground">
            <div className="flex items-center gap-2 text-amber-300">
              <ShieldAlert className="size-4 shrink-0" />
              <span className="font-semibold uppercase tracking-[0.08em]">Segurança da sua conta</span>
            </div>
            <ul className="mt-3 list-disc space-y-1.5 pl-4">
              <li>Não reutilize uma senha que você já usa em outro site.</li>
              <li>
                Se o Google, seu navegador ou um gerenciador de senhas avisar que essa senha já
                apareceu em um vazamento, troque por uma nova aqui mesmo.
              </li>
              <li>Evite senhas óbvias (nome, data de nascimento, sequências como "123456").</li>
            </ul>
          </div>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}

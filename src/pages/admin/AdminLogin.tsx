import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
import { EnochMark } from "@/components/site/EnochLogo";
import { Turnstile } from "@/components/site/Turnstile";
import { useAuth } from "@/lib/auth";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mfaPendente, setMfaPendente] = useState(false);
  const [codigoMfa, setCodigoMfa] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const { signIn, verifyMfaCode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!captchaToken) {
      return setErro("Aguarde a verificação de segurança terminar de carregar e tente de novo.");
    }
    setCarregando(true);
    const { error, mfaRequired } = await signIn(email, senha, captchaToken);
    setCarregando(false);
    setCaptchaToken(null);
    setTurnstileKey((k) => k + 1);
    if (error) return setErro(error);
    if (mfaRequired) {
      setMfaPendente(true);
      return;
    }
    navigate("/admin");
  };

  const handleVerifyMfa = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const { error } = await verifyMfaCode(codigoMfa);
    setCarregando(false);
    if (error) return setErro(error);
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="pointer-events-none fixed inset-0 hero-glow opacity-50" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-8">
          <div className="flex justify-center">
            <EnochMark className="h-8" />
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
            <ShieldCheck className="size-3.5" />
            Painel administrativo
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
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
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

            <button
              type="submit"
              disabled={carregando || !captchaToken}
              className="mt-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_40px_-10px_var(--primary)] active:scale-[0.99] disabled:opacity-60"
            >
              {carregando ? "Entrando…" : "Entrar no painel"}
            </button>
          </form>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Login real: use a mesma conta criada no site e promovida a
            administrador no banco de dados.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  );
}

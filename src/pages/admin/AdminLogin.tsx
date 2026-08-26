import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { EnochMark } from "@/components/site/EnochLogo";
import { supabase } from "@/lib/supabaseClient";

function traduzErro(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  return "Não foi possível entrar. Tente novamente.";
}

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) return setErro(traduzErro(error.message));
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

            {erro ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {erro}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={carregando}
              className="mt-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_40px_-10px_var(--primary)] active:scale-[0.99] disabled:opacity-60"
            >
              {carregando ? "Entrando…" : "Entrar no painel"}
            </button>
          </form>

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

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type User = { id: string; name: string; email: string };

type AuthResult = { error: string | null; needsEmailConfirmation?: boolean; mfaRequired?: boolean };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  verifyMfaCode: (code: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function sessionToUser(session: Session | null): User | null {
  if (!session?.user) return null;
  const { id, email, user_metadata } = session.user;
  const name = (user_metadata?.name as string | undefined)?.trim();
  return {
    id,
    email: email ?? "",
    name: name || email?.split("@")[0] || "Cliente",
  };
}

// Com 2FA ativo, o login por senha só deixa a sessão no nível "aal1" —
// currentLevel só bate com nextLevel depois do código do app autenticador
// ser confirmado. Sem 2FA na conta, os dois níveis já vêm iguais.
async function sessionEstaCompleta(session: Session | null): Promise<boolean> {
  if (!session) return false;
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return !data || data.currentLevel === data.nextLevel;
}

// Traduz as mensagens de erro do Supabase Auth (sempre em inglês) para
// algo que a pessoa que está comprando realmente entende.
function traduzErro(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("user already registered") || m.includes("already registered"))
    return "Este e-mail já tem uma conta. Tente entrar em vez de criar uma nova.";
  if (m.includes("password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid email")) return "E-mail inválido.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar — enviamos um link para sua caixa de entrada.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Muitas tentativas seguidas. Aguarde um instante e tente de novo.";
  return "Algo deu errado. Tente novamente em instantes.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function sincronizar(session: Session | null) {
      const completa = await sessionEstaCompleta(session);
      if (!active) return;
      setUser(completa ? sessionToUser(session) : null);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => sincronizar(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void sincronizar(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue["signUp"] = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return { error: traduzErro(error.message) };
    // Se o projeto exige confirmação de e-mail, a sessão vem nula aqui —
    // a pessoa só entra de verdade depois de clicar no link do e-mail.
    setUser(sessionToUser(data.session));
    return { error: null, needsEmailConfirmation: !data.session };
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: traduzErro(error.message) };
    if (await sessionEstaCompleta(data.session)) {
      setUser(sessionToUser(data.session));
      return { error: null };
    }
    // Conta tem 2FA ativo: senha certa, mas ainda falta o código do app
    // autenticador antes de considerar a pessoa logada de verdade.
    return { error: null, mfaRequired: true };
  };

  const verifyMfaCode: AuthContextValue["verifyMfaCode"] = async (code) => {
    const { data: fatores, error: erroFatores } = await supabase.auth.mfa.listFactors();
    const fator = fatores?.totp[0];
    if (erroFatores || !fator) return { error: "Nenhum código de autenticação pendente. Tente entrar de novo." };

    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: fator.id, code });
    if (error) return { error: "Código inválido. Confira o app autenticador e tente de novo." };

    const { data } = await supabase.auth.getSession();
    setUser(sessionToUser(data.session));
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, verifyMfaCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

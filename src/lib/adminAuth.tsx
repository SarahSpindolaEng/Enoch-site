import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

type AdminAuthContextValue = {
  isAdmin: boolean;
  // Conta é admin (role no banco), mas ainda não tem 2FA cadastrado —
  // painel deve mostrar a tela de ativação obrigatória, não os dados.
  precisaAtivar2FA: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  recarregar: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

// Autenticação do painel administrativo — usa a mesma conta (Supabase Auth)
// do site, mas só libera o painel se a coluna `role` do perfil dessa conta
// for 'admin' no banco. Essa coluna nunca pode ser alterada pelo próprio
// usuário (nem pela API, nem manipulando o navegador) — só um admin do
// projeto Supabase pode promover alguém via SQL direto.
//
// 2FA é obrigatório pra admin, e não só nesta tela: a função is_admin() no
// banco (usada em TODAS as policies de admin — produtos, pedidos,
// mensagens, storage) também exige aal2. Então mesmo que alguém burle essa
// checagem aqui e force isAdmin=true no navegador, nenhuma chamada ao
// Supabase realmente funciona sem o 2FA completo na sessão — a trava de
// verdade é no banco, isso aqui é só a experiência de tela.
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [precisaAtivar2FA, setPrecisaAtivar2FA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;

    async function checkRole() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session?.user) {
        if (active) {
          setIsAdmin(false);
          setPrecisaAtivar2FA(false);
          setLoading(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        if (active) {
          setIsAdmin(false);
          setPrecisaAtivar2FA(false);
          setLoading(false);
        }
        return;
      }

      const { data: fatores } = await supabase.auth.mfa.listFactors();
      const tem2fa = (fatores?.totp ?? []).some((f) => f.status === "verified");
      if (!tem2fa) {
        if (active) {
          setIsAdmin(false);
          setPrecisaAtivar2FA(true);
          setLoading(false);
        }
        return;
      }

      // Conta é admin e tem 2FA cadastrado — só falta confirmar que a
      // sessão ATUAL já passou pelo código (aal2), não só a senha.
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const sessaoCompleta = !aal || aal.currentLevel === aal.nextLevel;
      if (active) {
        setIsAdmin(sessaoCompleta);
        setPrecisaAtivar2FA(false);
        setLoading(false);
      }
    }

    checkRole();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      checkRole();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [tick]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const recarregar = () => setTick((t) => t + 1);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, precisaAtivar2FA, loading, logout, recarregar }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth deve ser usado dentro de <AdminAuthProvider>");
  return ctx;
}

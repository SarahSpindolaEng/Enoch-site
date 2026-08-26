import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

type AdminAuthContextValue = {
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

// Autenticação do painel administrativo — usa a mesma conta (Supabase Auth)
// do site, mas só libera o painel se a coluna `role` do perfil dessa conta
// for 'admin' no banco. Essa coluna nunca pode ser alterada pelo próprio
// usuário (nem pela API, nem manipulando o navegador) — só um admin do
// projeto Supabase pode promover alguém via SQL direto.
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkRole() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session?.user) {
        if (active) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (active) {
        setIsAdmin(profile?.role === "admin");
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
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, loading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth deve ser usado dentro de <AdminAuthProvider>");
  return ctx;
}

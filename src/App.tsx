import { Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Layout } from "@/components/site/Layout";
import { LoadingScreen } from "@/components/site/LoadingScreen";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { AdminAuthProvider } from "@/lib/adminAuth";
import { Home } from "@/pages/Home";
import { Catalogo } from "@/pages/Catalogo";
import { ProdutoDetalhe } from "@/pages/ProdutoDetalhe";
import { Sobre } from "@/pages/Sobre";
import { Contato } from "@/pages/Contato";
import { Duvidas } from "@/pages/Duvidas";
import { Termos } from "@/pages/Termos";
import { Login } from "@/pages/Login";
import { Perfil } from "@/pages/Perfil";
import { Carrinho } from "@/pages/Carrinho";
import { ListaDeDesejos } from "@/pages/ListaDeDesejos";
import { NotFound } from "@/pages/NotFound";

// Painel admin só carrega quando alguém acessa /admin — mantém esse código
// (e as libs que ele puxa) fora do bundle que todo cliente baixa.
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin").then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() =>
  import("@/pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route
              path="admin/login"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route
              path="admin"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="produtos" element={<Catalogo />} />
              <Route path="produtos/:slug" element={<ProdutoDetalhe />} />
              <Route path="sobre" element={<Sobre />} />
              <Route path="contato" element={<Contato />} />
              <Route path="duvidas" element={<Duvidas />} />
              <Route path="termos" element={<Termos />} />
              <Route path="login" element={<Login />} />
              <Route path="perfil" element={<Perfil />} />
              <Route path="carrinho" element={<Carrinho />} />
              <Route path="lista-de-desejos" element={<ListaDeDesejos />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

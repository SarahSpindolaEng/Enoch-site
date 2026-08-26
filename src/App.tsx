import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/site/Layout";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { AdminAuthProvider } from "@/lib/adminAuth";
import { Home } from "@/pages/Home";
import { Catalogo } from "@/pages/Catalogo";
import { ProdutoDetalhe } from "@/pages/ProdutoDetalhe";
import { Sobre } from "@/pages/Sobre";
import { Contato } from "@/pages/Contato";
import { Duvidas } from "@/pages/Duvidas";
import { Login } from "@/pages/Login";
import { Perfil } from "@/pages/Perfil";
import { Carrinho } from "@/pages/Carrinho";
import { ListaDeDesejos } from "@/pages/ListaDeDesejos";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { NotFound } from "@/pages/NotFound";

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
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="produtos" element={<Catalogo />} />
              <Route path="produtos/:slug" element={<ProdutoDetalhe />} />
              <Route path="sobre" element={<Sobre />} />
              <Route path="contato" element={<Contato />} />
              <Route path="duvidas" element={<Duvidas />} />
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

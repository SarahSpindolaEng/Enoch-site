import { Link, NavLink } from "react-router-dom";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { EnochLogo } from "./EnochLogo";

const nav = [
  { label: "Home", to: "/" },
  { label: "Produtos", to: "/produtos" },
  { label: "Sobre", to: "/sobre" },
  { label: "Contato", to: "/contato" },
] as const;

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { cartCount, wishlistCount } = useCart();
  const { user } = useAuth();
  const contaHref = user ? "/perfil" : "/login";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative rounded-full px-4 py-2 text-sm transition-colors duration-300",
      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link to="/" className="group flex min-w-0 items-center" aria-label="Enoch Tech — página inicial">
          <EnochLogo className="h-11 w-auto shrink-0 transition-opacity duration-300 group-hover:opacity-90 sm:h-14" />
        </Link>

        <nav className="hidden items-center gap-1 justify-self-center lg:flex">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            to={contaHref}
            aria-label="Entrar / minha conta"
            className="hidden size-10 place-items-center rounded-full border border-border text-foreground transition-all duration-300 hover:border-primary/60 hover:text-primary hover:shadow-[0_0_24px_-8px_var(--primary)] sm:grid"
          >
            <User className="size-[18px]" />
          </Link>
          <Link
            to="/lista-de-desejos"
            aria-label="Lista de desejos"
            className="relative hidden size-10 place-items-center rounded-full border border-border text-foreground transition-all duration-300 hover:border-primary/60 hover:text-primary hover:shadow-[0_0_24px_-8px_var(--primary)] sm:grid"
          >
            <Heart className="size-[18px]" />
            <CountBadge count={wishlistCount} />
          </Link>
          <Link
            to="/carrinho"
            aria-label="Carrinho"
            className="group relative grid size-10 place-items-center rounded-full border border-border text-foreground transition-all duration-300 hover:border-primary/60 hover:text-primary hover:shadow-[0_0_24px_-8px_var(--primary)]"
          >
            <ShoppingBag className="size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5" />
            <CountBadge count={cartCount} />
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-primary/60 hover:text-primary lg:hidden"
          >
            {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col px-5 py-3 sm:px-8">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-2 py-3 text-sm transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-1 flex items-center gap-3 border-t border-border pt-3">
            <Link
              to={contaHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <User className="size-4" /> Minha conta
            </Link>
            <Link
              to="/lista-de-desejos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Heart className="size-4" /> Desejos
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

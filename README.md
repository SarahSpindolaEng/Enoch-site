# Enoch Tech — base visual

Site de e-commerce da Enoch Tech (base visual, sem backend/pagamento real
ainda). Stack: Vite + React 19 + TypeScript + React Router + Tailwind CSS v4.

## Rodando localmente

```bash
npm install
npm run dev       # ambiente de desenvolvimento, http://localhost:5173
npm run build     # gera a versão de produção em dist/
npm run preview   # serve a build de produção localmente
```

## Estrutura

- `src/pages/` — uma página por rota (Home, Catalogo, ProdutoDetalhe, Sobre,
  Contato, Duvidas, Login, Perfil, Carrinho, ListaDeDesejos, NotFound).
- `src/components/site/` — Header, Footer, Layout, ProductCard, EnochLogo
  (logo em SVG), ProductArt (ilustrações de produto em SVG, placeholder até
  termos fotografia real), PromoBanner, Reveal (animação de entrada ao
  scroll).
- `src/lib/products.ts` — catálogo de produtos mockado.
- `src/lib/cart.tsx` — contexto de carrinho/lista de desejos (persistido em
  localStorage, só front-end por enquanto).
- `src/lib/auth.tsx` — contexto de login mockado (sem servidor real).
- `src/styles.css` — design tokens (cores em oklch, tema escuro + azul).

## Próximos passos (fora do escopo desta base visual)

Catálogo de produtos vindo de um banco de dados real, autenticação de
verdade, carrinho/checkout persistidos no servidor e pagamento (ex:
Supabase + Stripe).

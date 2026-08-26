import { createClient } from "@supabase/supabase-js";

// Estas duas chaves são PÚBLICAS por design — é assim que todo app Supabase
// funciona (o app precisa delas pra sequer conversar com o servidor). Elas
// não dão acesso a nada sozinhas: toda proteção real vem das políticas de
// Row Level Security configuradas no banco (cada usuário só enxerga/edita
// os próprios dados; catálogo é só leitura pública; pedidos só são criados
// através da função `create_order`, que sempre recalcula o preço no
// servidor). A chave secreta de verdade (service role) NUNCA entra aqui —
// essa só pode existir no backend, nunca no código do site.
const SUPABASE_URL = "https://qgswbsmflvkjsxaambba.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnc3dic21mbHZranN4YWFtYmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NjkzNzksImV4cCI6MjEwMzI0NTM3OX0.RNdfRtTm3o6i90836TzmqY4McKfs6VXxwUeqZBrmChQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  role: "customer" | "admin";
  created_at: string;
};

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  tagline: string | null;
  description: string | null;
  price: number;
  old_price: number | null;
  badge: string | null;
  category: string;
  specs: { label: string; value: string }[];
  colors: { name: string; value: string }[];
  stock: number;
  is_active: boolean;
  image_url: string | null;
};

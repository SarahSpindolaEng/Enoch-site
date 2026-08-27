import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";

export type Address = {
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
};

// Um endereço por cliente — cadastrado no perfil, reaproveitado
// automaticamente no carrinho na hora de fechar a compra.
export function useAddress() {
  const { user } = useAuth();
  const [address, setAddress] = useState<Address | null | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      setAddress(undefined);
      return;
    }
    let active = true;
    supabase
      .from("addresses")
      .select("cep, street, number, complement, neighborhood, city, state")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setAddress((data as Address | null) ?? null);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const salvar = async (endereco: Address) => {
    if (!user) return { error: "Você precisa entrar na sua conta." };
    const { error } = await supabase
      .from("addresses")
      .upsert({ user_id: user.id, ...endereco }, { onConflict: "user_id" });
    if (error) return { error: "Não foi possível salvar o endereço. Tente novamente." };
    setAddress(endereco);
    return { error: null };
  };

  return { address, salvar };
}

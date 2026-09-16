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
  name: string;
  cpf: string;
  phone: string;
};

// Algoritmo oficial de validação de CPF (dígitos verificadores) — precisa
// disso porque o CPF vai direto pro Melhor Envio na etiqueta de envio, um
// CPF com dígito errado derruba a emissão na hora.
export function cpfValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;
  const calc = (tam: number) => {
    let soma = 0;
    for (let i = 0; i < tam; i++) soma += parseInt(digitos[i], 10) * (tam + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 || resto === 11 ? 0 : resto;
  };
  return calc(9) === parseInt(digitos[9], 10) && calc(10) === parseInt(digitos[10], 10);
}

export function formatarCpf(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatarTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{4})$/, "$1-$2");
}

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
      .select("cep, street, number, complement, neighborhood, city, state, name, cpf, phone")
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

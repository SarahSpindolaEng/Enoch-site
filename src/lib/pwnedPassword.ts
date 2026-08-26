// Checa a senha contra a base pública do HaveIBeenPwned (Pwned Passwords)
// usando k-anonimato: só os 5 primeiros caracteres do hash SHA-1 saem do
// navegador, a senha em si nunca é enviada. Mesma fonte usada pelo
// "Leaked password protection" do Supabase (que só existe no plano Pro).
export async function vezesVazada(senha: string): Promise<number> {
  const bytes = new TextEncoder().encode(senha);
  const hashBuffer = await crypto.subtle.digest("SHA-1", bytes);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  const prefixo = hash.slice(0, 5);
  const sufixo = hash.slice(5);

  const resposta = await fetch(`https://api.pwnedpasswords.com/range/${prefixo}`);
  if (!resposta.ok) return 0; // API fora do ar não deve travar o cadastro

  const texto = await resposta.text();
  for (const linha of texto.split("\n")) {
    const [sufixoLinha, contagem] = linha.trim().split(":");
    if (sufixoLinha === sufixo) return Number(contagem) || 0;
  }
  return 0;
}

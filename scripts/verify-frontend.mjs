// Script opcional de QA (não faz parte do build). Para rodar:
//   npm install -D playwright && npx vite build && npx vite preview --port 4173 &
//   node scripts/verify-frontend.mjs
import { chromium } from "playwright";

const BASE = "http://localhost:4173";
const results = [];

function check(label, ok, extra = "") {
  results.push({ label, ok, extra });
  console.log(`${ok ? "OK   " : "FALHOU"} ${label} ${extra}`);
}

async function main() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  // --- Footer: newsletter removida ---
  await page.goto(`${BASE}/#/`, { waitUntil: "networkidle" });
  const footerText = await page.locator("footer").innerText();
  check(
    "Footer não tem mais o bloco de newsletter",
    !/novidades primeiro/i.test(footerText) && !/assinar/i.test(footerText),
  );
  check(
    "Footer mostra a logo/blurb no lugar",
    /curadoria de eletrônicos premium/i.test(footerText),
  );

  // --- Login: campos de nome/e-mail/senha reais e alternância de modo ---
  await page.goto(`${BASE}/#/login`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Criar conta" }).click();
  const nomeVisible = await page.getByPlaceholder("Seu nome").isVisible();
  check("Modo 'criar conta' mostra campo de nome", nomeVisible);

  await page.getByPlaceholder("Seu nome").fill("Sarah Teste");
  await page.getByPlaceholder("seu@email.com").fill("sarah.teste@example.com");
  const senhaInput = page.locator('input[type="password"]');
  await senhaInput.fill("senha-123456");
  const senhaValue = await senhaInput.inputValue();
  check("Campo de senha está de fato conectado ao estado (wired)", senhaValue === "senha-123456");
  const senhaType = await senhaInput.getAttribute("type");
  check("Campo de senha é do tipo password (mascarado)", senhaType === "password");

  // --- Admin: sem sessão, deve mandar pro login do painel ---
  await page.goto(`${BASE}/#/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  check("Rota /admin sem sessão redireciona para /admin/login", page.url().includes("/admin/login"));

  // --- Carrinho: fluxo de visitante (localStorage), sem depender do Supabase ---
  await page.goto(`${BASE}/#/produtos/aura-max`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /adicionar ao carrinho/i }).first().click();
  // "Favoritar" é o botão de desejos da própria página do produto (Aura
  // Max) — distinto dos botões de coração nos cards de "produtos
  // relacionados" mais abaixo na mesma página, que têm outro aria-label.
  await page.getByRole("button", { name: "Favoritar" }).click();

  await page.goto(`${BASE}/#/carrinho`, { waitUntil: "networkidle" });
  const cartText = await page.locator("main, section").first().innerText();
  check("Item adicionado aparece no carrinho (Aura Max)", /aura max/i.test(cartText));

  await page.getByRole("button", { name: "Aumentar quantidade" }).click();
  const qtyText = await page.locator("span.w-5").first().innerText();
  check("Quantidade aumenta ao clicar em +", qtyText.trim() === "2");

  // --- Checkout sem login: deve mandar pra /login, não tentar chamar o Supabase direto ---
  await page.getByRole("button", { name: "Finalizar compra" }).click();
  await page.waitForTimeout(500);
  check("Finalizar compra sem login redireciona para /login", page.url().includes("/login"));

  // --- Lista de desejos: item adicionado antes deve aparecer aqui ---
  await page.goto(`${BASE}/#/lista-de-desejos`, { waitUntil: "networkidle" });
  const wishText = await page.locator("body").innerText();
  check("Item adicionado aparece na lista de desejos (Aura Max)", /aura max/i.test(wishText));

  // --- Remover do carrinho ---
  await page.goto(`${BASE}/#/carrinho`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Remover" }).click();
  await page.waitForTimeout(300);
  const emptyText = await page.locator("body").innerText();
  check("Carrinho fica vazio após remover o item", /carrinho está vazio/i.test(emptyText));

  // Esta sandbox bloqueia rede externa (Google Fonts, Supabase) por padrão
  // — erros de rede TUNNEL/ERR_BLOCKED são esperados aqui e não indicam bug
  // no app. Só sinalizamos erros que não sejam de rede bloqueada.
  const realErrors = consoleErrors.filter(
    (e) => !/ERR_TUNNEL_CONNECTION_FAILED|ERR_BLOCKED|ERR_NAME_NOT_RESOLVED|Failed to load resource/i.test(e),
  );
  check(
    "Nenhum erro de JS inesperado no console (fora bloqueios de rede da sandbox)",
    realErrors.length === 0,
    realErrors.length ? `-> ${realErrors.slice(0, 3).join(" | ")}` : "",
  );

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passaram`);
  if (failed.length) {
    console.log("Falhas:", failed.map((f) => f.label).join("; "));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("ERRO FATAL", e);
  process.exit(1);
});

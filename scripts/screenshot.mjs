import { chromium } from "playwright";
import fs from "node:fs";

const base = "http://localhost:4173";
const outDir = "/root/enoch-tech/screens";
fs.mkdirSync(outDir, { recursive: true });

const pages = [
  { path: "/", name: "home" },
  { path: "/produtos", name: "catalogo" },
  { path: "/produtos/aura-max", name: "produto" },
  { path: "/duvidas", name: "duvidas" },
  { path: "/login", name: "login" },
  { path: "/carrinho", name: "carrinho" },
  { path: "/lista-de-desejos", name: "wishlist-vazia" },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

async function scrollThrough(page) {
  // Headless scrollTo() jumps don't give IntersectionObserver reliable idle
  // time to fire (unlike real gradual user scrolling), so for QA screenshots
  // we just force the reveal state instead of fighting that flakiness.
  await page.evaluate(() => {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("reveal-visible"));
  });
  await page.waitForTimeout(200);
}

for (const p of pages) {
  await page.goto(base + p.path, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await scrollThrough(page);
  await page.screenshot({ path: `${outDir}/${p.name}.png`, fullPage: true });
  console.log("captured", p.name);
}

// Header close-up (logo)
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.locator("header").screenshot({ path: `${outDir}/header-closeup.png` });

// Mobile home
await page.setViewportSize({ width: 420, height: 900 });
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await scrollThrough(page);
await page.screenshot({ path: `${outDir}/home-mobile.png`, fullPage: true });

// Catalog card grid close-up (desktop) to check card alignment
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(base + "/produtos", { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await scrollThrough(page);
await page.locator("main").screenshot({ path: `${outDir}/catalogo-cards.png` });

await browser.close();

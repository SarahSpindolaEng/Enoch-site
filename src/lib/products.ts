import type { LucideIcon } from "lucide-react";
import { AudioLines, Headphones, Keyboard, Speaker, Watch } from "lucide-react";

export type Product = {
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  description: string;
  price: number;
  oldPrice?: number;
  badge?: "Novo" | "Destaque" | "Últimas unidades";
  category: string;
  icon: LucideIcon;
  colors: { name: string; value: string }[];
  specs: { label: string; value: string }[];
};

export const categories = ["Todos", "Áudio", "Vestíveis", "Acessórios"] as const;

// A Enoch Tech é uma revendedora: cura e revende eletrônicos de marcas
// parceiras. As marcas abaixo são fictícias, só para preencher a base visual.
export const products: Product[] = [
  {
    slug: "aura-max",
    name: "Aura Max",
    brand: "Aura Audio",
    tagline: "Headphone over-ear com cancelamento ativo adaptativo",
    description:
      "Som de referência em um corpo de alumínio usinado. Cancelamento de ruído adaptativo, 40h de autonomia e conforto para o dia inteiro. Selecionado pela Enoch Tech como um dos melhores headphones premium do mercado.",
    price: 2499,
    oldPrice: 2899,
    badge: "Destaque",
    category: "Áudio",
    icon: Headphones,
    colors: [
      { name: "Midnight", value: "oklch(0.2 0.01 265)" },
      { name: "Electric", value: "oklch(0.58 0.216 262)" },
      { name: "Graphite", value: "oklch(0.45 0.01 265)" },
    ],
    specs: [
      { label: "Drivers", value: "42 mm de berílio" },
      { label: "Autonomia", value: "40 horas com ANC ativo" },
      { label: "Conectividade", value: "Bluetooth 5.4 · USB-C · Jack 3,5 mm" },
      { label: "Codecs", value: "LDAC · aptX Adaptive · AAC" },
      { label: "Peso", value: "268 g" },
      { label: "Resistência", value: "IPX4" },
    ],
  },
  {
    slug: "pulse-watch-2",
    name: "Pulse Watch 2",
    brand: "Pulse",
    tagline: "Smartwatch com display AMOLED de 2.000 nits",
    description:
      "Monitoramento contínuo de saúde, GPS de banda dupla e uma caixa em titânio com apenas 9,2 mm de espessura. Um dos smartwatches mais bem avaliados da nossa curadoria.",
    price: 1899,
    badge: "Novo",
    category: "Vestíveis",
    icon: Watch,
    colors: [
      { name: "Titanium", value: "oklch(0.6 0.01 265)" },
      { name: "Midnight", value: "oklch(0.2 0.01 265)" },
    ],
    specs: [
      { label: "Tela", value: "AMOLED 1,43\" · 2.000 nits" },
      { label: "Autonomia", value: "14 dias em uso típico" },
      { label: "Sensores", value: "SpO₂ · ECG · Temperatura" },
      { label: "GPS", value: "Banda dupla L1 + L5" },
      { label: "Material", value: "Titânio grau 5" },
      { label: "Resistência", value: "5 ATM · IP68" },
    ],
  },
  {
    slug: "echo-buds-pro",
    name: "Echo Buds Pro",
    brand: "Echo",
    tagline: "Fones true wireless com áudio espacial",
    description:
      "Compactos, herméticos e absurdamente precisos. Áudio espacial com rastreamento de cabeça e estojo com carregamento sem fio.",
    price: 1099,
    badge: "Novo",
    category: "Áudio",
    icon: AudioLines,
    colors: [
      { name: "Midnight", value: "oklch(0.2 0.01 265)" },
      { name: "Electric", value: "oklch(0.58 0.216 262)" },
    ],
    specs: [
      { label: "Drivers", value: "11 mm dinâmicos" },
      { label: "Autonomia", value: "8h + 26h no estojo" },
      { label: "Conectividade", value: "Bluetooth 5.4 multiponto" },
      { label: "Áudio espacial", value: "Com rastreamento de cabeça" },
      { label: "Carregamento", value: "USB-C · Qi sem fio" },
      { label: "Resistência", value: "IPX5" },
    ],
  },
  {
    slug: "cylinder-360",
    name: "Cylinder 360",
    brand: "Orbe",
    tagline: "Alto-falante portátil com som omnidirecional",
    description:
      "Graves profundos em um corpo de 1,1 kg. Anel de luz reativo à música e 24 horas de reprodução contínua.",
    price: 1499,
    category: "Áudio",
    icon: Speaker,
    colors: [
      { name: "Midnight", value: "oklch(0.2 0.01 265)" },
      { name: "Graphite", value: "oklch(0.45 0.01 265)" },
    ],
    specs: [
      { label: "Potência", value: "60 W RMS" },
      { label: "Cobertura", value: "360° omnidirecional" },
      { label: "Autonomia", value: "24 horas" },
      { label: "Pareamento", value: "Estéreo com 2 unidades" },
      { label: "Resistência", value: "IP67" },
      { label: "Peso", value: "1,1 kg" },
    ],
  },
  {
    slug: "type-75-low",
    name: "Type 75 Low",
    brand: "Keybase",
    tagline: "Teclado mecânico low-profile sem fio",
    description:
      "Switches lineares lubrificados de fábrica, estrutura em alumínio CNC e backlight azul de precisão.",
    price: 1299,
    oldPrice: 1499,
    badge: "Últimas unidades",
    category: "Acessórios",
    icon: Keyboard,
    colors: [
      { name: "Midnight", value: "oklch(0.2 0.01 265)" },
      { name: "Graphite", value: "oklch(0.45 0.01 265)" },
    ],
    specs: [
      { label: "Layout", value: "75% · ABNT2" },
      { label: "Switches", value: "Lineares low-profile hot-swap" },
      { label: "Conectividade", value: "2,4 GHz · Bluetooth · USB-C" },
      { label: "Autonomia", value: "120 horas sem backlight" },
      { label: "Estrutura", value: "Alumínio CNC" },
      { label: "Polling", value: "1.000 Hz" },
    ],
  },
  {
    slug: "aura-lite",
    name: "Aura Lite",
    brand: "Aura Audio",
    tagline: "O headphone essencial da linha Aura",
    description:
      "A assinatura sonora Aura em um formato mais leve e acessível, com 30 horas de autonomia.",
    price: 1299,
    category: "Áudio",
    icon: Headphones,
    colors: [
      { name: "Midnight", value: "oklch(0.2 0.01 265)" },
      { name: "Electric", value: "oklch(0.58 0.216 262)" },
    ],
    specs: [
      { label: "Drivers", value: "40 mm dinâmicos" },
      { label: "Autonomia", value: "30 horas" },
      { label: "Conectividade", value: "Bluetooth 5.3 · USB-C" },
      { label: "Codecs", value: "aptX · AAC · SBC" },
      { label: "Peso", value: "232 g" },
      { label: "Resistência", value: "IPX4" },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

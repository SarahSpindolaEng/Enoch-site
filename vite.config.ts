import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    host: true,
  },
  build: {
    // O artifact publicado é um único arquivo HTML autocontido (sem rede
    // externa disponível), então as imagens da marca (logo, banners) têm
    // que ir embutidas em base64 dentro do JS, não como arquivos separados.
    assetsInlineLimit: 300_000,
  },
});

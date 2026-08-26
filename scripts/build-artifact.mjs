import fs from "node:fs";

const distDir = "/root/enoch-tech/dist/assets";
const files = fs.readdirSync(distDir);
const jsFile = files.find((f) => f.endsWith(".js"));
const cssFile = files.find((f) => f.endsWith(".css"));

const js = fs.readFileSync(`${distDir}/${jsFile}`, "utf8");
const css = fs.readFileSync(`${distDir}/${cssFile}`, "utf8");

const out = `<title>Enoch Tech</title>
<meta name="description" content="A Enoch Tech seleciona e revende os melhores eletrônicos do mercado: headphones, smartwatches e gadgets, com curadoria, garantia e design minimalista." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
  rel="stylesheet"
/>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`;

fs.writeFileSync("/root/enoch-tech/artifact.html", out);
console.log("wrote artifact.html", out.length, "bytes");

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

// HashRouter (não BrowserRouter): o build final é um único HTML estático
// (servido sem roteamento no servidor), então usamos rotas por hash
// (#/produtos) para que recarregar ou compartilhar um link direto sempre
// funcione, em vez de depender de rewrites de servidor.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);

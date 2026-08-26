import { useEffect, useRef } from "react";

// Site key é pública por design (é assim que o Turnstile funciona — a
// verificação de verdade acontece no Supabase com a secret key, que nunca
// entra no código do site).
const SITE_KEY = "0x4AAAAAAEc7kFdNu0lN6m8V";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

let carregandoScript: Promise<void> | null = null;
function carregarScriptTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (carregandoScript) return carregandoScript;
  carregandoScript = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return carregandoScript;
}

export function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    let ativo = true;
    carregarScriptTurnstile().then(() => {
      if (!ativo || !ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    });
    return () => {
      ativo = false;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} />;
}

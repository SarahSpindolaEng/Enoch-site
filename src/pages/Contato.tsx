import { useState, type FormEvent } from "react";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";

const canais = [
  {
    Icon: Mail,
    title: "E-mail",
    value: "Lucianoenochtech@gmail.com",
    href: "mailto:Lucianoenochtech@gmail.com",
  },
  {
    Icon: MessageCircle,
    title: "WhatsApp",
    value: "(62) 9314-5116",
    href: "https://wa.me/556293145116",
  },
  {
    Icon: Instagram,
    title: "Instagram",
    value: "@Enoch.Tech_",
    href: "https://instagram.com/Enoch.Tech_",
  },
];

export function Contato() {
  const { user } = useAuth();
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro(null);
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message"),
      user_id: user?.id ?? null,
    });
    setEnviando(false);
    if (error) return setErro("Não foi possível enviar. Tente novamente em instantes.");
    setEnviado(true);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 hero-glow opacity-70" />

      <section className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-24 pt-32 sm:px-8 lg:grid-cols-2 lg:pt-44">
        <Reveal className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Contato</p>
          <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.08] sm:text-5xl">
            Vamos conversar.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Dúvidas sobre um produto, garantia ou parcerias — respondemos em até
            um dia útil.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Atendimento: segunda a sexta, das 8h às 18h.
          </p>

          <ul className="mt-10 space-y-4">
            {canais.map(({ Icon, title, value, href }) => (
              <li key={title}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary transition-all duration-300 group-hover:bg-primary/20">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="truncate text-sm text-muted-foreground">{value}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="min-w-0">
          {enviado ? (
            <div className="flex h-full flex-col items-start justify-center rounded-3xl border border-primary/30 bg-surface p-8">
              <p className="text-lg font-semibold">Mensagem enviada ✓</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Recebemos seu contato e vamos responder em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={enviar} className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
              <div className="grid gap-5">
                {[
                  { name: "name", label: "Nome", type: "text", placeholder: "Seu nome" },
                  { name: "email", label: "E-mail", type: "email", placeholder: "seu@email.com" },
                  { name: "subject", label: "Assunto", type: "text", placeholder: "Como podemos ajudar?" },
                ].map((field) => (
                  <label key={field.label} className="block">
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {field.label}
                    </span>
                    <input
                      required
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary/60 focus:shadow-[0_0_28px_-14px_var(--primary)]"
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Mensagem
                  </span>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    placeholder="Escreva sua mensagem"
                    className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary/60 focus:shadow-[0_0_28px_-14px_var(--primary)]"
                  />
                </label>
                {erro ? (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {erro}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={enviando}
                  className="mt-1 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_40px_-10px_var(--primary)] active:scale-[0.99] disabled:opacity-60"
                >
                  {enviando ? "Enviando…" : "Enviar mensagem"}
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </section>
    </div>
  );
}

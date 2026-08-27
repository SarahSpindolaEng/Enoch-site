import { Reveal } from "@/components/site/Reveal";

export function Termos() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 hero-glow opacity-70" />

      <section className="relative mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8 lg:pt-44">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Legal</p>
          <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.08] sm:text-5xl">
            Termos de Uso e Privacidade
          </h1>
          <p className="mt-5 text-sm text-muted-foreground">Última atualização: 27 de agosto de 2026.</p>
        </Reveal>

        <Reveal delay={80} className="mt-10 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-amber-300">Texto-modelo, não é orientação jurídica.</span>{" "}
          Serve como ponto de partida real, mas antes de operar a loja de verdade, revise com um
          advogado — principalmente os dados da empresa (CNPJ, razão social, endereço) marcados abaixo,
          que ainda precisam ser preenchidos.
        </Reveal>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Quem somos</h2>
            <p className="mt-3">
              A Enoch Tech é uma revendedora de eletrônicos. Razão social, CNPJ e endereço:{" "}
              <span className="font-medium text-amber-300">[preencher com os dados oficiais da empresa]</span>.
              Não fabricamos os produtos vendidos — atuamos como revendedora autorizada, e a garantia
              de fábrica segue as condições de cada fabricante.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Cadastro e conta</h2>
            <p className="mt-3">
              Para comprar, é necessário criar uma conta com nome, e-mail e senha. Você é responsável
              por manter sua senha em sigilo e por tudo que acontecer usando sua conta — recomendamos
              fortemente ativar a autenticação em duas etapas (2FA), disponível no seu perfil.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Pedidos e pagamento</h2>
            <p className="mt-3">
              O pedido só é confirmado após a aprovação do pagamento. Os preços e a disponibilidade de
              estoque podem mudar sem aviso prévio até a confirmação da compra. Pedido não pago dentro
              do prazo informado no checkout é cancelado automaticamente e o estoque reservado é
              liberado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Entrega</h2>
            <p className="mt-3">
              O frete é calculado e contratado através do Melhor Envio, considerando CEP de destino,
              peso e dimensões do produto. Prazos informados no checkout são estimativas da
              transportadora, não uma garantia de data exata.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Troca, devolução e arrependimento</h2>
            <p className="mt-3">
              Conforme o Código de Defesa do Consumidor (Art. 49), você pode desistir da compra em até
              7 dias corridos após o recebimento do produto, sem precisar justificar — o reembolso é
              feito depois de recebermos o produto de volta em condições adequadas. Produtos com
              defeito têm o problema resolvido conforme a garantia do fabricante ou, quando aplicável,
              o próprio CDC.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Seus dados (LGPD)</h2>
            <p className="mt-3">Coletamos e guardamos os seguintes dados pessoais:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Nome e e-mail — pra identificar sua conta e falar com você sobre pedidos.</li>
              <li>Endereço — só se você cadastrar, pra calcular frete e fazer a entrega.</li>
              <li>Histórico de pedidos e mensagens de suporte — pra te atender melhor.</li>
            </ul>
            <p className="mt-3">
              Esses dados nunca são vendidos. São usados só para processar sua compra, entrega e
              suporte. Senhas nunca ficam salvas em texto legível — são armazenadas com hash
              criptográfico, mesmo padrão usado por bancos, que nem nós conseguimos reverter pra ver a
              senha original. Você pode pedir a exclusão da sua conta e dos seus dados a qualquer
              momento pelo suporte.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Cookies e armazenamento local</h2>
            <p className="mt-3">
              Usamos armazenamento local do navegador pra manter sua sessão logada e o carrinho de
              compras (quando você ainda não entrou na conta). Não usamos cookies de rastreamento
              publicitário de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Contato</h2>
            <p className="mt-3">
              Dúvidas sobre estes termos ou sobre seus dados: use a página de{" "}
              <a href="#/contato" className="text-primary hover:underline">
                Contato
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

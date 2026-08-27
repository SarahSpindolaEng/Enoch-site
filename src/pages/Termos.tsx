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
          <span className="font-semibold text-amber-300">Ainda falta confirmar o CNPJ.</span> As
          políticas comerciais (seções 3 a 6) são o texto oficial da empresa. A seção 1 está com CNPJ e
          razão social pendentes de confirmação — antes de operar de verdade, vale uma revisão jurídica
          geral.
        </Reveal>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Quem somos</h2>
            <p className="mt-3">
              A Enoch Tech é uma revendedora de eletrônicos.{" "}
              <span className="font-medium text-amber-300">[razão social e CNPJ a confirmar]</span>.
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
            <h2 className="text-lg font-semibold text-foreground">3. Troca e devolução</h2>
            <p className="mt-3">
              A Enoch Tech busca oferecer produtos de qualidade e uma experiência de compra segura e
              transparente.
            </p>
            <p className="mt-3">
              Em caso de arrependimento da compra, o cliente poderá solicitar a devolução do produto no
              prazo de até 7 dias corridos após o recebimento, conforme previsto no Código de Defesa do
              Consumidor para compras realizadas fora do estabelecimento comercial.
            </p>
            <p className="mt-3">
              O produto deverá ser devolvido, preferencialmente, em suas condições originais,
              acompanhado de acessórios, manuais, embalagem e demais itens que o acompanham.
            </p>
            <p className="mt-3">
              Em caso de produto recebido com defeito, avaria ou em desacordo com o pedido, o cliente
              deverá entrar em contato com a Enoch Tech para que a situação seja analisada e seja
              orientado sobre o procedimento de troca ou devolução.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Garantia</h2>
            <p className="mt-3">
              A Enoch Tech trabalha com produtos que possuem garantia conforme as condições
              estabelecidas pelo fabricante ou fornecedor.
            </p>
            <p className="mt-3">
              Quando houver garantia do fabricante, o atendimento poderá ser direcionado à assistência
              técnica ou ao próprio fabricante, conforme as regras de cada produto.
            </p>
            <p className="mt-3">
              A Enoch Tech também prestará o suporte necessário ao cliente para orientar sobre o
              procedimento de garantia.
            </p>
            <p className="mt-3">
              A garantia não cobre danos causados por mau uso, quedas, acidentes, instalação incorreta,
              alterações no produto ou utilização em desacordo com as orientações do fabricante.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Frete</h2>
            <p className="mt-3">
              A Enoch Tech utilizará o Melhor Envio para realizar o cálculo e a contratação dos
              serviços de transporte dos pedidos.
            </p>
            <p className="mt-3">
              O valor do frete será calculado de acordo com o CEP de destino, peso, dimensões do
              produto, quantidade de itens e modalidade de transporte escolhida.
            </p>
            <p className="mt-3">
              As opções de envio e os respectivos valores serão apresentados ao cliente durante o
              processo de compra, conforme disponibilidade para a região.
            </p>
            <p className="mt-3">
              A Enoch Tech poderá utilizar diferentes transportadoras disponíveis na plataforma Melhor
              Envio, buscando oferecer ao cliente opções de prazo e preço.
            </p>
            <p className="mt-3">
              O prazo de entrega será informado no momento da compra e poderá variar de acordo com a
              transportadora, região de destino e eventuais situações que estejam fora do controle da
              Enoch Tech.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Responsabilidade pelo envio</h2>
            <p className="mt-3">
              Após a confirmação do pagamento, a Enoch Tech realizará a preparação e postagem do
              pedido dentro do prazo informado.
            </p>
            <p className="mt-3">
              Após a postagem, o transporte será realizado pela transportadora escolhida por meio do
              Melhor Envio.
            </p>
            <p className="mt-3">
              Em caso de atraso, extravio ou ocorrência durante o transporte, a Enoch Tech prestará
              suporte ao cliente e realizará os procedimentos necessários junto à transportadora e à
              plataforma Melhor Envio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Seus dados (LGPD)</h2>
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
            <h2 className="text-lg font-semibold text-foreground">8. Cookies e armazenamento local</h2>
            <p className="mt-3">
              Usamos armazenamento local do navegador pra manter sua sessão logada e o carrinho de
              compras (quando você ainda não entrou na conta). Não usamos cookies de rastreamento
              publicitário de terceiros.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Compromisso Enoch Tech
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed">
              Nosso compromisso é oferecer produtos de qualidade, preço justo, transparência e
              segurança em todas as etapas da compra. A Enoch Tech busca construir uma relação de
              confiança com seus clientes, oferecendo atendimento responsável antes, durante e após a
              compra.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Contato</h2>
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

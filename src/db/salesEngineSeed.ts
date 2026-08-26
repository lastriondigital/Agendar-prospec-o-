import {
  CtaItem,
  FollowUpStrategyItem,
  ObjectionItem,
  PainPointItem,
  PricingItem,
  ProofItem,
  ValueArgumentItem,
} from '../types';

/**
 * 1 & 2. BIBLIOTECA DE PROBLEMAS E DORES
 */
export const SEED_PAIN_POINTS: PainPointItem[] = [
  {
    id: 'pain-1',
    title: 'Dependência de indicações boca a boca sem previsibilidade',
    description: 'Empresa vive meses bons e meses fracos sem controle da entrada de novos clientes.',
    type: 'problema',
    niche: 'Clínica Médica & Saúde',
    serviceId: 'srv-lp',
    severity: 'alta',
  },
  {
    id: 'pain-2',
    title: 'Anúncios rodando com alto custo por lead e pouca conversão',
    description: 'Investe em tráfego pago mas os visitantes caem em sites lentos ou no WhatsApp desqualificados.',
    type: 'dor',
    niche: 'Odontologia & Estética',
    serviceId: 'srv-lp',
    severity: 'alta',
  },
  {
    id: 'pain-3',
    title: 'Site institucional desatualizado ou sem presença profissional',
    description: 'Perde credibilidade para concorrentes que possuem portais modernos e autoridade no Google.',
    type: 'problema',
    niche: 'Advocacia & Jurídico',
    serviceId: 'srv-website',
    severity: 'media',
  },
  {
    id: 'pain-4',
    title: 'Comercial sobrecarregado respondendo curiosos sem intenção de compra',
    description: 'Falta de qualificação prévia e roteiros estruturados faz os atendentes perderem horas com leads frios.',
    type: 'dor',
    niche: 'Imobiliária & Construtora',
    serviceId: 'srv-consultoria',
    severity: 'alta',
  },
  {
    id: 'pain-5',
    title: 'Falta de ranqueamento orgânico nas buscas locais do Google',
    description: 'Clientes procuram pelo serviço na cidade e encontram apenas a concorrência.',
    type: 'problema',
    niche: 'Contabilidade & BPO Financeiro',
    serviceId: 'srv-website',
    severity: 'media',
  },
  {
    id: 'pain-6',
    title: 'Ciclo de vendas longo e sem esteira de follow-up estruturada',
    description: 'Propostas enviadas são esquecidas e leads esfriam por falta de acompanhamento cadenciado.',
    type: 'dor',
    niche: 'Tecnologia & SaaS',
    serviceId: 'srv-consultoria',
    severity: 'alta',
  },
];

/**
 * 3 & 4. BIBLIOTECA DE BENEFÍCIOS E ARGUMENTOS DE VALOR
 */
export const SEED_ARGUMENTS: ValueArgumentItem[] = [
  {
    id: 'arg-1',
    title: 'Conversão Multiplicada com Velocidade Extrema',
    argumentText: 'Nossas Landing Pages carregam em menos de 1.2 segundos e possuem copy persuasiva, convertendo até 4x mais que sites comuns.',
    benefit: 'Geração contínua de leads qualificados no WhatsApp com menor custo por clique.',
    serviceId: 'srv-lp',
    category: 'velocidade',
  },
  {
    id: 'arg-2',
    title: 'Autoridade Instantânea e Posicionamento Premium',
    argumentText: 'Estrutura corporativa completa que posiciona sua marca como líder do setor, permitindo cobrar honorários maiores sem fricção.',
    benefit: 'Aumento do ticket médio e facilidade de fechamento com clientes de alto padrão.',
    serviceId: 'srv-website',
    category: 'autoridade',
  },
  {
    id: 'arg-3',
    title: 'Retorno sobre Investimento (ROI) Validado no 1º Mês',
    argumentText: 'Um único contrato ou paciente conquistado já cobre integralmente o valor investido na solução.',
    benefit: 'Payback imediato e baixo risco financeiro para a empresa.',
    serviceId: 'srv-lp',
    category: 'roi',
  },
  {
    id: 'arg-4',
    title: 'Processo Comercial Previsível e Escalável',
    argumentText: 'Implementamos cadências ativas e processos validados que garantem reuniões qualificadas toda semana no seu calendário.',
    benefit: 'Fim da incerteza de receita e previsibilidade para crescer a equipe.',
    serviceId: 'srv-consultoria',
    category: 'diferencial',
  },
  {
    id: 'arg-5',
    title: 'Garantia de Performance e Suporte Dedicado',
    argumentText: 'Entregamos tudo 100% configurado: domínio, SSL, pixel de rastreamento e suporte prioritário sem surpresas técnicas.',
    benefit: 'Paz de espírito e zero dor de cabeça com tecnologia ou manutenções.',
    serviceId: 'srv-website',
    category: 'seguranca',
  },
];

/**
 * 5 & 6. BIBLIOTECA DE OBJEÇÕES E RESPOSTAS ESTRATÉGICAS
 * Contempla exatamente os 8 exemplos exigidos + estrutura completa
 */
export const SEED_OBJECTIONS: ObjectionItem[] = [
  {
    id: 'obj-caro',
    name: 'Está muito caro / Preço alto',
    context: 'Prospect recebeu o valor da proposta ou catálogo e achou acima do que esperava gastar.',
    response: 'Compreendo perfeitamente a sua atenção com o investimento, [Nome]. Porém, a pergunta principal não é o custo de implementar, mas o custo de continuar sem [Serviço]. Hoje, quantos clientes a mais você precisa fechar para pagar 100% desse projeto? Na maioria dos nossos parceiros, uma única conversão já quita o investimento e o restante vira lucro recorrente.',
    alternativas: [
      'Entendo, [Nome]. Em relação a que você considera caro? Pergunto porque se compararmos com o desperdício de anúncios ou perda de contratos para a concorrência, nossa solução gera ROI positivo já nos primeiros 30 dias.',
      'Faz total sentido! Que tal começarmos com uma versão enxuta focada apenas no canal que mais gera retorno imediato, e expandimos conforme o caixa entrar?',
    ],
    serviceId: 'srv-lp',
    serviceName: 'Landing Page de Alta Conversão',
    stage: 'NEGOCIAÇÃO',
    observacoes: 'Nunca dê desconto imediato. Mude o foco de "gasto" para "retorno financeiro" e número de vendas necessárias para atingir o payback.',
    category: 'preco',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'obj-vou-pensar',
    name: 'Vou pensar / Deixa eu analisar',
    context: 'Prospect pareceu interessado mas evita tomar decisão ou assumir compromisso imediato.',
    response: 'Geralmente quando alguém me diz que "vai pensar", é por um de dois motivos: ou a proposta não fez sentido e você não quer ser indelicado, ou fez sentido mas faltou algum detalhe crucial como escopo, prazo ou condições. Para eu não te incomodar à toa, qual dessas duas opções é o caso da [Empresa]?',
    alternativas: [
      'Sem problemas, [Nome]! Pensar é fundamental. Qual ponto específico você gostaria de ponderar com mais calma? Assim posso te enviar exatamente os dados ou cases que vão te ajudar nessa reflexão.',
      'Perfeito! Vamos fazer o seguinte: eu reservo as condições atuais até sexta-feira às 17h. Podemos marcar 10 minutos na quinta para tirar as dúvidas finais?',
    ],
    serviceId: 'srv-lp',
    serviceName: 'Landing Page de Alta Conversão',
    stage: 'PROPOSTA',
    observacoes: 'Desarme a fuga educada com empatia e sinceridade. Descubra qual é a dúvida oculta.',
    category: 'timing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'obj-ja-tenho-alguem',
    name: 'Já tenho alguém / Já temos agência ou fornecedor',
    context: 'Prospect afirma que já possui alguém cuidando do site, marketing ou tráfego.',
    response: 'Que excelente, [Nome]! Sinal de que vocês entendem o valor desse canal e não preciso te convencer da importância. Nossa proposta não é substituir quem já faz um bom trabalho, mas atuar em pontos onde agências generalistas costumam deixar dinheiro na mesa, como [Benefício/Diferencial]. Como está o tempo de carregamento e a taxa de conversão das páginas atuais de vocês?',
    alternativas: [
      'Ótimo saber! E vocês estão 100% satisfeitos com o volume de reuniões e leads qualificados que estão recebendo hoje, ou sentem que a [Empresa] teria potencial para o dobro?',
      'Entendido! Que tal fazermos um diagnóstico comparativo gratuito de 10 minutos? Se o seu fornecedor já fizer tudo perfeitamente, você ganha a certeza de que está bem atendido. Se houver falhas de conversão, você saberá exatamente onde corrigir.',
    ],
    serviceId: 'srv-website',
    serviceName: 'Website Institucional Corporativo',
    stage: 'RESPONDEU',
    observacoes: 'Elogie o fato de já investirem. Posicione sua solução como especialista em conversão, não como concorrente comoditizado.',
    category: 'concorrencia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'obj-nao-preciso',
    name: 'Não preciso / Não é prioridade agora',
    context: 'Prospect acha que a operação está funcionando bem ou desconhece o problema.',
    response: 'Compreendo, [Nome]. Muitas empresas com quem conversamos no setor de [Nicho] achavam o mesmo, até notarem que estavam perdendo clientes qualificados que pesquisam no Google e acabam fechando com concorrentes vizinhos. Se eu te mostrar em 3 minutos como capturar essa demanda sem mexer na sua rotina, faria sentido dar uma olhada?',
    alternativas: [
      'Entendi perfeitamente! Posso te fazer uma pergunta rápida: hoje a maior parte dos seus clientes vem por indicação ou vocês têm um canal ativo gerando novos contratos previsíveis todo mês?',
      'Tranquilo, [Nome]. Vou te enviar um case rápido de uma empresa de [Nicho] que implementou isso em apenas 7 dias. Se fizer sentido mais adiante, as portas estão abertas!',
    ],
    serviceId: 'srv-lp',
    serviceName: 'Landing Page de Alta Conversão',
    stage: 'PRIMEIRO_CONTACTO',
    observacoes: 'Desperte o custo da inação. Mostre que não precisar agora significa deixar clientes para os concorrentes.',
    category: 'necessidade',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'obj-mande-orcamento',
    name: 'Mande orçamento por e-mail / WhatsApp',
    context: 'Prospect quer apenas o preço rápido sem passar por diagnóstico ou reunião.',
    response: 'Posso mandar sim, [Nome]! Mas para não te enviar um PDF genérico com valores que não façam sentido para a realidade da [Empresa], preciso de apenas 2 informações: [Pergunta 1: ex. qual o objetivo principal?] e [Pergunta 2: ex. qual o prazo desejado?]. Com isso, monto uma proposta cirúrgica.',
    alternativas: [
      'Claro! Nossas soluções variam entre [Preço Base] e [Preço Âncora] dependendo da complexidade do projeto. Para te passar o número exato, podemos fazer uma chamada rápida de 5 minutos agora ou prefere às 16h?',
      'Envio sim! Para adiantar: nós trabalhamos com pacotes completos a partir de [Preço Normal]. O que acha de darmos uma olhada rápida juntos para você ver o que está incluso antes de eu formalizar?',
    ],
    serviceId: 'srv-lp',
    serviceName: 'Landing Page de Alta Conversão',
    stage: 'PRIMEIRO_CONTACTO',
    observacoes: 'Evite virar "comparador de preço". Dê uma faixa com preço âncora e use o orçamento como gancho para qualificar.',
    category: 'orcamento',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'obj-sem-dinheiro',
    name: 'Sem dinheiro / Sem orçamento no momento',
    context: 'Prospect alega restrição orçamentária ou momento de corte de custos.',
    response: 'Entendo perfeitamente, [Nome]. Justamente por o momento exigir cautela, soluções que se pagam rápido são as mais estratégicas. Nosso formato foi desenhado para gerar retorno já nas primeiras semanas. Além disso, temos opções com condições facilitadas e parcelamento que não comprometem seu fluxo de caixa. Faz sentido avaliarmos?',
    alternativas: [
      'Totalmente compreensível. Que tal formatarmos uma primeira etapa reduzida (MVP) para validar o canal, gerar receita e aí sim reinvestirmos no projeto completo?',
      'Sem problemas! Posso te perguntar quando inicia o novo ciclo de planejamento orçamentário da [Empresa], para retomarmos no momento ideal?',
    ],
    serviceId: 'srv-lp',
    serviceName: 'Landing Page de Alta Conversão',
    stage: 'NEGOCIAÇÃO',
    observacoes: 'Ofereça alternativa de escopo ou parcelamento, sem dar desconto no valor do seu trabalho.',
    category: 'preco',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'obj-fale-depois',
    name: 'Fale depois / Me procure no próximo mês / semestre',
    context: 'Prospect está ocupado ou empurrando a conversa para frente.',
    response: 'Perfeito, [Nome], anotei aqui para te chamar no dia [Data futura]. Mas me diga uma coisa: do que você precisa ver até lá para que nessa próxima conversa nós possamos tomar uma decisão prática e colocar o projeto no ar?',
    alternativas: [
      'Combinado! Vou respeitar o seu calendário. Para eu já reservar espaço na minha agenda técnica daquele mês, podemos deixar um pré-agendamento de 10 minutos confirmado para a primeira terça-feira?',
      'Tranquilo! Sei que a rotina está puxada. Se eu te enviar um resumo de 1 página com os 3 pontos críticos que sua equipe pode ir ajustando aos poucos, te ajuda?',
    ],
    serviceId: 'srv-website',
    serviceName: 'Website Institucional Corporativo',
    stage: 'ADIADO',
    observacoes: 'Fixe um compromisso concreto e descubra o que precisa mudar até a data futura.',
    category: 'timing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'obj-consultar-socio',
    name: 'Preciso consultar meu sócio / diretoria',
    context: 'Decisor ou influenciador precisa de aprovação de terceiros na empresa.',
    response: 'Faz todo sentido, [Nome], decisões importantes na [Empresa] precisam ser alinhadas. O que você acha de marcarmos 15 minutos onde eu apresento os números e cases diretamente para você e seu sócio juntos? Assim eu respondo qualquer dúvida técnica na hora e você não precisa carregar o peso de defender a proposta sozinho.',
    alternativas: [
      'Excelente! Para te ajudar nessa conversa interna, posso te preparar um sumário executivo de 1 página com os pontos de ROI e impacto no faturamento da empresa. O que acha?',
      'Perfeito! Na sua visão pessoal, tem algum ponto que você acha que seu sócio pode hesitar ou fazer ressalva? Assim já te preparo com as respostas exatas.',
    ],
    serviceId: 'srv-consultoria',
    serviceName: 'Diagnóstico & Estruturação Comercial',
    stage: 'PROPOSTA',
    observacoes: 'Nunca deixe o prospect apresentar sua proposta sozinho para o sócio sem munição executiva.',
    category: 'decisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * 7. BIBLIOTECA DE PROVAS SOCIAIS E CASES DE SUCESSO
 */
export const SEED_PROOFS: ProofItem[] = [
  {
    id: 'proof-1',
    title: 'Clínica Odontológica Sorriso Prime: +240% em Agendamentos',
    description: 'Implementação de Landing Page de alta velocidade integrada a tráfego local no Google e botão WhatsApp com rastreamento.',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
    url: 'https://exemplo-case-odonto.com.br',
    serviceId: 'srv-lp',
    serviceName: 'Landing Page de Alta Conversão',
    niche: 'Odontologia & Estética',
    result: '+240% em agendamentos no 1º mês e redução de 48% no custo por lead.',
    beforeAfter: {
      beforeText: 'Site institucional lento (4.8s) com formulário longo que ninguém preenchia e apenas 8 contatos/mês.',
      afterText: 'Página ultra-rápida (0.9s), copy persuasiva de procedimentos estéticos e 27 agendamentos na 1ª semana.',
    },
    clientName: 'Dr. Roberto Mendes - Clínica Sorriso Prime',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proof-2',
    title: 'Advocacia Tributária Martins: Contrato de R$ 85k Fechado',
    description: 'Reformulação do portal institucional e esteira de autoridade B2B com SEO focado em teses tributárias empresariais.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    url: 'https://martins-advocacia-tributaria.com.br',
    serviceId: 'srv-website',
    serviceName: 'Website Institucional Corporativo',
    niche: 'Advocacia & Jurídico',
    result: '1º contrato fechado de R$ 85.000 em honorários em 45 dias de ar.',
    beforeAfter: {
      beforeText: 'Sem presença online profissional; clientes grandes questionavam a solidez do escritório.',
      afterText: 'Portal premium com selo de autoridade, teses explicadas e qualificação prévia de empresas.',
    },
    clientName: 'Dra. Helena Martins - Martins & Associados',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proof-3',
    title: 'BPO Financeiro Vertex: 32 Reuniões Qualificadas/Mês',
    description: 'Estruturação da máquina de prospecção outbound e páginas de diagnóstico financeiro gratuito.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    url: 'https://vertexbpo.com.br',
    serviceId: 'srv-consultoria',
    serviceName: 'Diagnóstico & Estruturação Comercial',
    niche: 'Contabilidade & BPO Financeiro',
    result: '32 reuniões comerciais agendadas por mês com taxa de conversão de 28%.',
    beforeAfter: {
      beforeText: 'Time comercial dependia 100% de indicações esporádicas e sem cadência de follow-up.',
      afterText: 'Funil outbound previsível, scripts de vendas testados e CRM 100% preenchido.',
    },
    clientName: 'Carlos Eduardo - CEO Vertex Finance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * 8. BIBLIOTECA DE PREÇOS, PACOTES E OFERTAS
 * Regra: Não aplicar desconto automaticamente.
 */
export const SEED_PRICING: PricingItem[] = [
  {
    id: 'price-lp-padrao',
    name: 'Landing Page de Alta Conversão - Setup Completo',
    serviceId: 'srv-lp',
    serviceName: 'Landing Page de Alta Conversão',
    regularPrice: 2500,
    anchorPrice: 4500,
    specialOffer: 'Bônus: 30 dias de suporte prioritário + Pixel Meta/Google configurado sem custo adicional.',
    packageDetails: 'Copywriting persuasivo, Design exclusivo mobile-first, Entrega em 7 dias, Integração WhatsApp e hospedagem rápida.',
    alternativeOption: 'Condição alternativa: Entrada de R$ 1.000 + 2x de R$ 850 sem juros (ou escopo One-Page Essencial por R$ 1.900).',
    currency: 'BRL',
    notes: 'Preço âncora de R$ 4.500 deve ser apresentado primeiro para reforçar o valor do entregável. Não aplicar desconto automaticamente.',
    autoDiscountApplied: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'price-website-corp',
    name: 'Website Institucional Corporativo Premium',
    serviceId: 'srv-website',
    serviceName: 'Website Institucional Corporativo',
    regularPrice: 6000,
    anchorPrice: 9500,
    specialOffer: 'Oferta: Inclui Blog de autoridade e Otimização SEO inicial para o Google da sua cidade.',
    packageDetails: 'Até 6 páginas institucionais, Painel de controle para gerenciar textos, Certificado SSL vitalício e Otimização PageSpeed.',
    alternativeOption: 'Alternativa: 4x de R$ 1.650 no boleto/cartão faturado para PJ.',
    currency: 'BRL',
    notes: 'Proposta institucional ideal para empresas com 2 ou mais sócios/unidades.',
    autoDiscountApplied: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'price-consultoria-comercial',
    name: 'Estruturação Comercial & Prospecção Outbound',
    serviceId: 'srv-consultoria',
    serviceName: 'Diagnóstico & Estruturação Comercial',
    regularPrice: 4500,
    anchorPrice: 7500,
    specialOffer: 'Bônus: Scripts de abordagem testados e treinamento gravado para a equipe.',
    packageDetails: 'Mapeamento de ICP, Criação da cadência de prospecção, Modelos de mensagem e acompanhamento semanal por 30 dias.',
    alternativeOption: 'Alternativa: Diagnóstico pontual de 2 semanas por R$ 2.500.',
    currency: 'BRL',
    notes: 'Foco em geração de reuniões para empresas B2B e serviços de alto ticket.',
    autoDiscountApplied: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * 9. BIBLIOTECA DE CTAs (CALLS TO ACTION)
 */
export const SEED_CTAS: CtaItem[] = [
  {
    id: 'cta-1',
    title: 'Bate-papo Rápido de 10 min (Diagnóstico)',
    ctaText: 'Podemos agendar um bate-papo de 10 minutos nesta quinta-feira para te mostrar os 3 pontos práticos para acelerar sua geração de demanda?',
    category: 'reuniao',
    funnelStage: 'PRIMEIRO_CONTACTO',
  },
  {
    id: 'cta-2',
    title: 'Pergunta Direta de Interesse no WhatsApp',
    ctaText: 'Faz sentido avaliarmos uma sinergia rápida para a [Empresa] nesta semana?',
    category: 'whatsapp',
    funnelStage: 'PRIMEIRO_CONTACTO',
  },
  {
    id: 'cta-3',
    title: 'Convite para Apresentação Executiva',
    ctaText: 'Tenho disponibilidade amanhã às 10h ou quinta às 15h. Qual horário fica mais conveniente para você?',
    category: 'reuniao',
    funnelStage: 'QUALIFICADO',
  },
  {
    id: 'cta-4',
    title: 'Aprovação de Proposta / Próximo Passo',
    ctaText: 'Se o escopo estiver de acordo, posso gerar a ordem de serviço para iniciarmos a entrega ainda nesta semana?',
    category: 'proposta',
    funnelStage: 'PROPOSTA',
  },
  {
    id: 'cta-5',
    title: 'Envio de Case em PDF / Áudio Curto',
    ctaText: 'Posso te enviar um resumo de 2 minutos em PDF com os números desse case ou prefere um rápido áudio?',
    category: 'whatsapp',
    funnelStage: 'RESPONDEU',
  },
];

/**
 * 10. BIBLIOTECA DE ESTRATÉGIAS DE FOLLOW-UP
 */
export const SEED_FOLLOWUPS: FollowUpStrategyItem[] = [
  {
    id: 'fol-1',
    name: 'Follow-up 1: Toque Suave (48 horas)',
    dayOffset: 2,
    objective: 'Relembrar a conversa de forma educada e sem parecer desesperado.',
    angle: 'Checar se o decisor teve tempo de ver a mensagem anterior.',
    script: 'Olá, [Nome]! Passando apenas para dar um toque sobre nosso contato anterior a respeito de [Serviço]. Conseguiu dar uma olhada? Fico à disposição para uma rápida conversa.',
  },
  {
    id: 'fol-2',
    name: 'Follow-up 2: Prova Social & Case (5 dias)',
    dayOffset: 5,
    objective: 'Agregar valor novo e despertar interesse com resultado real de um concorrente/parceiro.',
    angle: 'Compartilhar número de impacto ou resultado prático.',
    script: 'Olá, [Nome]! Lembrei da [Empresa] porque acabamos de concluir um projeto para uma empresa de [Nicho] que aumentou em [Resultado]. Pensei que você gostaria de ver a estrutura que usamos: [URL]. Faz sentido para vocês?',
  },
  {
    id: 'fol-3',
    name: 'Follow-up 3: Consultivo / Pergunta de Dor (10 dias)',
    dayOffset: 10,
    objective: 'Descobrir qual o maior obstáculo atual para o avanço da empresa.',
    angle: 'Foco na dor do cliente e nos custos de não resolver.',
    script: '[Nome], sei que a rotina aí deve estar intensa. Direto ao ponto: qual é hoje o maior desafio da [Empresa] em relação a [Problema]? Podemos te ajudar com uma recomendação prática.',
  },
  {
    id: 'fol-4',
    name: 'Follow-up 4: Break-up Educado / Ultimato (20 dias)',
    dayOffset: 20,
    objective: 'Tirar a pressão e fazer o prospect responder por medo de perder a oportunidade.',
    angle: 'Encerramento de contato temporário com respeito.',
    script: '[Nome], como não tive retorno, imagino que essa não seja a prioridade da [Empresa] no momento. Vou encerrar meus contatos por aqui para não sobrecarregar sua caixa. Se no futuro fizer sentido destravar [Serviço], será um prazer conversar!',
  },
  {
    id: 'fol-5',
    name: 'Follow-up 5: Reativação Sazonal (45 a 60 dias)',
    dayOffset: 45,
    objective: 'Reabrir conversas antigas no início de novo mês ou trimestre.',
    angle: 'Novas metas e novidades do mercado.',
    script: 'Olá, [Nome], tudo bem? Estamos iniciando o planejamento deste novo mês e lembrei das metas comerciais da [Empresa]. Como estão os resultados por aí desde nossa última conversa?',
  },
];

export interface DiagnosticQuestion {
  id: string;
  pillar: 'contexto' | 'causa' | 'consequencia';
  pillarLabel: string;
  question: string;
  goal: string;
  category: string;
  recommendedTone: string;
}

export interface StateDiagnosisItem {
  id: string;
  stateType: 'atual' | 'desejado' | 'temido';
  title: string;
  description: string;
  triggerQuestions: string[];
  painOrGain: string;
}

export interface PlaybookObjection {
  id: string;
  title: string;
  category: 'preco' | 'timing' | 'confianca' | 'concorrencia' | 'autoridade';
  categoryLabel: string;
  mindset: string;
  bestResponse: string;
  alternativeResponse: string;
  reflexiveQuestion: string;
  ruleOfThumb: string;
}

export const PLAYBOOK_3C_QUESTIONS: DiagnosticQuestion[] = [
  // 1. CONTEXTO (C1)
  {
    id: 'c1_1',
    pillar: 'contexto',
    pillarLabel: 'C1 — Contexto',
    question: 'Como chegam os novos clientes para a {{empresa}} hoje? É mais por indicação, busca no Google ou redes sociais?',
    goal: 'Mapear a fonte atual de clientes e entender se há dependência excessiva de boca a boca.',
    category: 'Origem de Demanda',
    recommendedTone: 'Curioso e consultivo',
  },
  {
    id: 'c1_2',
    pillar: 'contexto',
    pillarLabel: 'C1 — Contexto',
    question: 'Hoje, quando alguém pesquisa pelo seu serviço no Google na sua cidade, como sua empresa aparece em relação aos concorrentes?',
    goal: 'Fazer o prospect refletir sobre a sua visibilidade e relevância digital local.',
    category: 'Presença Digital',
    recommendedTone: 'Direto e profissional',
  },
  {
    id: 'c1_3',
    pillar: 'contexto',
    pillarLabel: 'C1 — Contexto',
    question: 'Qual é a estrutura atual de atendimento de vocês quando um contato chega pelo WhatsApp ou site?',
    goal: 'Identificar a velocidade e maturidade da equipe comercial interna.',
    category: 'Processo Comercial',
    recommendedTone: 'Investigativo',
  },

  // 2. CAUSA (C2)
  {
    id: 'c2_1',
    pillar: 'causa',
    pillarLabel: 'C2 — Causa',
    question: 'O que você sente que hoje é o principal gargalo para a {{empresa}} fechar mais contratos ou agendamentos todo mês?',
    goal: 'Acessar a percepção de causa raiz pelo próprio decisor.',
    category: 'Gargalo Principal',
    recommendedTone: 'Empático',
  },
  {
    id: 'c2_2',
    pillar: 'causa',
    pillarLabel: 'C2 — Causa',
    question: 'Vocês já tentaram resolver isso antes com outra agência ou ferramenta? O que acabou não dando certo?',
    goal: 'Descobrir traumas passados, promessas não cumpridas ou fornecedores ruins.',
    category: 'Histórico de Tentativas',
    recommendedTone: 'Compreensivo e atento',
  },
  {
    id: 'c2_3',
    pillar: 'causa',
    pillarLabel: 'C2 — Causa',
    question: 'A equipe gasta muito tempo em processos manuais ou respondendo perguntas repetitivas de curiosos que não compram?',
    goal: 'Evidenciar o desperdício de tempo e esforço operacional da equipe.',
    category: 'Eficiência Operacional',
    recommendedTone: 'Técnico e reflexivo',
  },

  // 3. CONSEQUÊNCIA (C3)
  {
    id: 'c3_1',
    pillar: 'consequencia',
    pillarLabel: 'C3 — Consequência',
    question: 'Se esse gargalo continuar igual nos próximos 6 meses, qual o impacto no faturamento e na expansão da {{empresa}}?',
    goal: 'Tornar tangível o custo da inação e o valor de resolver agora.',
    category: 'Custo da Inação',
    recommendedTone: 'Firme e reflexivo',
  },
  {
    id: 'c3_2',
    pillar: 'consequencia',
    pillarLabel: 'C3 — Consequência',
    question: 'Quantos novos clientes ou atendimentos qualificados vocês deixam de captar toda semana por não terem essa estrutura ativa?',
    goal: 'Quantificar o custo de oportunidade e calibrar o ROI da solução.',
    category: 'Perda de Oportunidade',
    recommendedTone: 'Calculado e instigante',
  },
  {
    id: 'c3_3',
    pillar: 'consequencia',
    pillarLabel: 'C3 — Consequência',
    question: 'Como seria a rotina da sua operação se 100% dos contatos chegassem já qualificados e sabendo exatamente o valor do seu serviço?',
    goal: 'Gerar o contraste positivo com a solução implementada.',
    category: 'Visão de Futuro',
    recommendedTone: 'Visionário e inspirador',
  },
];

export const PLAYBOOK_3_STATES: StateDiagnosisItem[] = [
  {
    id: 'state_atual',
    stateType: 'atual',
    title: 'Estado Atual (Onde estão hoje)',
    description: 'Diagnóstico da dor imediata, ineficiências manuais, perda de clientes e dependência de canais passivos.',
    triggerQuestions: [
      'Como funciona o dia a dia da captação?',
      'Qual a taxa média de conversão dos contatos recebidos?',
      'O que mais toma tempo da equipe comercial?',
    ],
    painOrGain: 'Frustração com previsibilidade instável e esforço comercial desproporcional ao resultado.',
  },
  {
    id: 'state_desejado',
    stateType: 'desejado',
    title: 'Estado Desejado (Onde querem chegar)',
    description: 'A meta clara de faturamento, volume de agendamentos previsíveis, marca forte e processos automatizados.',
    triggerQuestions: [
      'Qual a meta de faturamento ou novos clientes para o próximo trimestre?',
      'Como você gostaria que o cliente ideal visualizasse sua marca?',
      'Qual seria o cenário ideal de operação para você?',
    ],
    painOrGain: 'Tranquilidade, alta conversão, autoridade de mercado e previsibilidade de caixa.',
  },
  {
    id: 'state_temido',
    stateType: 'temido',
    title: 'Estado Temido (O que acontece se nada mudar)',
    description: 'O risco de ficar para trás dos concorrentes mais ágeis, perda contínua de margem e estagnação da marca.',
    triggerQuestions: [
      'Seus principais concorrentes já estão investindo nisso?',
      'O que acontece com a margem do negócio se os custos subirem e as vendas ficarem estáveis?',
      'Até quando faz sentido adiar essa estruturação?',
    ],
    painOrGain: 'Urgência legítima de evolução sem manipulação ou falsa escassez.',
  },
];

export const PLAYBOOK_OBJECTIONS: PlaybookObjection[] = [
  {
    id: 'obj_preco',
    title: 'Preço: "Achei caro" / "Fora do orçamento"',
    category: 'preco',
    categoryLabel: 'Preço & Investimento',
    mindset: 'O cliente compara com uma despesa e não com o retorno que o projeto trará.',
    bestResponse: 'Compreendo perfeitamente, {{nome}}. Se olharmos como um custo isolado, qualquer investimento parece alto. Porém, considerando que essa estrutura visa gerar X novos clientes por mês, o projeto se paga no primeiro trimestre. Faz sentido avaliarmos um escopo faseado?',
    alternativeResponse: 'Totalmente compreensível. O que precisamos garantir no projeto para que esse valor seja um excelente investimento e não um gasto para a {{empresa}}?',
    reflexiveQuestion: 'Quantos novos clientes você precisa fechar para recuperar 100% deste investimento?',
    ruleOfThumb: 'Nunca dê desconto sem reduzir o escopo; ancorar sempre no ROI.',
  },
  {
    id: 'obj_timing',
    title: 'Timing: "Não é o momento" / "Muito ocupado agora"',
    category: 'timing',
    categoryLabel: 'Timing & Prioridade',
    mindset: 'O cliente não vê urgência imediata ou está sobrecarregado operacionalmente.',
    bestResponse: 'Entendo perfeitamente que a rotina esteja cheia, {{nome}}. Justamente por isso essa solução foi desenhada para tirar trabalho manual da sua equipe, e não para adicionar tarefas. Cuidamos de 90% da execução.',
    alternativeResponse: 'Perfeito, vou respeitar o momento de vocês. Podemos marcar uma data fixa no início do próximo mês para retomarmos com calma?',
    reflexiveQuestion: 'O que precisa mudar na sua rotina para que estruturar suas vendas seja prioridade?',
    ruleOfThumb: 'Mostre que a solução alivia o tempo do decisor em vez de consumir mais tempo.',
  },
  {
    id: 'obj_concorrencia',
    title: 'Concorrência: "Já temos alguém que faz isso"',
    category: 'concorrencia',
    categoryLabel: 'Concorrência & Fornecedores',
    mindset: 'O cliente tem uma agência ou sobrinho/amigo que atende de forma passiva.',
    bestResponse: 'Excelente que já tenham um parceiro! Nossa intenção não é cancelar o trabalho existente, mas sim auditar e complementar pontos onde você pode estar perdendo conversões silenciosamente.',
    alternativeResponse: 'Ótimo! Como está o retorno medido em vendas hoje com o formato atual? Costumamos ser contratados justamente para trazer um segundo olhar mais agressivo em resultados.',
    reflexiveQuestion: 'Se fizéssemos um teste ou diagnóstico de 5 minutos sem custo, você toparia ver os pontos de melhoria?',
    ruleOfThumb: 'Não critique o prestador atual; ofereça um diagnóstico complementar de valor.',
  },
  {
    id: 'obj_confianca',
    title: 'Confiança: "Já tive experiências ruins no passado"',
    category: 'confianca',
    categoryLabel: 'Confiança & Garantia',
    mindset: 'O cliente já pagou caro por promessas vazias e está cético.',
    bestResponse: 'Te entendo perfeitamente, {{nome}}. O mercado está cheio de promessas mágicas. Por isso trabalhamos com entregas faseadas, contrato transparente e alinhamento claro de expectativas sem milagres.',
    alternativeResponse: 'Sei bem como é frustrante investir e não ver resultado. Que tal começarmos com uma etapa menor de validação para você conhecer nossa entrega na prática?',
    reflexiveQuestion: 'Quais foram os pontos que mais te decepcionaram na experiência anterior para garantirmos que não se repitam aqui?',
    ruleOfThumb: 'Demonstre transparência radical e apresente cases reais do mesmo nicho.',
  },
  {
    id: 'obj_autoridade',
    title: 'Autoridade: "Preciso falar com meu sócio / diretoria"',
    category: 'autoridade',
    categoryLabel: 'Decisão & Sócios',
    mindset: 'O contato não quer tomar a decisão sozinho ou está usando isso como escudo.',
    bestResponse: 'Com certeza! É fundamental que todos estejam alinhados. Para facilitar, posso participar de 10 minutos da reunião de vocês ou preparar um resumo executivo de 1 página com o ROI do projeto?',
    alternativeResponse: 'Perfeito. Quais são os principais critérios que seu sócio costuma avaliar para darmos o próximo passo juntos?',
    reflexiveQuestion: 'Na sua visão particular, você aprovaria a implementação da proposta?',
    ruleOfThumb: 'Municiar o contato interno com dados claros para que ele venda a ideia internamente.',
  },
];

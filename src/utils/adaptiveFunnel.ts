import { ContactChannel, LeadStage } from '../types';

export interface AdaptiveScenario {
  id: string;
  label: string;
  category: 'resposta' | 'status' | 'objecao' | 'timing';
  iconName: string;
  description: string;
  recommendedStage: LeadStage;
  recommendedActionTitle: string;
  recommendedChannel: ContactChannel;
  delayHours: number; // Em quanto tempo executar a ação
  objective: string;
  pitchRationale: string;
  scriptTemplate: string;
  contingencyTip: string;
}

export const ADAPTIVE_SCENARIOS: AdaptiveScenario[] = [
  {
    id: 'nao_e_decisor',
    label: 'Não é o decisor (Secretária / Atendente / Receção)',
    category: 'status',
    iconName: 'UserCheck',
    description: 'O contato inicial informou que as decisões comerciais são tomadas por outra pessoa.',
    recommendedStage: 'QUALIFICADO',
    recommendedActionTitle: 'Mapear e contatar decisor responsável',
    recommendedChannel: 'whatsapp',
    delayHours: 2,
    objective: 'Obter o contato direto do responsável sem parecer invasivo.',
    pitchRationale: 'Valorizar o papel do atendente e pedir a ponte direta com o gestor responsável.',
    scriptTemplate: 'Perfeito, obrigado pela atenção! Quem costuma cuidar das decisões de [servico] e novos projetos aí na {{empresa}}? Poderia me passar o contato direto ou e-mail dele(a) para eu enviar um material de 2 minutos?',
    contingencyTip: 'Se não passarem o WhatsApp, peça o nome do decisor e o e-mail corporativo ou busque pelo LinkedIn.',
  },
  {
    id: 'pediu_orcamento',
    label: 'Pediu orçamento / "Quanto custa?" de imediato',
    category: 'resposta',
    iconName: 'DollarSign',
    description: 'O prospect pulou para o preço antes de entender o escopo ou valor gerado.',
    recommendedStage: 'PROPOSTA',
    recommendedActionTitle: 'Propor alinhamento de escopo antes do preço',
    recommendedChannel: 'whatsapp',
    delayHours: 1,
    objective: 'Ancorar valor e calibrar a necessidade exata antes de passar uma proposta cega.',
    pitchRationale: 'Explicar que o investimento varia conforme o objetivo e propor 10 min de diagnóstico.',
    scriptTemplate: 'Olá, {{nome}}! Nosso investimento varia conforme o escopo e o momento da {{empresa}}, mas costuma ficar em torno de {{faixa_preco}}.\n\nPara te passar um valor exato e personalizado sem desperdício, podemos fazer uma rápida chamada de 10 minutos amanhã às 10h ou 15h?',
    contingencyTip: 'Nunca envie apenas um número frio por PDF sem antes definir a meta ou fazer perguntas de diagnóstico.',
  },
  {
    id: 'sem_resposta_3d',
    label: 'Sem resposta após 3 dias (Follow-up de Valor)',
    category: 'timing',
    iconName: 'Clock',
    description: 'A mensagem anterior foi visualizada ou ignorada há mais de 72 horas.',
    recommendedStage: 'SEM_RESPOSTA_3',
    recommendedActionTitle: 'Follow-up agregando case ou dica técnica',
    recommendedChannel: 'whatsapp',
    delayHours: 0,
    objective: 'Reativar o diálogo gerando valor sem cobrança de resposta.',
    pitchRationale: 'Compartilhar um dado ou exemplo do mesmo nicho para retomar o interesse.',
    scriptTemplate: 'Olá, {{nome}}! Passando rápido apenas para compartilhar um ponto interessante: recentemente ajudamos uma empresa de {{nicho}} a resolver exatamente {{problema_comum}} com um ganho de +{{resultado_exemplo}}.\n\nLembrei da {{empresa}}. Faz sentido darmos uma olhada rápida nisso juntos esta semana?',
    contingencyTip: 'Evite frases como "você viu minha mensagem anterior?". Foque sempre em novidade ou insight.',
  },
  {
    id: 'achou_caro',
    label: 'Objeção de Preço ("Ficou caro" / "Fora do orçamento")',
    category: 'objecao',
    iconName: 'TrendingDown',
    description: 'O prospect considerou o valor acima do esperado ou da sua capacidade momentânea.',
    recommendedStage: 'OBJEÇÃO',
    recommendedActionTitle: 'Quebra de objeção de preço e plano faseado',
    recommendedChannel: 'whatsapp',
    delayHours: 4,
    objective: 'Demonstrar retorno sobre o investimento (ROI) e flexibilizar escopo em fases.',
    pitchRationale: 'Isolar a objeção e propor um piloto com investimento proporcional.',
    scriptTemplate: 'Compreendo perfeitamente, {{nome}}. Quando se trata de novos investimentos na {{empresa}}, o retorno precisa ser cristalino.\n\nSe separarmos o projeto em 2 fases — entregando primeiro a parte de maior impacto imediato por um valor reduzido —, ficaria mais viável para vocês?',
    contingencyTip: 'Não dê descontos imediatos sem reduzir o escopo da entrega, para não desvalorizar seu trabalho.',
  },
  {
    id: 'pediu_falar_depois',
    label: 'Pediu para falar no próximo mês / "Muito ocupado agora"',
    category: 'timing',
    iconName: 'Calendar',
    description: 'O prospect está no meio de outros projetos e pediu retorno futuro.',
    recommendedStage: 'QUALIFICADO',
    recommendedActionTitle: 'Agendar retorno com gancho personalizado',
    recommendedChannel: 'whatsapp',
    delayHours: 0,
    objective: 'Fixar uma data clara na agenda e deixar uma impressão memorável.',
    pitchRationale: 'Respeitar a rotina do prospect e pedir permissão para um check-in pontual.',
    scriptTemplate: 'Totalmente compreensível, {{nome}}! Sei como a rotina na {{empresa}} é corrida. Vou anotar aqui para te dar um ' +
      'alô na primeira semana do mês que vem. Enquanto isso, posso te mandar um breve guia prático sobre {{nicho}}?',
    contingencyTip: 'Cadastre a ação no Agendador exatamente para o primeiro dia útil do mês seguinte com a anotação do gancho.',
  },
  {
    id: 'ja_possui_fornecedor',
    label: 'Já possui agência / prestador de serviço',
    category: 'objecao',
    iconName: 'ShieldCheck',
    description: 'A empresa já trabalha com alguém no mesmo segmento do seu serviço.',
    recommendedStage: 'OBJEÇÃO',
    recommendedActionTitle: 'Posicionar como segundo olhar / auditoria complementar',
    recommendedChannel: 'whatsapp',
    delayHours: 24,
    objective: 'Plantar uma alternativa sem atacar o fornecedor atual.',
    pitchRationale: 'Oferecer uma auditoria rápida gratuita de segundo olhar para comparar pontos cegos.',
    scriptTemplate: 'Excelente saber que já têm essa frente ativa, {{nome}}! Nosso objetivo não é substituir quem já atende vocês, mas sim oferecer um segundo olhar técnico sobre os resultados.\n\nSe eu fizer uma análise rápida de 5 minutos sem custo sobre seus pontos de conversão, você toparia conferir?',
    contingencyTip: 'Muitos clientes insatisfeitos com seus prestadores atuais aproveitam auditorias para trocar de fornecedor.',
  },
  {
    id: 'pediu_portfolio',
    label: 'Pediu portfólio / apresentação / materiais',
    category: 'resposta',
    iconName: 'FileText',
    description: 'O prospect quer ver exemplos concretos de trabalhos anteriores.',
    recommendedStage: 'QUALIFICADO',
    recommendedActionTitle: 'Enviar case específico com pergunta de fechamento',
    recommendedChannel: 'whatsapp',
    delayHours: 0,
    objective: 'Enviar 1 ou 2 cases cirúrgicos do mesmo nicho acompanhados de CTA claro.',
    pitchRationale: 'Evitar envio de PDF genérico de 30 páginas; enviar print/link direto do melhor resultado.',
    scriptTemplate: 'Com certeza, {{nome}}! Veja este projeto recente que entregamos para um cliente de {{nicho}}: [link_ou_case].\n\nNeste projeto, o foco foi {{problema_resolvido}}. O que você achou desta estrutura para a {{empresa}}?',
    contingencyTip: 'Sempre encerre o envio do portfólio com uma pergunta direta para manter o ritmo da conversa.',
  },
  {
    id: 'desinteresse_momento',
    label: 'Sem interesse no momento / Descarte respeitoso',
    category: 'status',
    iconName: 'Archive',
    description: 'O lead recusou a proposta no momento atual.',
    recommendedStage: 'PERDIDO',
    recommendedActionTitle: 'Agradecer e programar reativação em 60 dias',
    recommendedChannel: 'whatsapp',
    delayHours: 0,
    objective: 'Encerrar cordialmente deixando a porta aberta para o futuro.',
    pitchRationale: 'Agradecer a atenção e garantir que o contato permaneça positivo na base.',
    scriptTemplate: 'Sem problemas, {{nome}}! Muito obrigado pelo retorno sincero. Desejo muito sucesso nas operações da {{empresa}}.\n\nFico à disposição se um dia fizer sentido retomarmos!',
    contingencyTip: 'Deixe agendada uma reativação na cadência automática para daqui a 60 a 90 dias.',
  },
];

export function getAdaptiveScenarioById(id: string): AdaptiveScenario | undefined {
  return ADAPTIVE_SCENARIOS.find((s) => s.id === id);
}

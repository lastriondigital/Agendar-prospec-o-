import { LeadStage, PipelineStage, RouteId } from '../types';

export interface StageDefinition {
  id: LeadStage;
  label: string;
  order: number;
  color: string;
  badgeVariant: 'neutral' | 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'cyan';
  description: string;
  statusMapping: 'new' | 'in_contact' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'archived';
}

export const STAGES_CONFIG: Record<LeadStage, StageDefinition> = {
  NOVO: {
    id: 'NOVO',
    label: 'Novo Lead',
    order: 1,
    color: 'blue',
    badgeVariant: 'blue',
    description: 'Lead recém-cadastrado na base',
    statusMapping: 'new',
  },
  QUALIFICADO: {
    id: 'QUALIFICADO',
    label: 'Qualificado',
    order: 2,
    color: 'cyan',
    badgeVariant: 'cyan',
    description: 'Enquadra no perfil de cliente ideal (ICP)',
    statusMapping: 'qualified',
  },
  PRIMEIRO_CONTACTO: {
    id: 'PRIMEIRO_CONTACTO',
    label: 'Primeiro Contacto',
    order: 3,
    color: 'sky',
    badgeVariant: 'blue',
    description: 'Mensagem ou ligação inicial enviada',
    statusMapping: 'in_contact',
  },
  SEM_RESPOSTA_2: {
    id: 'SEM_RESPOSTA_2',
    label: 'Sem Resposta — Tentativa 2',
    order: 4,
    color: 'amber',
    badgeVariant: 'amber',
    description: 'Segundo follow-up enviado aguardando retorno',
    statusMapping: 'in_contact',
  },
  SEM_RESPOSTA_3: {
    id: 'SEM_RESPOSTA_3',
    label: 'Sem Resposta — Tentativa 3',
    order: 5,
    color: 'orange',
    badgeVariant: 'amber',
    description: 'Terceiro follow-up com nova abordagem',
    statusMapping: 'in_contact',
  },
  SEM_RESPOSTA_OUTRO_HORARIO: {
    id: 'SEM_RESPOSTA_OUTRO_HORARIO',
    label: 'Sem Resposta — Outro Horário',
    order: 6,
    color: 'indigo',
    badgeVariant: 'purple',
    description: 'Tentativa em horário alternativo no mesmo dia',
    statusMapping: 'in_contact',
  },
  SEM_RESPOSTA_OUTRO_DIA: {
    id: 'SEM_RESPOSTA_OUTRO_DIA',
    label: 'Sem Resposta — Outro Dia',
    order: 7,
    color: 'slate',
    badgeVariant: 'neutral',
    description: 'Reagendado para outra data da semana',
    statusMapping: 'in_contact',
  },
  RESPOSTA_RECEBIDA: {
    id: 'RESPOSTA_RECEBIDA',
    label: 'Resposta Recebida',
    order: 8,
    color: 'indigo',
    badgeVariant: 'purple',
    description: 'Prospect respondeu à mensagem (sequência pausada)',
    statusMapping: 'in_contact',
  },
  RESPONDEU: {
    id: 'RESPONDEU',
    label: 'Respondeu',
    order: 8,
    color: 'indigo',
    badgeVariant: 'purple',
    description: 'Prospect deu retorno ou engajou na mensagem',
    statusMapping: 'in_contact',
  },
  RESPOSTA_POSITIVA: {
    id: 'RESPOSTA_POSITIVA',
    label: 'Resposta Positiva',
    order: 9,
    color: 'emerald',
    badgeVariant: 'emerald',
    description: 'Retorno receptivo ou aberto a conversar',
    statusMapping: 'qualified',
  },
  RESPOSTA_NEGATIVA: {
    id: 'RESPOSTA_NEGATIVA',
    label: 'Resposta Negativa',
    order: 10,
    color: 'rose',
    badgeVariant: 'rose',
    description: 'Sem interesse imediato ou sem orçamento',
    statusMapping: 'in_contact',
  },
  INTERESSADO: {
    id: 'INTERESSADO',
    label: 'Interessado',
    order: 11,
    color: 'teal',
    badgeVariant: 'emerald',
    description: 'Demonstrou interesse claro na proposta',
    statusMapping: 'qualified',
  },
  REUNIÃO: {
    id: 'REUNIÃO',
    label: 'Reunião Agendada',
    order: 12,
    color: 'purple',
    badgeVariant: 'purple',
    description: 'Call de diagnóstico ou demo marcada',
    statusMapping: 'proposal',
  },
  PROPOSTA: {
    id: 'PROPOSTA',
    label: 'Proposta Enviada',
    order: 13,
    color: 'amber',
    badgeVariant: 'amber',
    description: 'Oferta comercial apresentada',
    statusMapping: 'proposal',
  },
  NEGOCIAÇÃO: {
    id: 'NEGOCIAÇÃO',
    label: 'Em Negociação',
    order: 14,
    color: 'orange',
    badgeVariant: 'amber',
    description: 'Ajuste de contrato, escopo ou valor',
    statusMapping: 'negotiation',
  },
  CLIENTE: {
    id: 'CLIENTE',
    label: 'Cliente Fechado',
    order: 15,
    color: 'emerald',
    badgeVariant: 'emerald',
    description: 'Contrato assinado / negócio ganho',
    statusMapping: 'won',
  },
  SEM_RESPOSTA: {
    id: 'SEM_RESPOSTA',
    label: 'Sem Resposta',
    order: 16,
    color: 'slate',
    badgeVariant: 'neutral',
    description: 'Tentativa enviada sem retorno até o momento',
    statusMapping: 'in_contact',
  },
  OBJEÇÃO: {
    id: 'OBJEÇÃO',
    label: 'Objeção',
    order: 17,
    color: 'rose',
    badgeVariant: 'rose',
    description: 'Apresentou objeção que requer contorno',
    statusMapping: 'negotiation',
  },
  ADIADO: {
    id: 'ADIADO',
    label: 'Adiado / Nutrição',
    order: 18,
    color: 'zinc',
    badgeVariant: 'neutral',
    description: 'Pediu contato em momento futuro',
    statusMapping: 'in_contact',
  },
  PERDIDO: {
    id: 'PERDIDO',
    label: 'Perdido',
    order: 19,
    color: 'red',
    badgeVariant: 'rose',
    description: 'Negócio cancelado ou sem fit',
    statusMapping: 'lost',
  },
  REATIVAÇÃO: {
    id: 'REATIVAÇÃO',
    label: 'Reativação',
    order: 20,
    color: 'teal',
    badgeVariant: 'cyan',
    description: 'Lead reengajado após período inativo',
    statusMapping: 'new',
  },
};

export const ALL_LEAD_STAGES: LeadStage[] = [
  'NOVO',
  'QUALIFICADO',
  'PRIMEIRO_CONTACTO',
  'SEM_RESPOSTA_2',
  'SEM_RESPOSTA_3',
  'SEM_RESPOSTA_OUTRO_HORARIO',
  'SEM_RESPOSTA_OUTRO_DIA',
  'RESPOSTA_RECEBIDA',
  'RESPOSTA_POSITIVA',
  'RESPOSTA_NEGATIVA',
  'INTERESSADO',
  'REUNIÃO',
  'PROPOSTA',
  'NEGOCIAÇÃO',
  'CLIENTE',
  'SEM_RESPOSTA',
  'OBJEÇÃO',
  'ADIADO',
  'PERDIDO',
  'REATIVAÇÃO',
];

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: 'stage-novo', name: 'Novo Lead', order: 1, color: 'blue', statusMapping: 'new' },
  { id: 'stage-primeiro-contacto', name: 'Primeiro Contacto', order: 2, color: 'sky', statusMapping: 'in_contact' },
  { id: 'stage-sem-resposta-2', name: 'Sem Resposta — Tentativa 2', order: 3, color: 'amber', statusMapping: 'in_contact' },
  { id: 'stage-sem-resposta-3', name: 'Sem Resposta — Tentativa 3', order: 4, color: 'orange', statusMapping: 'in_contact' },
  { id: 'stage-resposta-recebida', name: 'Resposta Recebida', order: 5, color: 'indigo', statusMapping: 'in_contact' },
  { id: 'stage-interessado', name: 'Interessado', order: 6, color: 'teal', statusMapping: 'qualified' },
  { id: 'stage-reuniao', name: 'Reunião Agendada', order: 7, color: 'purple', statusMapping: 'proposal' },
  { id: 'stage-proposta', name: 'Proposta Enviada', order: 8, color: 'amber', statusMapping: 'proposal' },
  { id: 'stage-negociacao', name: 'Em Negociação', order: 9, color: 'orange', statusMapping: 'negotiation' },
  { id: 'stage-cliente', name: 'Cliente Fechado', order: 10, color: 'emerald', statusMapping: 'won' },
  { id: 'stage-perdido', name: 'Perdido', order: 11, color: 'red', statusMapping: 'lost' },
  { id: 'stage-reativacao', name: 'Reativação', order: 12, color: 'cyan', statusMapping: 'new' },
];

export const DEFAULT_WHATSAPP_SCRIPTS: Array<{
  id: string;
  type: string;
  name: string;
  template: string;
  description: string;
}> = [
  {
    id: 'script-primeiro-contacto',
    type: 'primeiro_contacto',
    name: '1. Primeiro Contacto (Objetivo & Curto)',
    description: 'Abordagem inicial personalizada com foco na necessidade aparente.',
    template:
      'Olá {{primeiro_nome}}, tudo bem? Notei que a {{empresa}} em {{cidade}} tem grande potencial em {{servico}}. Ajudamos empresas do nicho de {{nicho}} a {{beneficio}}. {{cta}}',
  },
  {
    id: 'script-follow-up-2',
    type: 'follow_up_2',
    name: '2. Follow-up 2 (Tentativa 2 — Agregação de Valor)',
    description: 'Segundo contato leve com pergunta de engajamento.',
    template:
      'Olá {{primeiro_nome}}, passando para saber se conseguiu avaliar minha mensagem anterior sobre {{servico}} para a {{empresa}}? Temos um case rápido de sucesso que pode te interessar. Posso te enviar?',
  },
  {
    id: 'script-follow-up-3',
    type: 'follow_up_3',
    name: '3. Follow-up 3 (Tentativa 3 — Mudança de Ângulo)',
    description: 'Focado em resolver o problema específico de forma direta.',
    template:
      '{{primeiro_nome}}, sei que seu dia a dia na {{empresa}} é corrido! Queria apenas entender: {{problema}} é uma prioridade para você neste trimestre? Se sim, 5 minutos de conversa podem clarear os próximos passos.',
  },
  {
    id: 'script-outro-horario',
    type: 'outro_horario',
    name: '4. Outro Horário no Mesmo Dia',
    description: 'Tentativa no final da tarde ou horário alternativo.',
    template:
      'Olá {{primeiro_nome}}, tudo bem? Tentei falar mais cedo e imagino que estava em atendimento. Te peguei num momento melhor agora para trocarmos 2 minutos sobre {{servico}}?',
  },
  {
    id: 'script-diagnostico',
    type: 'diagnostico',
    name: '5. Diagnóstico Gratuito / Avaliação',
    description: 'Oferta de valor sem atrito de venda.',
    template:
      'Olá {{primeiro_nome}}! Analisei o posicionamento da {{empresa}} em {{cidade}} e preparei 3 pontos práticos de melhoria para {{problema}}. Sem custo algum. Quer que eu te envie aqui no WhatsApp?',
  },
  {
    id: 'script-proposta',
    type: 'proposta',
    name: '6. Envio & Follow-up de Proposta',
    description: 'Apresentação comercial e validação de interesse.',
    template:
      'Olá {{primeiro_nome}}, conforme conversamos, preparei a proposta personalizada de {{servico}} para a {{empresa}}. O investimento base fica em {{preco}}. Quando podemos alinhar o início?',
  },
  {
    id: 'script-reativacao',
    type: 'reativacao',
    name: '7. Reativação de Contato',
    description: 'Para retomar contato com leads frios ou inativos.',
    template:
      'Olá {{primeiro_nome}}, faz um tempo que não nos falamos! Lembrei da {{empresa}} pois lançamos uma condição especial para {{nicho}} em {{servico}}. Faz sentido conversarmos esta semana?',
  },
];

export const DEFAULT_NICHES = [
  'Clínica Médica & Saúde',
  'Odontologia & Estética',
  'Advocacia & Jurídico',
  'Contabilidade & BPO Financeiro',
  'Imobiliária & Construtora',
  'E-commerce & Varejo',
  'Tecnologia & SaaS',
  'Academias & Fitness',
  'Educação & Cursos',
  'Restaurantes & Gastronomia',
  'Consultoria Empresarial',
  'Arquitetura & Engenharia',
  'Energia Solar & Sustentabilidade',
  'Outro',
];

export const DEFAULT_SOURCES = [
  'Outbound Direto',
  'Google Maps / Google Meu Negócio',
  'Instagram / Direct',
  'LinkedIn Prospecção',
  'Indicação de Cliente',
  'Site / Formulário',
  'Evento / Networking',
  'Campanha de Tráfego Pago',
  'Base Reativada',
  'Outro',
];

export interface NavigationItem {
  id: RouteId;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
  badgeCountKey?: 'pendingActions' | 'clientsCount' | 'campaignsCount';
  isPrimaryAction?: boolean;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Início',
    description: 'Visão executiva do dia e foco imediato',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'prospecting',
    label: 'Prospecção (Foco)',
    shortLabel: 'Executar',
    description: 'Modo execução rápida: ação por ação',
    iconName: 'Zap',
    badgeCountKey: 'pendingActions',
    isPrimaryAction: true,
  },
  {
    id: 'clients',
    label: 'Clientes & Leads',
    shortLabel: 'Clientes',
    description: 'Base de contatos, histórico e segmentação',
    iconName: 'Users',
    badgeCountKey: 'clientsCount',
  },
  {
    id: 'pipeline',
    label: 'Pipeline (Funil)',
    shortLabel: 'Funil',
    description: 'Quadro visual de estágios de negociação',
    iconName: 'Kanban',
  },
  {
    id: 'sales-engine',
    label: 'Sales Engine (Vendas)',
    shortLabel: 'Sales Engine',
    description: 'Objeções, Provas, Preços, Argumentos, CTAs e Abordagens',
    iconName: 'ShieldAlert',
  },
  {
    id: 'planner',
    label: 'Planejador',
    shortLabel: 'Agenda',
    description: 'Fila de tarefas e agendamento de follow-ups',
    iconName: 'CalendarCheck',
  },
  {
    id: 'messages',
    label: 'Mensagens & Scripts',
    shortLabel: 'Scripts',
    description: 'Modelos preparados com variáveis dinâmicas',
    iconName: 'MessageSquareText',
  },
  {
    id: 'campaigns',
    label: 'Campanhas',
    shortLabel: 'Campanhas',
    description: 'Estratégias organizadas por canal e meta',
    iconName: 'Target',
  },
  {
    id: 'services',
    label: 'Serviços & Qualificação (ICP)',
    shortLabel: 'Serviços & ICP',
    description: 'Catálogo de serviços, perfis de cliente ideal e regras de score',
    iconName: 'Briefcase',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    shortLabel: 'Métricas',
    description: 'Métricas essenciais e taxas de conversão',
    iconName: 'BarChart3',
  },
  {
    id: 'settings',
    label: 'Configurações',
    shortLabel: 'Ajustes',
    description: 'Pesos do Lead Score, backup, temas e preferências',
    iconName: 'Settings',
  },
];

export const MOBILE_PRIMARY_NAV: RouteId[] = [
  'dashboard',
  'prospecting',
  'clients',
  'pipeline',
];

export const APP_STORAGE_KEY_PREFIX = 'prospect_os_';
export const DB_NAME = 'ProspectOS_DB';
export const DB_VERSION = 6;

export const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  instagram: 'Instagram Direct',
  linkedin: 'LinkedIn InMail / DM',
  phone: 'Ligação Telefônica',
  other: 'Outro Canal',
};

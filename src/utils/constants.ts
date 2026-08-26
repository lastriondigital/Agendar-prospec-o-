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
  RESPONDEU: {
    id: 'RESPONDEU',
    label: 'Respondeu',
    order: 4,
    color: 'indigo',
    badgeVariant: 'purple',
    description: 'Prospect deu retorno ou engajou na mensagem',
    statusMapping: 'in_contact',
  },
  INTERESSADO: {
    id: 'INTERESSADO',
    label: 'Interessado',
    order: 5,
    color: 'teal',
    badgeVariant: 'emerald',
    description: 'Demonstrou interesse claro na proposta',
    statusMapping: 'qualified',
  },
  REUNIÃO: {
    id: 'REUNIÃO',
    label: 'Reunião Agendada',
    order: 6,
    color: 'purple',
    badgeVariant: 'purple',
    description: 'Call de diagnóstico ou demo marcada',
    statusMapping: 'proposal',
  },
  PROPOSTA: {
    id: 'PROPOSTA',
    label: 'Proposta Enviada',
    order: 7,
    color: 'amber',
    badgeVariant: 'amber',
    description: 'Oferta comercial apresentada',
    statusMapping: 'proposal',
  },
  NEGOCIAÇÃO: {
    id: 'NEGOCIAÇÃO',
    label: 'Em Negociação',
    order: 8,
    color: 'orange',
    badgeVariant: 'amber',
    description: 'Ajuste de contrato, escopo ou valor',
    statusMapping: 'negotiation',
  },
  CLIENTE: {
    id: 'CLIENTE',
    label: 'Cliente Fechado',
    order: 9,
    color: 'emerald',
    badgeVariant: 'emerald',
    description: 'Contrato assinado / negócio ganho',
    statusMapping: 'won',
  },
  SEM_RESPOSTA: {
    id: 'SEM_RESPOSTA',
    label: 'Sem Resposta',
    order: 10,
    color: 'slate',
    badgeVariant: 'neutral',
    description: 'Tentativa enviada sem retorno até o momento',
    statusMapping: 'in_contact',
  },
  OBJEÇÃO: {
    id: 'OBJEÇÃO',
    label: 'Objeção',
    order: 11,
    color: 'rose',
    badgeVariant: 'rose',
    description: 'Apresentou objeção que requer contorno',
    statusMapping: 'negotiation',
  },
  ADIADO: {
    id: 'ADIADO',
    label: 'Adiado / Nutrição',
    order: 12,
    color: 'zinc',
    badgeVariant: 'neutral',
    description: 'Pediu contato em momento futuro',
    statusMapping: 'in_contact',
  },
  PERDIDO: {
    id: 'PERDIDO',
    label: 'Perdido',
    order: 13,
    color: 'red',
    badgeVariant: 'rose',
    description: 'Negócio cancelado ou sem fit',
    statusMapping: 'lost',
  },
  REATIVAÇÃO: {
    id: 'REATIVAÇÃO',
    label: 'Reativação',
    order: 14,
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
  'RESPONDEU',
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
  { id: 'stage-new', name: 'Novo Lead', order: 1, color: 'blue', statusMapping: 'new' },
  { id: 'stage-contacted', name: 'Contato Feito', order: 2, color: 'amber', statusMapping: 'in_contact' },
  { id: 'stage-qualified', name: 'Qualificado / Respondeu', order: 3, color: 'indigo', statusMapping: 'qualified' },
  { id: 'stage-proposal', name: 'Proposta / Reunião', order: 4, color: 'purple', statusMapping: 'proposal' },
  { id: 'stage-negotiation', name: 'Em Negociação', order: 5, color: 'cyan', statusMapping: 'negotiation' },
  { id: 'stage-won', name: 'Fechado / Ganho', order: 6, color: 'emerald', statusMapping: 'won' },
  { id: 'stage-lost', name: 'Não Concluído', order: 7, color: 'rose', statusMapping: 'lost' },
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

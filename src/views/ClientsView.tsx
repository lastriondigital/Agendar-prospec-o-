import React, { useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit2,
  Eye,
  Filter,
  Flame,
  Globe,
  Grid,
  Layers,
  List,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Thermometer,
  Trash2,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { Company, Contact, Lead, LeadPriority, LeadStage, LeadTemperature } from '../types';
import { ALL_LEAD_STAGES, DEFAULT_NICHES, STAGES_CONFIG } from '../utils/constants';
import { formatPhoneNumber, formatRelativeDate } from '../utils/formatting';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ContextualTip } from '../components/common/ContextualTip';
import { CompanyDetailsDrawer } from '../components/clients/CompanyDetailsDrawer';
import { CompanyModal } from '../components/clients/CompanyModal';
import { ScoreBadge } from '../components/qualification/ScoreBadge';
import { QualificationModal } from '../components/qualification/QualificationModal';
import { calculateLeadScore } from '../utils/leadScoring';
import { QuickFilterBar, QuickFilterType } from '../components/common/QuickFilterBar';

export const ClientsView: React.FC = () => {
  const { companies, contacts, leads, services, icps, history, settings, deleteCompany, setActiveRoute } = useApp();
  const confirm = useConfirm();

  // Estados de busca e filtros rápidos
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lead' | 'client' | 'archived'>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [nicheFilter, setNicheFilter] = useState<string>('all');
  const [temperatureFilter, setTemperatureFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Estados de Modais e Gavetas
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Modal de Qualificação
  const [qualifyingData, setQualifyingData] = useState<{
    company: Company;
    contact?: Contact | null;
    lead: Lead;
  } | null>(null);

  // Mapeamento rápido de contatos e leads por companyId para renderização instantânea
  const contactsMap = useMemo(() => {
    const map = new Map<string, Contact[]>();
    contacts.forEach((c) => {
      const arr = map.get(c.companyId) || [];
      arr.push(c);
      map.set(c.companyId, arr);
    });
    return map;
  }, [contacts]);

  const leadsMap = useMemo(() => {
    const map = new Map<string, Lead>();
    leads.forEach((l) => {
      map.set(l.companyId, l);
    });
    return map;
  }, [leads]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Contadores para Filtros Rápidos
  const quickFilterCounts = useMemo(() => {
    let hojeCount = 0;
    let atrasadosCount = 0;
    let prioridadeMaximaCount = 0;
    let quentesCount = 0;
    let semRespostaCount = 0;
    let followUpCount = 0;
    let reativacaoCount = 0;
    let propostasCount = 0;
    let reunioesCount = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    companies.forEach((comp) => {
      if (comp.status === 'archived') return;

      const compLead = leadsMap.get(comp.id);
      const stage = compLead?.stage || 'NOVO';
      const score = compLead?.score || 50;

      // Hoje
      if (compLead?.nextActionDate === todayStr) hojeCount++;

      // Atrasados
      if (compLead?.nextActionDate && compLead.nextActionDate < todayStr && stage !== 'CLIENTE' && stage !== 'PERDIDO') {
        atrasadosCount++;
      }

      // Prioridade Máxima
      if (score >= 80) prioridadeMaximaCount++;

      // Quentes
      if (compLead?.temperature === 'quente') quentesCount++;

      // Sem Resposta
      if (stage === 'SEM_RESPOSTA' || stage === 'SEM_RESPOSTA_2' || stage === 'SEM_RESPOSTA_3') {
        semRespostaCount++;
      }

      // Follow-up
      if (
        stage === 'PRIMEIRO_CONTACTO' ||
        stage === 'RESPONDEU' ||
        stage === 'INTERESSADO' ||
        stage === 'OBJEÇÃO'
      ) {
        followUpCount++;
      }

      // Reativação
      const lastDate = compLead?.updatedAt || comp.updatedAt || comp.createdAt;
      if (
        stage === 'REATIVAÇÃO' ||
        stage === 'ADIADO' ||
        (lastDate && lastDate < thirtyDaysAgoStr && stage !== 'CLIENTE' && stage !== 'PERDIDO')
      ) {
        reativacaoCount++;
      }

      // Propostas
      if (stage === 'PROPOSTA' || stage === 'NEGOCIAÇÃO') propostasCount++;

      // Reuniões
      if (stage === 'REUNIÃO') reunioesCount++;
    });

    return {
      all: companies.filter((c) => c.status !== 'archived').length,
      hoje: hojeCount,
      atrasados: atrasadosCount,
      prioridade_maxima: prioridadeMaximaCount,
      quentes: quentesCount,
      sem_resposta: semRespostaCount,
      follow_up: followUpCount,
      reativacao: reativacaoCount,
      propostas: propostasCount,
      reunioes: reunioesCount,
    };
  }, [companies, leadsMap, todayStr]);

  // Contadores para Métricas do Topo
  const stats = useMemo(() => {
    const total = companies.length;
    const activeLeads = companies.filter((c) => c.status === 'lead' || !c.status).length;
    const closedClients = companies.filter((c) => c.status === 'client').length;
    const archived = companies.filter((c) => c.status === 'archived').length;
    const todayActions = leads.filter((l) => l.nextActionDate === todayStr).length;

    return { total, activeLeads, closedClients, archived, todayActions };
  }, [companies, leads, todayStr]);

  // Filtro Universal
  const filteredCompanies = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    return companies.filter((comp) => {
      const compContacts = contactsMap.get(comp.id) || [];
      const compLead = leadsMap.get(comp.id);
      const stage = compLead?.stage || 'NOVO';
      const score = compLead?.score || 50;

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'archived' && comp.status !== 'archived') return false;
        if (statusFilter === 'client' && comp.status !== 'client') return false;
        if (statusFilter === 'lead' && (comp.status === 'archived' || comp.status === 'client')) return false;
      } else {
        if (comp.status === 'archived' && quickFilter !== 'all') return false;
      }

      // Quick Filter Bar logic
      if (quickFilter !== 'all') {
        if (quickFilter === 'hoje' && compLead?.nextActionDate !== todayStr) return false;
        if (quickFilter === 'atrasados') {
          if (!compLead?.nextActionDate || compLead.nextActionDate >= todayStr || stage === 'CLIENTE' || stage === 'PERDIDO') {
            return false;
          }
        }
        if (quickFilter === 'prioridade_maxima' && score < 80) return false;
        if (quickFilter === 'quentes' && compLead?.temperature !== 'quente') return false;
        if (quickFilter === 'sem_resposta') {
          if (stage !== 'SEM_RESPOSTA' && stage !== 'SEM_RESPOSTA_2' && stage !== 'SEM_RESPOSTA_3') return false;
        }
        if (quickFilter === 'follow_up') {
          if (
            stage !== 'PRIMEIRO_CONTACTO' &&
            stage !== 'RESPONDEU' &&
            stage !== 'INTERESSADO' &&
            stage !== 'OBJEÇÃO'
          ) {
            return false;
          }
        }
        if (quickFilter === 'reativacao') {
          const lastDate = compLead?.updatedAt || comp.updatedAt || comp.createdAt;
          const isOlder = lastDate && lastDate < thirtyDaysAgoStr;
          if (stage !== 'REATIVAÇÃO' && stage !== 'ADIADO' && !isOlder) return false;
          if (stage === 'CLIENTE' || stage === 'PERDIDO') return false;
        }
        if (quickFilter === 'propostas') {
          if (stage !== 'PROPOSTA' && stage !== 'NEGOCIAÇÃO') return false;
        }
        if (quickFilter === 'reunioes') {
          if (stage !== 'REUNIÃO') return false;
        }
      }

      // Estágio
      if (stageFilter !== 'all' && compLead?.stage !== stageFilter) return false;

      // Nicho
      if (nicheFilter !== 'all' && comp.niche !== nicheFilter) return false;

      // Temperatura
      if (temperatureFilter !== 'all' && compLead?.temperature !== temperatureFilter) return false;

      // Prioridade
      if (priorityFilter !== 'all' && compLead?.priority !== priorityFilter) return false;

      // Busca de texto universal
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = comp.name.toLowerCase().includes(q);
        const matchTrade = (comp.tradeName || '').toLowerCase().includes(q);
        const matchNiche = (comp.niche || '').toLowerCase().includes(q);
        const matchCity = (comp.city || '').toLowerCase().includes(q);
        const matchContactName = compContacts.some((c) => c.name.toLowerCase().includes(q));
        const matchPhone = compContacts.some((c) => (c.phone || '').includes(q) || (c.whatsapp || '').includes(q));
        const matchEmail = compContacts.some((c) => (c.email || '').toLowerCase().includes(q));

        return matchName || matchTrade || matchNiche || matchCity || matchContactName || matchPhone || matchEmail;
      }

      return true;
    });
  }, [
    companies,
    contactsMap,
    leadsMap,
    statusFilter,
    quickFilter,
    todayStr,
    stageFilter,
    nicheFilter,
    temperatureFilter,
    priorityFilter,
    search,
  ]);

  const handleOpenAddCompany = () => {
    setEditingCompany(null);
    setIsCompanyModalOpen(true);
  };

  const handleOpenEditCompany = (comp: Company) => {
    setEditingCompany(comp);
    setIsCompanyModalOpen(true);
  };

  const handleOpenDetails = (comp: Company) => {
    setSelectedCompany(comp);
  };

  const handleOpenQualify = (comp: Company) => {
    const compContacts = contactsMap.get(comp.id) || [];
    const primary = compContacts.find((c) => c.isPrimary) || compContacts[0] || null;
    let compLead = leadsMap.get(comp.id);

    if (!compLead) {
      compLead = {
        id: `lead-${comp.id}`,
        companyId: comp.id,
        contactId: primary?.id || '',
        stage: 'NOVO',
        status: 'active',
        priority: 'média',
        score: 50,
        temperature: 'morno',
        entryDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    setQualifyingData({ company: comp, contact: primary, lead: compLead });
  };

  const cleanPhone = (phoneStr?: string) => {
    if (!phoneStr) return '';
    return phoneStr.replace(/\D/g, '');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Dica Contextual */}
      <ContextualTip
        id="clients_view_tip"
        title="Gestão de Empresas & Decisores"
        message="Cadastre empresas e seus múltiplos contatos. Empresas começam como Leads/Prospects no funil e tornam-se Clientes quando fecharem negócio."
      />

      {/* Header com Título e Ação Primária */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#3F6FB5]" />
            Empresas & Contatos
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
            Gestão de empresas, múltiplos contatos, qualificação e histórico.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleOpenAddCompany}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nova Empresa / Prospect
          </Button>
        </div>
      </div>

      {/* Métricas do Topo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium block">Total de Empresas</span>
            <span className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5 block">{stats.total}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#20242A] text-[#5F6368] dark:text-[#9AA0A6]">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium block">Leads Ativos</span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">{stats.activeLeads}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium block">Clientes Fechados</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{stats.closedClients}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium block">Ações para Hoje</span>
            <span className="text-2xl font-bold text-[#3F6FB5] mt-0.5 block">{stats.todayActions}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTROS RÁPIDOS (QUICK FILTER BAR) */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6]">
            Segmentação Rápida
          </span>
          <span className="text-[11px] font-mono text-[#5F6368] dark:text-[#9AA0A6]">
            {filteredCompanies.length} empresas exibidas
          </span>
        </div>
        <QuickFilterBar
          activeFilter={quickFilter}
          onSelectFilter={setQuickFilter}
          counts={quickFilterCounts}
        />
      </div>

      {/* Barra de Ferramentas e Filtros Secundários */}
      <Card padding="md" className="space-y-4">
        {/* Linha 1: Busca e Toggle de Visualização */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#80868B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por empresa, contato, telefone, WhatsApp, email ou cidade..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-xs text-[#202124] dark:text-[#E8EAED] placeholder:text-[#80868B] focus:outline-none focus:border-[#3F6FB5]"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Filtro de Status Geral */}
            <div className="flex rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] p-1 border border-[#E6E8EB] dark:border-[#2D3139] text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-[#282D36] text-[#202124] dark:text-[#E8EAED] shadow-xs'
                    : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('lead')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'lead'
                    ? 'bg-white dark:bg-[#282D36] text-[#202124] dark:text-[#E8EAED] shadow-xs'
                    : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                }`}
              >
                Leads
              </button>
              <button
                onClick={() => setStatusFilter('client')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'client'
                    ? 'bg-white dark:bg-[#282D36] text-[#202124] dark:text-[#E8EAED] shadow-xs'
                    : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                }`}
              >
                Clientes
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'archived'
                    ? 'bg-white dark:bg-[#282D36] text-[#202124] dark:text-[#E8EAED] shadow-xs'
                    : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                }`}
              >
                Arquivados
              </button>
            </div>

            {/* Toggle de Visualização Grade / Tabela */}
            <div className="flex rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] p-1 border border-[#E6E8EB] dark:border-[#2D3139]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#282D36] text-[#202124] dark:text-[#E8EAED] shadow-xs'
                    : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                }`}
                title="Visualização em Grade"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#282D36] text-[#202124] dark:text-[#E8EAED] shadow-xs'
                    : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                }`}
                title="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Linha 2: Dropdowns de Filtros Refinados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#ECEEF1] dark:border-[#2D3139] text-xs">
          <div>
            <label className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium block mb-1">Estágio do Funil:</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5]"
            >
              <option value="all">Todos os Estágios</option>
              {ALL_LEAD_STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {STAGES_CONFIG[stg]?.order}. {STAGES_CONFIG[stg]?.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium block mb-1">Nicho de Mercado:</label>
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5]"
            >
              <option value="all">Todos os Nichos</option>
              {DEFAULT_NICHES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium block mb-1">Temperatura:</label>
            <select
              value={temperatureFilter}
              onChange={(e) => setTemperatureFilter(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5]"
            >
              <option value="all">Todas as Temperaturas</option>
              <option value="quente">🔥 Quente</option>
              <option value="morno">⚡ Morno</option>
              <option value="frio">❄️ Frio</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium block mb-1">Prioridade:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5]"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="alta">Alta</option>
              <option value="média">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Empresas / Prospects */}
      {filteredCompanies.length === 0 ? (
        companies.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[#3F6FB5] dark:text-blue-300 mx-auto flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-[#202124] dark:text-[#E8EAED]">
                Nenhuma empresa cadastrada
              </h3>
              <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                Adicione sua primeira empresa para começar. Empresas recém-adicionadas entram no funil como <strong>Leads / Prospects</strong> e tornam-se <strong>Clientes</strong> quando você fechar uma proposta.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleOpenAddCompany}
                leftIcon={<Plus className="w-4 h-4" />}
                className="px-6 py-2.5 font-bold"
              >
                + Adicionar Primeira Empresa
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Building2 className="w-8 h-8 text-[#80868B]" />}
            title="Nenhuma empresa encontrada com os filtros atuais"
            description="Tente ajustar os termos de busca ou remover os filtros selecionados."
            actionLabel="Limpar Filtros"
            onAction={() => {
              setSearch('');
              setStatusFilter('all');
              setStageFilter('all');
              setTemperatureFilter('all');
              setNicheFilter('all');
              setPriorityFilter('all');
              setQuickFilter('all');
            }}
          />
        )
      ) : viewMode === 'grid' ? (
        /* VISUALIZAÇÃO EM GRADE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((comp) => {
            const compContacts = contactsMap.get(comp.id) || [];
            const primary = compContacts.find((c) => c.isPrimary) || compContacts[0];
            const compLead = leadsMap.get(comp.id);
            const stageKey: LeadStage = compLead?.stage || 'NOVO';
            const stageDef = STAGES_CONFIG[stageKey] || STAGES_CONFIG['NOVO'];
            const cleanWa = cleanPhone(primary?.whatsapp || primary?.phone);

            const leadScoreResult = compLead
              ? calculateLeadScore(comp, primary, compLead, icps, services, history, settings.scoringWeights)
              : null;
            const finalScore = leadScoreResult ? leadScoreResult.score : (compLead?.score || 50);

            return (
              <Card
                key={comp.id}
                padding="md"
                className="hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 dark:border-blue-900/40">
                        {comp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3
                          onClick={() => handleOpenDetails(comp)}
                          className="text-sm font-bold text-[#202124] dark:text-[#E8EAED] truncate hover:underline cursor-pointer"
                          title={comp.name}
                        >
                          {comp.name}
                        </h3>
                        {comp.tradeName && (
                          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] truncate">({comp.tradeName})</p>
                        )}
                      </div>
                    </div>

                    <Badge variant={stageDef.badgeVariant} size="sm">
                      {stageDef.label}
                    </Badge>
                  </div>

                  {/* Nicho, Cidade, Temperatura e Score */}
                  <div className="flex items-center gap-1.5 text-xs text-[#5F6368] dark:text-[#9AA0A6] mb-3 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#F7F8FA] dark:bg-[#20242A] text-[#202124] dark:text-[#E8EAED] font-medium text-[11px] border border-[#E6E8EB] dark:border-[#2D3139]">
                      {comp.niche}
                    </span>
                    <span>•</span>
                    <span>{comp.city || 'Brasil'}</span>
                    {compLead?.temperature === 'quente' && (
                      <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-0.5 text-[11px]">
                        <Flame className="w-3 h-3 fill-current" /> Quente
                      </span>
                    )}
                    {leadScoreResult ? (
                      <ScoreBadge
                        score={finalScore}
                        size="xs"
                        interactive
                        scoreResult={leadScoreResult}
                        companyName={comp.name}
                      />
                    ) : compLead?.score !== undefined ? (
                      <span className="font-mono text-[#202124] dark:text-[#E8EAED] font-semibold">{compLead.score} pts</span>
                    ) : null}
                  </div>

                  {/* Informações do Contato Principal */}
                  <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#202124] dark:text-[#E8EAED] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#80868B]" />
                        {primary?.name || 'Sem contato principal'}
                      </span>
                      {compContacts.length > 1 && (
                        <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] font-mono">
                          +{compContacts.length - 1} outros
                        </span>
                      )}
                    </div>
                    {primary?.role && <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">{primary.role}</p>}

                    {primary?.phone && (
                      <p className="font-mono text-[#5F6368] dark:text-[#9AA0A6] text-[11px] pt-0.5">
                        {formatPhoneNumber(primary.phone)}
                      </p>
                    )}
                  </div>

                  {/* Próxima Ação */}
                  {compLead?.nextActionTitle && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current" /> Próxima ação:
                        </span>
                        <span>{compLead.nextActionDate ? formatRelativeDate(compLead.nextActionDate) : 'Hoje'}</span>
                      </div>
                      <p className="text-[#202124] dark:text-[#E8EAED] text-xs truncate">{compLead.nextActionTitle}</p>
                    </div>
                  )}
                </div>

                {/* Ações Rápidas no Rodapé */}
                <div className="pt-3 border-t border-[#ECEEF1] dark:border-[#2D3139] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {cleanWa && (
                      <a
                        href={`https://wa.me/55${cleanWa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                        title="Conversar no WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}

                    {primary?.phone && (
                      <a
                        href={`tel:${cleanPhone(primary.phone)}`}
                        className="p-1.5 rounded-md bg-[#F7F8FA] dark:bg-[#20242A] text-[#5F6368] dark:text-[#9AA0A6] hover:bg-neutral-100 transition-colors"
                        title="Ligar"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleOpenQualify(comp)}
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    >
                      Qualificar
                    </Button>

                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => handleOpenDetails(comp)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Detalhes
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* VISUALIZAÇÃO EM TABELA */
        <Card padding="none" className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6E8EB] dark:border-[#2D3139] bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6] font-semibold text-[11px]">
                <th className="py-3 px-4">Empresa / Razão</th>
                <th className="py-3 px-4">Contato Principal</th>
                <th className="py-3 px-4">Estágio</th>
                <th className="py-3 px-4">Nicho / Cidade</th>
                <th className="py-3 px-4">Próxima Ação</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEEF1] dark:divide-[#2D3139]">
              {filteredCompanies.map((comp) => {
                const compContacts = contactsMap.get(comp.id) || [];
                const primary = compContacts.find((c) => c.isPrimary) || compContacts[0];
                const compLead = leadsMap.get(comp.id);
                const stageKey: LeadStage = compLead?.stage || 'NOVO';
                const stageDef = STAGES_CONFIG[stageKey] || STAGES_CONFIG['NOVO'];
                const cleanWa = cleanPhone(primary?.whatsapp || primary?.phone);

                const tableLeadScoreResult = compLead
                  ? calculateLeadScore(comp, primary, compLead, icps, services, history, settings.scoringWeights)
                  : null;
                const tableFinalScore = tableLeadScoreResult ? tableLeadScoreResult.score : (compLead?.score || 50);

                return (
                  <tr key={comp.id} className="hover:bg-neutral-50 dark:hover:bg-[#20242A] transition-colors">
                    <td className="py-3 px-4">
                      <div
                        onClick={() => handleOpenDetails(comp)}
                        className="font-semibold text-[#202124] dark:text-[#E8EAED] hover:underline cursor-pointer"
                      >
                        {comp.name}
                      </div>
                      {comp.tradeName && <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">{comp.tradeName}</div>}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[#202124] dark:text-[#E8EAED]">{primary?.name || '—'}</div>
                      <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">{primary?.role || primary?.phone || '—'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={stageDef.badgeVariant} size="sm">
                        {stageDef.label}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[#202124] dark:text-[#E8EAED] font-medium">{comp.niche}</div>
                      <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">{comp.city}</div>
                    </td>

                    <td className="py-3 px-4">
                      {compLead?.nextActionTitle ? (
                        <div>
                          <div className="text-[#202124] dark:text-[#E8EAED] font-medium truncate max-w-[180px]">
                            {compLead.nextActionTitle}
                          </div>
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                            {compLead.nextActionDate ? formatRelativeDate(compLead.nextActionDate) : 'Hoje'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#80868B]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold">
                      {tableLeadScoreResult ? (
                        <ScoreBadge
                          score={tableFinalScore}
                          size="xs"
                          interactive
                          scoreResult={tableLeadScoreResult}
                          companyName={comp.name}
                        />
                      ) : compLead?.score ? (
                        <span className="text-[#202124] dark:text-[#E8EAED]">{compLead.score} pts</span>
                      ) : (
                        <span className="text-[#80868B]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleOpenQualify(comp)}
                          leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                        >
                          Qualificar
                        </Button>

                        {cleanWa && (
                          <a
                            href={`https://wa.me/55${cleanWa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => handleOpenDetails(comp)}
                          className="p-1.5 rounded-md text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] transition-colors cursor-pointer"
                          title="Abrir Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditCompany(comp)}
                          className="p-1.5 rounded-md text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal de Criação / Edição de Empresa */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        editingCompany={editingCompany}
        onOpenExistingCompany={(targetCompId) => {
          const found = companies.find((c) => c.id === targetCompId);
          if (found) setSelectedCompany(found);
        }}
      />

      {/* Gaveta de Detalhes da Empresa */}
      <CompanyDetailsDrawer
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
        onEditCompany={(comp) => {
          setSelectedCompany(null);
          handleOpenEditCompany(comp);
        }}
      />

      {/* Modal de Qualificação Interativa */}
      {qualifyingData && (
        <QualificationModal
          isOpen={true}
          onClose={() => setQualifyingData(null)}
          company={qualifyingData.company}
          contact={qualifyingData.contact}
          lead={qualifyingData.lead}
          onStartExecution={() => setActiveRoute('prospecting')}
        />
      )}
    </div>
  );
};

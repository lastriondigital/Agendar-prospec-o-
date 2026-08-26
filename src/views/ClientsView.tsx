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
import { CompanyDetailsDrawer } from '../components/clients/CompanyDetailsDrawer';
import { CompanyModal } from '../components/clients/CompanyModal';
import { ScoreBadge } from '../components/qualification/ScoreBadge';
import { calculateLeadScore } from '../utils/leadScoring';

export const ClientsView: React.FC = () => {
  const { companies, contacts, leads, services, icps, history, settings, deleteCompany } = useApp();
  const confirm = useConfirm();

  // Estados de busca e filtros
  const [search, setSearch] = useState('');
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

  // Contadores para Métricas do Topo
  const stats = useMemo(() => {
    const total = companies.length;
    const activeLeads = companies.filter((c) => c.status === 'lead' || !c.status).length;
    const closedClients = companies.filter((c) => c.status === 'client').length;
    const archived = companies.filter((c) => c.status === 'archived').length;
    const today = new Date().toISOString().slice(0, 10);
    const todayActions = leads.filter((l) => l.nextActionDate === today).length;

    return { total, activeLeads, closedClients, archived, todayActions };
  }, [companies, leads]);

  // Filtro Universal
  const filteredCompanies = useMemo(() => {
    return companies.filter((comp) => {
      const compContacts = contactsMap.get(comp.id) || [];
      const primary = compContacts.find((c) => c.isPrimary) || compContacts[0];
      const compLead = leadsMap.get(comp.id);

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'archived' && comp.status !== 'archived') return false;
        if (statusFilter === 'client' && comp.status !== 'client') return false;
        if (statusFilter === 'lead' && (comp.status === 'archived' || comp.status === 'client')) return false;
      } else {
        // Por padrão não exibe arquivados em "todos" a menos que filtre explicitamente por arquivados
        if (comp.status === 'archived') return false;
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
  }, [companies, contactsMap, leadsMap, statusFilter, stageFilter, nicheFilter, temperatureFilter, priorityFilter, search]);

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

  const handleDelete = (comp: Company) => {
    confirm({
      title: `Excluir ${comp.name}?`,
      message: 'Esta ação excluirá a empresa, contatos associados e histórico.',
      confirmText: 'Excluir definitivamente',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: async () => {
        await deleteCompany(comp.id);
      },
    });
  };

  const cleanPhone = (phoneStr?: string) => {
    if (!phoneStr) return '';
    return phoneStr.replace(/\D/g, '');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header com Título e Ação Primária */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-slate-300" />
            Base de Empresas & Contatos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão relacional completa de empresas, múltiplos contatos e leads com anti-duplicação e histórico.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAddCompany}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          Nova Empresa / Prospect
        </Button>
      </div>

      {/* Métricas do Topo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total de Empresas</span>
            <span className="text-2xl font-bold text-slate-100 font-mono mt-0.5 block">{stats.total}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 text-slate-300">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Leads Ativos</span>
            <span className="text-2xl font-bold text-amber-400 font-mono mt-0.5 block">{stats.activeLeads}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Clientes Fechados</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono mt-0.5 block">{stats.closedClients}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Ações para Hoje</span>
            <span className="text-2xl font-bold text-blue-400 font-mono mt-0.5 block">{stats.todayActions}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Ferramentas e Filtros */}
      <Card className="space-y-4">
        {/* Linha 1: Busca e Toggle de Visualização */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por empresa, nome fantasia, contato, telefone, WhatsApp, email ou cidade..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Filtro de Status Geral */}
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('lead')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'lead' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Leads
              </button>
              <button
                onClick={() => setStatusFilter('client')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'client' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Clientes
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'archived' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Arquivados
              </button>
            </div>

            {/* Toggle de Visualização Grade / Tabela */}
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visualização em Grade"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Linha 2: Dropdowns de Filtros Refinados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Estágio do Funil:</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">Todos os Estágios</option>
              {ALL_LEAD_STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {STAGES_CONFIG[stg].order}. {STAGES_CONFIG[stg].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Nicho de Mercado:</label>
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Temperatura:</label>
            <select
              value={temperatureFilter}
              onChange={(e) => setTemperatureFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">Todas as Temperaturas</option>
              <option value="quente">🔥 Quente</option>
              <option value="morno">⚡ Morno</option>
              <option value="frio">❄️ Frio</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Prioridade:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
        <EmptyState
          icon={<Building2 className="w-8 h-8 text-slate-400" />}
          title="Nenhuma empresa encontrada"
          description="Tente ajustar os filtros de busca ou cadastre uma nova empresa."
          actionLabel="Cadastrar Empresa"
          onAction={handleOpenAddCompany}
        />
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
                className="hover:border-slate-700 transition-all flex flex-col justify-between p-5 space-y-4 group"
              >
                <div>
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-sm shrink-0">
                        {comp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3
                          onClick={() => handleOpenDetails(comp)}
                          className="text-base font-bold text-slate-100 truncate hover:text-amber-300 cursor-pointer transition-colors"
                          title={comp.name}
                        >
                          {comp.name}
                        </h3>
                        {comp.tradeName && (
                          <p className="text-xs text-slate-400 truncate">({comp.tradeName})</p>
                        )}
                      </div>
                    </div>

                    <Badge variant={stageDef.badgeVariant} size="sm">
                      {stageDef.label}
                    </Badge>
                  </div>

                  {/* Nicho, Cidade e Temperatura */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{comp.niche}</span>
                    <span>•</span>
                    <span>{comp.city}</span>
                    {compLead?.temperature === 'quente' && (
                      <span className="text-amber-400 font-medium flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-amber-400" /> Quente
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
                      <span className="font-mono text-slate-300 font-semibold">{compLead.score} pts</span>
                    ) : null}
                  </div>

                  {/* Informações do Contato Principal */}
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {primary?.name || 'Sem contato principal'}
                      </span>
                      {compContacts.length > 1 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{compContacts.length - 1} outros
                        </span>
                      )}
                    </div>
                    {primary?.role && <p className="text-[11px] text-slate-400">{primary.role}</p>}

                    {primary?.phone && (
                      <p className="font-mono text-slate-300 text-[11px] pt-1">
                        {formatPhoneNumber(primary.phone)}
                      </p>
                    )}
                  </div>

                  {/* Próxima Ação */}
                  {compLead?.nextActionTitle && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
                      <div className="flex items-center justify-between text-amber-400 text-[11px] font-semibold">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Próxima ação:
                        </span>
                        <span>{compLead.nextActionDate || 'Hoje'}</span>
                      </div>
                      <p className="text-slate-300 text-xs truncate">{compLead.nextActionTitle}</p>
                    </div>
                  )}
                </div>

                {/* Ações Rápidas no Rodapé */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {cleanWa && (
                      <a
                        href={`https://wa.me/55${cleanWa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        title="Conversar no WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}

                    {primary?.phone && (
                      <a
                        href={`tel:${cleanPhone(primary.phone)}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Ligar"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    {primary?.email && (
                      <a
                        href={`mailto:${primary.email}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Enviar E-mail"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetails(comp)}
                      className="text-xs h-8 px-2.5"
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
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Empresa / Razão</th>
                <th className="py-3 px-4">Contato Principal</th>
                <th className="py-3 px-4">Estágio</th>
                <th className="py-3 px-4">Nicho / Cidade</th>
                <th className="py-3 px-4">Próxima Ação</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
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
                  <tr key={comp.id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => handleOpenDetails(comp)}
                        className="font-bold text-slate-100 hover:text-amber-300 cursor-pointer transition-colors"
                      >
                        {comp.name}
                      </div>
                      {comp.tradeName && <div className="text-[11px] text-slate-400">{comp.tradeName}</div>}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{primary?.name || '—'}</div>
                      <div className="text-[11px] text-slate-400">{primary?.role || primary?.phone || '—'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={stageDef.badgeVariant} size="sm">
                        {stageDef.label}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{comp.niche}</div>
                      <div className="text-[11px] text-slate-400">{comp.city}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {compLead?.nextActionTitle ? (
                        <div>
                          <div className="text-slate-200 font-medium truncate max-w-[180px]">
                            {compLead.nextActionTitle}
                          </div>
                          <div className="text-[11px] text-amber-400 font-mono">
                            {compLead.nextActionDate || 'Hoje'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {tableLeadScoreResult ? (
                        <ScoreBadge
                          score={tableFinalScore}
                          size="xs"
                          interactive
                          scoreResult={tableLeadScoreResult}
                          companyName={comp.name}
                        />
                      ) : compLead?.score ? (
                        <span className="text-slate-300">{compLead.score} pts</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {cleanWa && (
                          <a
                            href={`https://wa.me/55${cleanWa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => handleOpenDetails(comp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="Abrir Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditCompany(comp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
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
    </div>
  );
};

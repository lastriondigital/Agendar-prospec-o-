import React, { useState } from 'react';
import {
  ShieldAlert,
  Award,
  DollarSign,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Tag,
  Filter,
  Info,
  Calendar,
  GitCommit,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  CtaItem,
  FollowUpStrategyItem,
  LeadStage,
  ObjectionItem,
  PainPointItem,
  PricingItem,
  ProofItem,
  ValueArgumentItem,
} from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { formatCurrencyValue } from '../services/salesEngine';
import { ApproachRecommendationCard } from '../components/sales/ApproachRecommendationCard';
import { ProspectingFlowView } from '../components/sales/ProspectingFlowView';
import { DetailedObjectionsBankView } from '../components/sales/DetailedObjectionsBankView';

type SalesEngineTab =
  | 'prospectingFlow'
  | 'detailedObjections'
  | 'simulator'
  | 'objections'
  | 'proofs'
  | 'pricing'
  | 'arguments'
  | 'painPoints'
  | 'ctas'
  | 'followups';

export const SalesEngineView: React.FC = () => {
  const {
    objections,
    upsertObjection,
    deleteObjection,
    pricing,
    upsertPricing,
    deletePricing,
    proofs,
    upsertProof,
    deleteProof,
    painPoints,
    upsertPainPoint,
    deletePainPoint,
    arguments: argsList,
    upsertArgument,
    deleteArgument,
    ctas,
    upsertCta,
    deleteCta,
    followups,
    upsertFollowUp,
    deleteFollowUp,
    services,
    companies,
    contacts,
    leads,
  } = useApp();

  const { error } = useToast();

  const [activeTab, setActiveTab] = useState<SalesEngineTab>('simulator');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNiche, setFilterNiche] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');

  // Simulator prospect selector
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    companies.length > 0 ? companies[0].id : ''
  );

  // Modals state
  const [isObjectionModalOpen, setIsObjectionModalOpen] = useState(false);
  const [editingObjection, setEditingObjection] = useState<Partial<ObjectionItem> | null>(null);

  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [editingProof, setEditingProof] = useState<Partial<ProofItem> | null>(null);

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<Partial<PricingItem> | null>(null);

  const [isArgumentModalOpen, setIsArgumentModalOpen] = useState(false);
  const [editingArgument, setEditingArgument] = useState<Partial<ValueArgumentItem> | null>(null);

  const [isPainPointModalOpen, setIsPainPointModalOpen] = useState(false);
  const [editingPainPoint, setEditingPainPoint] = useState<Partial<PainPointItem> | null>(null);

  const [isCtaModalOpen, setIsCtaModalOpen] = useState(false);
  const [editingCta, setEditingCta] = useState<Partial<CtaItem> | null>(null);

  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<Partial<FollowUpStrategyItem> | null>(null);

  // Filtered collections
  const filteredObjections = objections.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.response.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === 'all' || item.serviceId === filterService || !item.serviceId;
    return matchesSearch && matchesService;
  });

  const filteredProofs = proofs.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = filterNiche === 'all' || item.niche === filterNiche;
    const matchesService = filterService === 'all' || item.serviceId === filterService;
    return matchesSearch && matchesNiche && matchesService;
  });

  const filteredPricing = pricing.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.serviceName && item.serviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.packageDetails && item.packageDetails.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesService = filterService === 'all' || item.serviceId === filterService;
    return matchesSearch && matchesService;
  });

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];
  const selectedContact = contacts.find((c) => c.companyId === selectedCompany?.id);
  const selectedLead = leads.find((l) => l.companyId === selectedCompany?.id);

  // Objection Handlers
  const handleSaveObjection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObjection?.name || !editingObjection?.response) {
      error('Preencha os campos obrigatórios');
      return;
    }
    const item: ObjectionItem = {
      id: editingObjection.id || `obj-${Date.now()}`,
      name: editingObjection.name,
      context: editingObjection.context || '',
      response: editingObjection.response,
      alternativas: editingObjection.alternativas || [],
      serviceId: editingObjection.serviceId,
      serviceName: editingObjection.serviceName,
      stage: editingObjection.stage || 'PRIMEIRO_CONTACTO',
      observacoes: editingObjection.observacoes || '',
      category: editingObjection.category || 'preco',
    };
    await upsertObjection(item);
    setIsObjectionModalOpen(false);
    setEditingObjection(null);
  };

  // Proof Handlers
  const handleSaveProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProof?.title || !editingProof?.result) {
      error('Preencha o título e o resultado');
      return;
    }
    const item: ProofItem = {
      id: editingProof.id || `prf-${Date.now()}`,
      title: editingProof.title,
      description: editingProof.description || '',
      serviceId: editingProof.serviceId || 'srv-lp',
      serviceName: services.find((s) => s.id === editingProof.serviceId)?.name,
      niche: editingProof.niche || 'Geral',
      result: editingProof.result,
      imageUrl: editingProof.imageUrl,
      url: editingProof.url,
      beforeAfter: editingProof.beforeAfter,
    };
    await upsertProof(item);
    setIsProofModalOpen(false);
    setEditingProof(null);
  };

  // Pricing Handlers
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPricing?.name || !editingPricing?.regularPrice) {
      error('Preencha o nome do pacote e o preço normal');
      return;
    }
    const item: PricingItem = {
      id: editingPricing.id || `prc-${Date.now()}`,
      name: editingPricing.name,
      serviceId: editingPricing.serviceId || 'srv-lp',
      serviceName: editingPricing.serviceName || services.find((s) => s.id === editingPricing.serviceId)?.name,
      packageDetails: editingPricing.packageDetails || 'Escopo Padrão',
      regularPrice: Number(editingPricing.regularPrice),
      anchorPrice: editingPricing.anchorPrice ? Number(editingPricing.anchorPrice) : undefined,
      specialOffer: editingPricing.specialOffer,
      alternativeOption: editingPricing.alternativeOption,
      currency: editingPricing.currency || 'BRL',
      autoDiscountApplied: false, // Strict user rule: "Não aplicar desconto automaticamente"
      notes: editingPricing.notes,
    };
    await upsertPricing(item);
    setIsPricingModalOpen(false);
    setEditingPricing(null);
  };

  // Argument Handlers
  const handleSaveArgument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArgument?.title || !editingArgument?.argumentText) {
      error('Preencha os campos');
      return;
    }
    const item: ValueArgumentItem = {
      id: editingArgument.id || `arg-${Date.now()}`,
      title: editingArgument.title,
      argumentText: editingArgument.argumentText,
      benefit: editingArgument.benefit || '',
      niche: editingArgument.niche,
      serviceId: editingArgument.serviceId,
      category: editingArgument.category || 'diferencial',
    };
    await upsertArgument(item);
    setIsArgumentModalOpen(false);
    setEditingArgument(null);
  };

  // PainPoint Handlers
  const handleSavePainPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPainPoint?.title) {
      error('Preencha o título');
      return;
    }
    const item: PainPointItem = {
      id: editingPainPoint.id || `pn-${Date.now()}`,
      title: editingPainPoint.title,
      description: editingPainPoint.description,
      type: editingPainPoint.type || 'dor',
      niche: editingPainPoint.niche || 'Geral',
      serviceId: editingPainPoint.serviceId,
      severity: editingPainPoint.severity || 'alta',
    };
    await upsertPainPoint(item);
    setIsPainPointModalOpen(false);
    setEditingPainPoint(null);
  };

  // CTA Handlers
  const handleSaveCta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCta?.title || !editingCta?.ctaText) {
      error('Preencha os campos obrigatórios');
      return;
    }
    const item: CtaItem = {
      id: editingCta.id || `cta-${Date.now()}`,
      title: editingCta.title,
      ctaText: editingCta.ctaText,
      category: editingCta.category || 'whatsapp',
      funnelStage: editingCta.funnelStage || 'PRIMEIRO_CONTACTO',
      serviceId: editingCta.serviceId,
    };
    await upsertCta(item);
    setIsCtaModalOpen(false);
    setEditingCta(null);
  };

  // Followup Handlers
  const handleSaveFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFollowup?.name || !editingFollowup?.script) {
      error('Preencha o nome e o script');
      return;
    }
    const item: FollowUpStrategyItem = {
      id: editingFollowup.id || `flw-${Date.now()}`,
      name: editingFollowup.name,
      dayOffset: editingFollowup.dayOffset || 2,
      objective: editingFollowup.objective || 'Retomada de contato',
      angle: editingFollowup.angle || 'Novidade / Prova Social',
      script: editingFollowup.script,
      serviceId: editingFollowup.serviceId,
    };
    await upsertFollowUp(item);
    setIsFollowupModalOpen(false);
    setEditingFollowup(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Sales Engine (Motor de Vendas)
              </h1>
              <Badge variant="purple" size="md">
                10 Módulos de Fechamento
              </Badge>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Biblioteca estratégica centralizada de <strong>Objeções, Provas, Preços sem desconto automático, Argumentos, Dores, CTAs e Estratégias de Abordagem</strong> para maximizar as conversões da sua prospecção.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCompanyId(companies[0]?.id || '');
                setActiveTab('simulator');
              }}
              className="text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Ver Recomendação de Abordagem
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
            <div className="text-lg font-bold text-amber-400">{objections.length}</div>
            <div className="text-[11px] text-slate-400">Objeções</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
            <div className="text-lg font-bold text-emerald-400">{proofs.length}</div>
            <div className="text-[11px] text-slate-400">Provas Sociais</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
            <div className="text-lg font-bold text-cyan-400">{pricing.length}</div>
            <div className="text-[11px] text-slate-400">Tabelas de Preço</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
            <div className="text-lg font-bold text-purple-400">{argsList.length}</div>
            <div className="text-[11px] text-slate-400">Argumentos</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
            <div className="text-lg font-bold text-rose-400">{painPoints.length}</div>
            <div className="text-[11px] text-slate-400">Dores & Problemas</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
            <div className="text-lg font-bold text-blue-400">{ctas.length}</div>
            <div className="text-[11px] text-slate-400">CTAs Validadas</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
            <div className="text-lg font-bold text-purple-400">{followups.length}</div>
            <div className="text-[11px] text-slate-400">Follow-ups</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-sm no-scrollbar">
        <button
          onClick={() => setActiveTab('prospectingFlow')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'prospectingFlow'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <GitCommit className="w-4 h-4 text-indigo-300" />
          Fluxo de Prospecção (23 & 16 Etapas)
        </button>

        <button
          onClick={() => setActiveTab('detailedObjections')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'detailedObjections'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-300" />
          Banco de Objeções (45+ Casos)
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'simulator'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Recomendação (7 Pilares)
        </button>

        <button
          onClick={() => setActiveTab('objections')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'objections'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Objeções Custom ({objections.length})
        </button>

        <button
          onClick={() => setActiveTab('proofs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'proofs'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Provas & Cases ({proofs.length})
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'pricing'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Preços & Pacotes ({pricing.length})
        </button>

        <button
          onClick={() => setActiveTab('arguments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'arguments'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Argumentos ({argsList.length})
        </button>

        <button
          onClick={() => setActiveTab('painPoints')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'painPoints'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Dores ({painPoints.length})
        </button>

        <button
          onClick={() => setActiveTab('ctas')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'ctas'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          CTAs ({ctas.length})
        </button>

        <button
          onClick={() => setActiveTab('followups')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'followups'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Follow-up ({followups.length})
        </button>
      </div>

      {/* TAB: FLUXO DE PROSPECÇÃO (23 & 16 ETAPAS) */}
      {activeTab === 'prospectingFlow' && <ProspectingFlowView />}

      {/* TAB: BANCO DE OBJEÇÕES DETALHADAS (45+ CASOS) */}
      {activeTab === 'detailedObjections' && <DetailedObjectionsBankView />}

      {/* TAB 1: RECOMENDAÇÃO DE ABORDAGEM (SIMULADOR) */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              <label className="text-sm font-medium text-slate-200">
                Selecione o Prospect para Visualizar a Abordagem Automática:
              </label>
            </div>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 max-w-sm"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.niche || 'Geral'})
                </option>
              ))}
            </select>
          </div>

          {selectedCompany ? (
            <ApproachRecommendationCard
              company={selectedCompany}
              contact={selectedContact}
              lead={selectedLead}
            />
          ) : (
            <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
              <p className="text-sm text-slate-400">Nenhum prospect cadastrado para simular.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OBJEÇÕES & RESPOSTAS */}
      {activeTab === 'objections' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar objeção (ex: caro, pensar, concorrente)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <Button
              size="sm"
              onClick={() => {
                setEditingObjection({
                  name: '',
                  context: '',
                  response: '',
                  alternativas: [],
                  stage: 'PRIMEIRO_CONTACTO',
                  category: 'preco',
                  observacoes: '',
                });
                setIsObjectionModalOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nova Objeção
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredObjections.map((obj) => (
              <div
                key={obj.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 sm:p-5 transition shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-base">{obj.name}</span>
                      <Badge variant="amber" size="sm">
                        {obj.category || 'preco'}
                      </Badge>
                    </div>
                    {obj.context && <p className="text-xs text-slate-400 mt-1">{obj.context}</p>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingObjection(obj);
                        setIsObjectionModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteObjection(obj.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Resposta Estratégica
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic">"{obj.response}"</p>
                </div>

                {obj.alternativas && obj.alternativas.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">Variações & Alternativas:</div>
                    <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                      {obj.alternativas.map((alt, idx) => (
                        <li key={idx}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>Etapa sugerida: <strong className="text-slate-200">{obj.stage || 'Todas'}</strong></span>
                  {obj.observacoes && <span className="italic truncate max-w-xs">{obj.observacoes}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROVAS SOCIAIS & CASES */}
      {activeTab === 'proofs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar prova social por nicho, título ou métrica..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <Button
              size="sm"
              onClick={() => {
                setEditingProof({
                  title: '',
                  description: '',
                  serviceId: 'srv-lp',
                  niche: 'Geral',
                  result: '',
                });
                setIsProofModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nova Prova Social
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProofs.map((prf) => (
              <div
                key={prf.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 sm:p-5 transition shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="emerald" size="sm" className="mb-1">
                        {prf.niche}
                      </Badge>
                      <h3 className="font-bold text-slate-100 text-sm sm:text-base">{prf.title}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProof(prf);
                          setIsProofModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProof(prf.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{prf.description}</p>

                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg mt-3">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Métrica & Resultado
                    </div>
                    <div className="text-xs font-semibold text-emerald-200 mt-0.5">{prf.result}</div>
                  </div>

                  {prf.beforeAfter && (
                    <div className="text-[11px] text-slate-300 mt-2 bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                      <div className="text-rose-400">🔻 <strong>Antes:</strong> {prf.beforeAfter.beforeText || '—'}</div>
                      <div className="text-emerald-400">🔺 <strong>Depois:</strong> {prf.beforeAfter.afterText || '—'}</div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  {prf.url ? (
                    <a
                      href={prf.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>Ver Case</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px]">Prova interna validada</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PREÇOS & PACOTES */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-base">Tabela de Preços & Ofertas Estratégicas</h3>
                <Badge variant="amber" size="sm">
                  Sem Desconto Automático
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Regra ativa: O sistema nunca aplica descontos sem intervenção manual do operador de vendas.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setEditingPricing({
                  name: 'Plano Padrão',
                  serviceName: 'Landing Page de Alta Conversão',
                  regularPrice: 2500,
                  anchorPrice: 4000,
                  currency: 'BRL',
                  autoDiscountApplied: false,
                });
                setIsPricingModalOpen(true);
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nova Tabela de Preço
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPricing.map((prc) => (
              <div
                key={prc.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 transition shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                      {prc.name}
                    </span>
                    <h4 className="font-bold text-slate-100 text-base mt-0.5">{prc.serviceName || prc.name}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingPricing(prc);
                        setIsPricingModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePricing(prc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Preço Normal:</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrencyValue(prc.regularPrice, prc.currency)}
                    </span>
                  </div>

                  {prc.anchorPrice && (
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">Preço Âncora (Referência):</span>
                      <span className="text-slate-400 line-through">
                        {formatCurrencyValue(prc.anchorPrice, prc.currency)}
                      </span>
                    </div>
                  )}

                  {prc.specialOffer && (
                    <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-800">
                      <span className="text-amber-400 font-medium">Condição Especial:</span>
                      <span className="text-amber-300 font-bold">{prc.specialOffer}</span>
                    </div>
                  )}
                </div>

                {prc.alternativeOption && (
                  <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">
                      Alternativa / Downsell
                    </span>
                    {prc.alternativeOption}
                  </div>
                )}

                {prc.notes && <p className="text-[11px] text-slate-400 italic">{prc.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ARGUMENTOS & BENEFÍCIOS */}
      {activeTab === 'arguments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100 text-base">Biblioteca de Argumentos de Valor</h3>
            <Button
              size="sm"
              onClick={() => {
                setEditingArgument({
                  title: '',
                  benefit: '',
                  argumentText: '',
                  category: 'diferencial',
                });
                setIsArgumentModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Argumento
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {argsList.map((arg) => (
              <div key={arg.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase">{arg.benefit || arg.title}</span>
                  <Badge variant="purple" size="sm">{arg.category || 'Diferencial'}</Badge>
                </div>
                <h4 className="text-sm font-semibold text-slate-100">{arg.title}</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{arg.argumentText}</p>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span>Nicho: <strong className="text-slate-200">{arg.niche || 'Geral'}</strong></span>
                  <button
                    onClick={() => deleteArgument(arg.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PROBLEMAS & DORES */}
      {activeTab === 'painPoints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100 text-base">Problemas & Dores Identificadas por Nicho</h3>
            <Button
              size="sm"
              onClick={() => {
                setEditingPainPoint({
                  title: '',
                  description: '',
                  type: 'dor',
                  niche: 'Geral',
                  severity: 'alta',
                });
                setIsPainPointModalOpen(true);
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Problema / Dor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {painPoints.map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="rose" size="sm">{p.niche || 'Geral'}</Badge>
                  <Badge variant={p.severity === 'alta' ? 'rose' : 'amber'} size="sm">
                    Severidade: {p.severity || 'alta'}
                  </Badge>
                </div>
                <h4 className="font-bold text-slate-100 text-sm">{p.title}</h4>
                {p.description && <p className="text-xs text-slate-300">{p.description}</p>}
                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    onClick={() => deletePainPoint(p.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CTAS */}
      {activeTab === 'ctas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100 text-base">Chamadas para Ação (CTAs) de Alta Resposta</h3>
            <Button
              size="sm"
              onClick={() => {
                setEditingCta({
                  title: '',
                  ctaText: '',
                  category: 'whatsapp',
                  funnelStage: 'PRIMEIRO_CONTACTO',
                });
                setIsCtaModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nova CTA
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ctas.map((c) => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-400 uppercase">{c.title}</span>
                    <Badge variant="blue" size="sm">{c.funnelStage || 'Geral'}</Badge>
                  </div>
                  <p className="text-xs text-slate-200 italic p-3 bg-slate-950 rounded-lg border border-slate-800 mt-2">
                    "{c.ctaText}"
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between items-center pt-2 border-t border-slate-800">
                  <span>Canal: <strong className="text-slate-200 capitalize">{c.category}</strong></span>
                  <button
                    onClick={() => deleteCta(c.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100 text-base">Estratégias de Follow-up com Gatilhos</h3>
            <Button
              size="sm"
              onClick={() => {
                setEditingFollowup({
                  name: '',
                  dayOffset: 2,
                  objective: 'Retomada de contato',
                  angle: 'Gatilho de prova social',
                  script: '',
                });
                setIsFollowupModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Follow-up
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followups.map((f) => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100 text-sm">{f.name}</h4>
                  <Badge variant="purple" size="sm">D+{f.dayOffset} dias</Badge>
                </div>
                <p className="text-xs text-slate-200 italic p-3 bg-slate-950 rounded-lg border border-slate-800">
                  "{f.script}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Objetivo: <strong className="text-slate-200">{f.objective}</strong></span>
                  <span>Ângulo: <strong className="text-slate-200">{f.angle}</strong></span>
                  <button
                    onClick={() => deleteFollowUp(f.id)}
                    className="text-slate-500 hover:text-rose-400 ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL OBJEÇÃO */}
      {isObjectionModalOpen && editingObjection && (
        <Modal
          isOpen={isObjectionModalOpen}
          onClose={() => setIsObjectionModalOpen(false)}
          title={editingObjection.id ? 'Editar Objeção' : 'Cadastrar Nova Objeção'}
        >
          <form onSubmit={handleSaveObjection} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nome da Objeção (ex: "caro", "vou pensar", "já tenho alguém", "não preciso", "mande orçamento", "sem dinheiro", "fale depois", "preciso consultar sócio"): *
              </label>
              <input
                type="text"
                required
                value={editingObjection.name || ''}
                onChange={(e) => setEditingObjection({ ...editingObjection, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Contexto:</label>
              <input
                type="text"
                value={editingObjection.context || ''}
                onChange={(e) => setEditingObjection({ ...editingObjection, context: e.target.value })}
                placeholder="Quando o prospect diz isso? (ex: após receber proposta)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Resposta Estratégica Pronta: *
              </label>
              <textarea
                required
                rows={4}
                value={editingObjection.response || ''}
                onChange={(e) => setEditingObjection({ ...editingObjection, response: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="Escreva a resposta persuasiva que ancora valor..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Categoria:</label>
                <select
                  value={editingObjection.category || 'preco'}
                  onChange={(e) => setEditingObjection({ ...editingObjection, category: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  <option value="preco">Preço / Orçamento</option>
                  <option value="timing">Tempo / Postergação</option>
                  <option value="concorrencia">Concorrência / Já tenho</option>
                  <option value="decisor">Decisão / Sócio</option>
                  <option value="necessidade">Necessidade</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Etapa de Aplicação:</label>
                <select
                  value={editingObjection.stage || 'PRIMEIRO_CONTACTO'}
                  onChange={(e) => setEditingObjection({ ...editingObjection, stage: e.target.value as LeadStage })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  <option value="NOVO">Novo</option>
                  <option value="PRIMEIRO_CONTACTO">Primeiro Contato</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="RESPONDEU">Respondeu</option>
                  <option value="INTERESSADO">Interessado</option>
                  <option value="REUNIÃO">Reunião</option>
                  <option value="PROPOSTA">Proposta</option>
                  <option value="NEGOCIAÇÃO">Negociação</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsObjectionModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">
                Salvar Objeção
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL PROVA SOCIAL */}
      {isProofModalOpen && editingProof && (
        <Modal
          isOpen={isProofModalOpen}
          onClose={() => setIsProofModalOpen(false)}
          title={editingProof.id ? 'Editar Prova Social' : 'Nova Prova Social / Case'}
        >
          <form onSubmit={handleSaveProof} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Título do Case: *</label>
              <input
                type="text"
                required
                value={editingProof.title || ''}
                onChange={(e) => setEditingProof({ ...editingProof, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nicho:</label>
                <input
                  type="text"
                  value={editingProof.niche || ''}
                  onChange={(e) => setEditingProof({ ...editingProof, niche: e.target.value })}
                  placeholder="ex: Odontologia, E-commerce..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Serviço Associado:</label>
                <select
                  value={editingProof.serviceId || ''}
                  onChange={(e) => setEditingProof({ ...editingProof, serviceId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Resultado / Métrica Principal: *</label>
              <input
                type="text"
                required
                value={editingProof.result || ''}
                onChange={(e) => setEditingProof({ ...editingProof, result: e.target.value })}
                placeholder="ex: +240% em agendamentos em 30 dias"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Descrição do Case:</label>
              <textarea
                rows={3}
                value={editingProof.description || ''}
                onChange={(e) => setEditingProof({ ...editingProof, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsProofModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                Salvar Prova Social
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL PREÇO */}
      {isPricingModalOpen && editingPricing && (
        <Modal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          title={editingPricing.id ? 'Editar Preço' : 'Nova Tabela de Preço'}
        >
          <form onSubmit={handleSavePricing} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Pacote / Oferta: *</label>
              <input
                type="text"
                required
                value={editingPricing.name || ''}
                onChange={(e) => setEditingPricing({ ...editingPricing, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Preço Normal: *</label>
                <input
                  type="number"
                  required
                  value={editingPricing.regularPrice || ''}
                  onChange={(e) => setEditingPricing({ ...editingPricing, regularPrice: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Preço Âncora (Tabela Cheia):</label>
                <input
                  type="number"
                  value={editingPricing.anchorPrice || ''}
                  onChange={(e) => setEditingPricing({ ...editingPricing, anchorPrice: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Condição Especial (Texto):</label>
                <input
                  type="text"
                  value={editingPricing.specialOffer || ''}
                  onChange={(e) => setEditingPricing({ ...editingPricing, specialOffer: e.target.value })}
                  placeholder="ex: 3x sem juros"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Moeda:</label>
                <select
                  value={editingPricing.currency || 'BRL'}
                  onChange={(e) => setEditingPricing({ ...editingPricing, currency: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AOA">AOA (Kz)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-300/90 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Regra do Sales Engine: Descontos nunca são aplicados automaticamente.</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsPricingModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white">
                Salvar Preço
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL ARGUMENTO */}
      {isArgumentModalOpen && editingArgument && (
        <Modal
          isOpen={isArgumentModalOpen}
          onClose={() => setIsArgumentModalOpen(false)}
          title="Novo Argumento de Valor"
        >
          <form onSubmit={handleSaveArgument} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Título do Argumento: *</label>
              <input
                type="text"
                required
                value={editingArgument.title || ''}
                onChange={(e) => setEditingArgument({ ...editingArgument, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Benefício Central: *</label>
              <input
                type="text"
                required
                value={editingArgument.benefit || ''}
                onChange={(e) => setEditingArgument({ ...editingArgument, benefit: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Texto do Argumento: *</label>
              <textarea
                required
                rows={4}
                value={editingArgument.argumentText || ''}
                onChange={(e) => setEditingArgument({ ...editingArgument, argumentText: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsArgumentModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white">
                Salvar Argumento
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL DOR */}
      {isPainPointModalOpen && editingPainPoint && (
        <Modal
          isOpen={isPainPointModalOpen}
          onClose={() => setIsPainPointModalOpen(false)}
          title="Novo Problema / Dor"
        >
          <form onSubmit={handleSavePainPoint} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Título: *</label>
              <input
                type="text"
                required
                value={editingPainPoint.title || ''}
                onChange={(e) => setEditingPainPoint({ ...editingPainPoint, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nicho:</label>
              <input
                type="text"
                value={editingPainPoint.niche || ''}
                onChange={(e) => setEditingPainPoint({ ...editingPainPoint, niche: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Descrição / Impacto:</label>
              <textarea
                rows={3}
                value={editingPainPoint.description || ''}
                onChange={(e) => setEditingPainPoint({ ...editingPainPoint, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsPainPointModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white">
                Salvar Item
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL CTA */}
      {isCtaModalOpen && editingCta && (
        <Modal
          isOpen={isCtaModalOpen}
          onClose={() => setIsCtaModalOpen(false)}
          title="Nova Chamada para Ação (CTA)"
        >
          <form onSubmit={handleSaveCta} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Título da CTA: *</label>
              <input
                type="text"
                required
                value={editingCta.title || ''}
                onChange={(e) => setEditingCta({ ...editingCta, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Texto da CTA: *</label>
              <textarea
                required
                rows={3}
                value={editingCta.ctaText || ''}
                onChange={(e) => setEditingCta({ ...editingCta, ctaText: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsCtaModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">
                Salvar CTA
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL FOLLOW-UP */}
      {isFollowupModalOpen && editingFollowup && (
        <Modal
          isOpen={isFollowupModalOpen}
          onClose={() => setIsFollowupModalOpen(false)}
          title="Nova Estratégia de Follow-up"
        >
          <form onSubmit={handleSaveFollowup} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome da Estratégia: *</label>
              <input
                type="text"
                required
                value={editingFollowup.name || ''}
                onChange={(e) => setEditingFollowup({ ...editingFollowup, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Intervalo (Dias D+X):</label>
                <input
                  type="number"
                  value={editingFollowup.dayOffset || 2}
                  onChange={(e) => setEditingFollowup({ ...editingFollowup, dayOffset: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Objetivo:</label>
                <input
                  type="text"
                  value={editingFollowup.objective || ''}
                  onChange={(e) => setEditingFollowup({ ...editingFollowup, objective: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Script de Follow-up: *</label>
              <textarea
                required
                rows={4}
                value={editingFollowup.script || ''}
                onChange={(e) => setEditingFollowup({ ...editingFollowup, script: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsFollowupModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white">
                Salvar Follow-up
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

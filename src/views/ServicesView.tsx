import React, { useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  DollarSign,
  Edit2,
  HelpCircle,
  Layers,
  MapPin,
  MinusCircle,
  Plus,
  PlusCircle,
  Sliders,
  Sparkles,
  Star,
  Tag,
  TestTube,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { IdealCustomerProfile, ScoringWeightConfig, Service } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ServiceFormModal } from '../components/qualification/ServiceFormModal';
import { IcpFormModal } from '../components/qualification/IcpFormModal';
import { ScoringSettingsPanel } from '../components/qualification/ScoringSettingsPanel';
import { ScoreSimulatorModal } from '../components/qualification/ScoreSimulatorModal';

type ActiveTab = 'services' | 'icps' | 'scoring';

export const ServicesView: React.FC = () => {
  const {
    services,
    icps,
    settings,
    upsertService,
    deleteService,
    upsertIcp,
    deleteIcp,
    updateSettings,
  } = useApp();

  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<ActiveTab>('services');

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [isIcpModalOpen, setIsIcpModalOpen] = useState(false);
  const [editingIcp, setEditingIcp] = useState<IdealCustomerProfile | null>(null);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Service Handlers
  const handleOpenAddService = () => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: Service) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    confirm({
      title: 'Excluir Serviço',
      message: `Tem certeza que deseja remover o serviço "${service.name}"?`,
      isDestructive: true,
      onConfirm: async () => {
        await deleteService(service.id);
      },
    });
  };

  // ICP Handlers
  const handleOpenAddIcp = () => {
    setEditingIcp(null);
    setIsIcpModalOpen(true);
  };

  const handleOpenEditIcp = (icp: IdealCustomerProfile) => {
    setEditingIcp(icp);
    setIsIcpModalOpen(true);
  };

  const handleDeleteIcp = (icp: IdealCustomerProfile) => {
    confirm({
      title: 'Excluir Perfil ICP',
      message: `Tem certeza que deseja remover o perfil ICP "${icp.name}"?`,
      isDestructive: true,
      onConfirm: async () => {
        await deleteIcp(icp.id);
      },
    });
  };

  // Save Scoring Weights
  const handleSaveScoringWeights = async (weights: ScoringWeightConfig) => {
    await updateSettings({ scoringWeights: weights });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header do Módulo de Qualificação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-100 flex items-center gap-2">
            <span>Motor de Qualificação & ICP</span>
            <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              PROSPECT OS
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Defina suas ofertas, perfis de clientes ideais e as regras de pontuação (0–100) para qualificar leads sem adivinhação.
          </p>
        </div>

        {/* Ações Rápidas Conforme a Aba Ativa */}
        <div className="flex items-center gap-2">
          {activeTab === 'services' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddService}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Novo Serviço
            </Button>
          )}

          {activeTab === 'icps' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddIcp}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Novo Perfil ICP
            </Button>
          )}

          {activeTab === 'scoring' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSimulatorOpen(true)}
              leftIcon={<TestTube className="w-4 h-4 text-sky-400" />}
            >
              Simulador em Tempo Real
            </Button>
          )}
        </div>
      </div>

      {/* 2. Barra de Abas do Módulo */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'bg-neutral-900 text-neutral-100 border border-neutral-700 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
          }`}
        >
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <span>Serviços & Catálogo</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
            {services.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('icps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'icps'
              ? 'bg-neutral-900 text-neutral-100 border border-neutral-700 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>Perfis de Cliente Ideal (ICP)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
            {icps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('scoring')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'scoring'
              ? 'bg-neutral-900 text-neutral-100 border border-neutral-700 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Lead Scoring & Pesos</span>
        </button>
      </div>

      {/* 3. CONTEÚDO DA ABA 1: SERVIÇOS & CATÁLOGO */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {services.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  padding="md"
                  className="bg-neutral-900 border-neutral-800 space-y-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Topo do Card de Serviço */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              service.active ? 'bg-emerald-400' : 'bg-neutral-600'
                            }`}
                          />
                          <h3 className="text-base font-bold text-neutral-100">
                            {service.name}
                          </h3>
                        </div>

                        {/* Preços: Base & Âncora */}
                        <div className="flex items-center gap-2.5 mt-1.5">
                          {service.basePrice && (
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {service.currency || 'BRL'} {service.basePrice.toLocaleString('pt-BR')}
                            </span>
                          )}
                          {service.anchorPrice && (
                            <span className="text-xs font-mono line-through text-neutral-500">
                              {service.currency || 'BRL'} {service.anchorPrice.toLocaleString('pt-BR')}
                            </span>
                          )}
                          {!service.active && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">
                              Inativo
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleOpenEditService(service)}
                          title="Editar serviço"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-neutral-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDeleteService(service)}
                          title="Excluir serviço"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        </Button>
                      </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Benefícios & Dores Resolvidas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {service.benefits && service.benefits.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Benefícios
                          </span>
                          <ul className="space-y-1 text-neutral-300 text-[11px]">
                            {service.benefits.slice(0, 3).map((b, i) => (
                              <li key={i} className="truncate">• {b}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {service.problemsSolved && service.problemsSolved.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Dores Resolvidas
                          </span>
                          <ul className="space-y-1 text-neutral-300 text-[11px]">
                            {service.problemsSolved.slice(0, 3).map((p, i) => (
                              <li key={i} className="truncate">• {p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Objeções Comuns */}
                    {service.commonObjections && service.commonObjections.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" /> Objeções Comuns ({service.commonObjections.length})
                        </span>
                        <div className="text-[11px] text-neutral-400 truncate">
                          <strong className="text-neutral-300">"{service.commonObjections[0].objection}"</strong>
                          {service.commonObjections[0].counterArgument && (
                            <span> → {service.commonObjections[0].counterArgument}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Card: Público Ideal e CTA */}
                  <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-1 text-[11px] text-neutral-400">
                    {service.idealCustomerProfile && (
                      <div>
                        <strong className="text-neutral-300">Público Ideal: </strong>
                        <span>{service.idealCustomerProfile}</span>
                      </div>
                    )}
                    {service.standardCTA && (
                      <div className="truncate text-emerald-400/90 font-mono text-[10px]">
                        <strong>CTA: </strong>
                        "{service.standardCTA}"
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Briefcase className="w-8 h-8 text-neutral-400" />}
              title="Nenhum serviço cadastrado"
              description="Cadastre os serviços e ofertas que alimentam seus scripts de abordagem e cálculo de qualificação."
              actionLabel="Cadastrar Primeiro Serviço"
              onAction={handleOpenAddService}
            />
          )}
        </div>
      )}

      {/* 4. CONTEÚDO DA ABA 2: PERFIS DE CLIENTE IDEAL (ICP) */}
      {activeTab === 'icps' && (
        <div className="space-y-4">
          {icps.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {icps.map((icp) => {
                const suitableServices = services.filter((s) =>
                  icp.suitableServiceIds?.includes(s.id)
                );

                return (
                  <Card
                    key={icp.id}
                    padding="md"
                    className="bg-neutral-900 border-neutral-800 space-y-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-3">
                      {/* Topo do Card de ICP */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                            <h3 className="text-base font-bold text-neutral-100">
                              {icp.name}
                            </h3>
                          </div>
                          {icp.description && (
                            <p className="text-xs text-neutral-400 mt-1">
                              {icp.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleOpenEditIcp(icp)}
                            title="Editar ICP"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-neutral-300" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteIcp(icp)}
                            title="Excluir ICP"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </Button>
                        </div>
                      </div>

                      {/* Nichos & Cidades */}
                      <div className="space-y-2 text-xs">
                        {icp.niches && icp.niches.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                              Nichos:
                            </span>
                            {icp.niches.map((n, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-medium bg-neutral-950 text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-800"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400">
                          {icp.cities && icp.cities.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-neutral-500" />
                              {icp.cities.join(', ')}
                            </span>
                          )}
                          {icp.companySize && (
                            <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded font-mono text-[10px]">
                              Porte: {icp.companySize}
                            </span>
                          )}
                          {(icp.minUnits || icp.maxUnits) && (
                            <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded font-mono text-[10px]">
                              Unidades: {icp.minUnits || 1} a {icp.maxUnits || '∞'}
                            </span>
                          )}
                          {icp.priceRange && (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono text-[10px]">
                              R$ {icp.priceRange.min}k - {icp.priceRange.max}k
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Critérios Positivos & Negativos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {icp.positiveCriteria && icp.positiveCriteria.length > 0 && (
                          <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <PlusCircle className="w-3 h-3" /> Critérios Positivos
                            </span>
                            <ul className="space-y-0.5 text-neutral-300 text-[11px]">
                              {icp.positiveCriteria.slice(0, 2).map((c, i) => (
                                <li key={i} className="truncate">+ {c}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {icp.negativeCriteria && icp.negativeCriteria.length > 0 && (
                          <div className="p-2 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                            <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                              <MinusCircle className="w-3 h-3" /> Critérios Negativos
                            </span>
                            <ul className="space-y-0.5 text-neutral-300 text-[11px]">
                              {icp.negativeCriteria.slice(0, 2).map((c, i) => (
                                <li key={i} className="truncate">- {c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Serviços Adequados Associados */}
                    <div className="pt-3 border-t border-neutral-800/80 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                        Serviços Adequados Recomendados:
                      </span>
                      {suitableServices.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {suitableServices.map((srv) => (
                            <span
                              key={srv.id}
                              className="text-[11px] bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded"
                            >
                              {srv.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-500 italic">
                          Nenhum serviço associado
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="w-8 h-8 text-neutral-400" />}
              title="Nenhum Perfil ICP cadastrado"
              description="Cadastre seus Perfis de Cliente Ideal para cruzar nicho, porte, cidades e critérios com as empresas cadastradas."
              actionLabel="Cadastrar Primeiro ICP"
              onAction={handleOpenAddIcp}
            />
          )}
        </div>
      )}

      {/* 5. CONTEÚDO DA ABA 3: LEAD SCORING & PESOS */}
      {activeTab === 'scoring' && (
        <ScoringSettingsPanel
          weights={settings.scoringWeights}
          onSave={handleSaveScoringWeights}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />
      )}

      {/* Modais de Edição e Criação */}
      {isServiceModalOpen && (
        <ServiceFormModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          service={editingService}
          onSave={async (srv) => {
            await upsertService(srv);
          }}
        />
      )}

      {isIcpModalOpen && (
        <IcpFormModal
          isOpen={isIcpModalOpen}
          onClose={() => setIsIcpModalOpen(false)}
          icp={editingIcp}
          availableServices={services}
          onSave={async (icp) => {
            await upsertIcp(icp);
          }}
        />
      )}

      {isSimulatorOpen && (
        <ScoreSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          icps={icps}
          services={services}
          weights={settings.scoringWeights}
        />
      )}
    </div>
  );
};

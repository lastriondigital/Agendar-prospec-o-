import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  X,
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { IdealCustomerProfile, ProspectingMode, Service } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface IcpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  icp: IdealCustomerProfile | null;
  availableServices: Service[];
  onSave: (icp: IdealCustomerProfile) => Promise<void>;
}

export const IcpFormModal: React.FC<IcpFormModalProps> = ({
  isOpen,
  onClose,
  icp,
  availableServices,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'demografico' | 'sinais' | 'pesos'>('geral');

  // Basic Info
  const [name, setName] = useState(icp?.name || '');
  const [description, setDescription] = useState(icp?.description || '');
  const [prospectingMode, setProspectingMode] = useState<ProspectingMode | 'AMBOS'>(
    icp?.prospectingMode || 'AMBOS'
  );
  const [segment, setSegment] = useState(icp?.segment || icp?.niches?.[0] || '');
  const [nichesInput, setNichesInput] = useState(icp?.niches?.join(', ') || '');
  const [country, setCountry] = useState(icp?.country || icp?.countries?.[0] || 'Brasil');
  const [regionOrCity, setRegionOrCity] = useState(icp?.regionOrCity || icp?.cities?.join(', ') || '');
  const [employeeCountRange, setEmployeeCountRange] = useState(icp?.employeeCountRange || '');
  const [unitsRange, setUnitsRange] = useState(icp?.unitsRange || '');
  const [minUnits, setMinUnits] = useState<number | ''>(icp?.minUnits ?? '');
  const [maxUnits, setMaxUnits] = useState<number | ''>(icp?.maxUnits ?? '');
  const [minPriceRange, setMinPriceRange] = useState<number | ''>(icp?.priceRange?.min ?? '');
  const [maxPriceRange, setMaxPriceRange] = useState<number | ''>(icp?.priceRange?.max ?? '');

  // Selected Services
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    icp?.suitableServiceIds || []
  );

  // Sinais Estruturados
  const [positiveSignalsInput, setPositiveSignalsInput] = useState(
    icp?.positiveSignals?.join('\n') ||
      'Instagram ativo\nGoogle Business ativo\n+100 avaliações\nNota 4.5+ no Google\n2+ unidades físicas\nServiços de maior ticket'
  );

  const [problemSignalsInput, setProblemSignalsInput] = useState(
    icp?.problemSignals?.join('\n') ||
      'Sem site institucional\nSite antigo / não adaptado para celular\nPerfil do Google incompleto\nAusência de WhatsApp direto no site'
  );

  const [buyingPotentialSignalsInput, setBuyingPotentialSignalsInput] = useState(
    icp?.buyingPotentialSignals?.join('\n') ||
      'Múltiplas filiais ou unidades\nInveste em anúncios online\nEquipe de atendimento dedicada'
  );

  const [lowPrioritySignalsInput, setLowPrioritySignalsInput] = useState(
    icp?.lowPrioritySignals?.join('\n') ||
      'Sem número de WhatsApp direto\nEmpresa inativa na Receita\nSem decisor identificado'
  );

  // Pesos de Critérios
  const [weightIcp, setWeightIcp] = useState<number>(icp?.criteriaWeights?.icp ?? 30);
  const [weightProblem, setWeightProblem] = useState<number>(icp?.criteriaWeights?.problem ?? 30);
  const [weightPotential, setWeightPotential] = useState<number>(icp?.criteriaWeights?.potential ?? 25);
  const [weightIntent, setWeightIntent] = useState<number>(icp?.criteriaWeights?.intent ?? 15);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const cleanNiches = nichesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (segment.trim() && !cleanNiches.includes(segment.trim())) {
        cleanNiches.unshift(segment.trim());
      }

      const cleanCities = regionOrCity
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const cleanPositives = positiveSignalsInput.split('\n').map((s) => s.trim()).filter(Boolean);
      const cleanProblems = problemSignalsInput.split('\n').map((s) => s.trim()).filter(Boolean);
      const cleanPotential = buyingPotentialSignalsInput.split('\n').map((s) => s.trim()).filter(Boolean);
      const cleanLowPriority = lowPrioritySignalsInput.split('\n').map((s) => s.trim()).filter(Boolean);

      const payload: IdealCustomerProfile = {
        id: icp?.id || `icp-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || undefined,
        prospectingMode,
        segment: segment.trim() || undefined,
        niches: cleanNiches.length > 0 ? cleanNiches : [segment.trim() || 'Geral'],
        country: country.trim() || 'Brasil',
        countries: [country.trim() || 'Brasil'],
        regionOrCity: regionOrCity.trim() || undefined,
        cities: cleanCities,
        employeeCountRange: employeeCountRange || undefined,
        unitsRange: unitsRange || undefined,
        minUnits: minUnits !== '' ? Number(minUnits) : undefined,
        maxUnits: maxUnits !== '' ? Number(maxUnits) : undefined,
        priceRange:
          minPriceRange !== '' || maxPriceRange !== ''
            ? {
                min: minPriceRange !== '' ? Number(minPriceRange) : 0,
                max: maxPriceRange !== '' ? Number(maxPriceRange) : 999999,
                currency: 'BRL',
              }
            : undefined,
        suitableServiceIds: selectedServiceIds,
        positiveCriteria: cleanPositives,
        negativeCriteria: cleanLowPriority,
        positiveSignals: cleanPositives,
        problemSignals: cleanProblems,
        buyingPotentialSignals: cleanPotential,
        lowPrioritySignals: cleanLowPriority,
        criteriaWeights: {
          icp: weightIcp,
          problem: weightProblem,
          potential: weightPotential,
          intent: weightIntent,
        },
        active: true,
        createdAt: icp?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={icp ? 'Editar Perfil de Cliente Ideal (ICP)' : 'Novo Perfil de Cliente Ideal (ICP)'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            {icp ? 'Salvar Alterações' : 'Criar Perfil ICP'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Navegação por Abas */}
        <div className="flex items-center gap-1 border-b border-[#E2E6EC] dark:border-[#272B33] pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'geral'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            1. Perfil & Segmento
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demografico')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'demografico'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            2. Localização, Porte & Serviços
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sinais')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'sinais'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            3. Sinais Positivos & de Problema
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pesos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pesos'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            4. Pesos & Qualificação
          </button>
        </div>

        {/* TAB 1: GERAL & SEGMENTO */}
        {activeTab === 'geral' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Input
              label="Nome do Perfil ICP *"
              placeholder="Ex: Clínicas particulares — Brasil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1">
                  Modo de Prospecção Alvo
                </label>
                <select
                  value={prospectingMode}
                  onChange={(e) => setProspectingMode(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-[#1E222A] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white"
                >
                  <option value="AMBOS">Ambos os Modos</option>
                  <option value="DEMANDA_IDENTIFICADA">Demanda Identificada (Sites, Design, GMB)</option>
                  <option value="OPORTUNIDADE_LATENTE">Oportunidade Latente (App, SaaS)</option>
                </select>
              </div>

              <Input
                label="Segmento / Nicho Principal *"
                placeholder="Ex: Clínicas Médicas, Estética, Restaurantes"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Subnichos e Variações (separados por vírgula)"
                placeholder="Ex: Odontologia, Dermatologia, Cirurgia Plástica, Oftalmologia"
                value={nichesInput}
                onChange={(e) => setNichesInput(e.target.value)}
              />
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                Utilizado para verificar a aderência automática da empresa ao perfil.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1">
                Descrição e Contexto do ICP
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Clínicas com alto volume de pacientes particulares que necessitam de presença digital de alto padrão..."
                rows={2}
                className="w-full text-xs p-3 rounded-lg bg-white dark:bg-[#1E222A] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>
        )}

        {/* TAB 2: DEMOGRAFIA, PORTE & SERVIÇOS */}
        {activeTab === 'demografico' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="País *"
                placeholder="Ex: Brasil, Portugal"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
              <Input
                label="Região ou Cidades Alvo"
                placeholder="Ex: São Paulo, Rio de Janeiro, Curitiba"
                value={regionOrCity}
                onChange={(e) => setRegionOrCity(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1">
                  Faixa de Funcionários
                </label>
                <select
                  value={employeeCountRange}
                  onChange={(e) => setEmployeeCountRange(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-[#1E222A] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white"
                >
                  <option value="">Qualquer porte</option>
                  <option value="1-5">1 a 5 colaboradores</option>
                  <option value="6-20">6 a 20 colaboradores</option>
                  <option value="21-50">21 a 50 colaboradores</option>
                  <option value="50+">50+ colaboradores (Grande)</option>
                </select>
              </div>

              <Input
                label="Mínimo de Unidades Físicas"
                type="number"
                placeholder="Ex: 1 ou 2"
                value={minUnits}
                onChange={(e) => setMinUnits(e.target.value ? Number(e.target.value) : '')}
              />
              <Input
                label="Máximo de Unidades"
                type="number"
                placeholder="Ex: 10"
                value={maxUnits}
                onChange={(e) => setMaxUnits(e.target.value ? Number(e.target.value) : '')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Ticket / Faixa de Preço Mínima (R$)"
                type="number"
                placeholder="Ex: 1500"
                value={minPriceRange}
                onChange={(e) => setMinPriceRange(e.target.value ? Number(e.target.value) : '')}
              />
              <Input
                label="Ticket Máximo Esperado (R$)"
                type="number"
                placeholder="Ex: 15000"
                value={maxPriceRange}
                onChange={(e) => setMaxPriceRange(e.target.value ? Number(e.target.value) : '')}
              />
            </div>

            {/* Serviços Adequados */}
            <div className="space-y-2 pt-2 border-t border-[#E2E6EC] dark:border-[#272B33]">
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0]">
                Serviços Adequados para este Perfil
              </label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map((srv) => {
                  const isChecked = selectedServiceIds.includes(srv.id);
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => handleToggleService(srv.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-[#2563EB] text-white border-[#2563EB] font-semibold'
                          : 'bg-white dark:bg-[#1E222A] text-[#64748B] border-[#CBD5E1] dark:border-[#334155]'
                      }`}
                    >
                      {srv.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SINAIS POSITIVOS, DE PROBLEMA & POTENCIAL */}
        {activeTab === 'sinais' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1">
                  Sinais Positivos (1 por linha)
                </label>
                <textarea
                  value={positiveSignalsInput}
                  onChange={(e) => setPositiveSignalsInput(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3 rounded-lg bg-white dark:bg-[#1E222A] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1">
                  Sinais de Problema (1 por linha)
                </label>
                <textarea
                  value={problemSignalsInput}
                  onChange={(e) => setProblemSignalsInput(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3 rounded-lg bg-white dark:bg-[#1E222A] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1">
                  Sinais de Potencial de Compra
                </label>
                <textarea
                  value={buyingPotentialSignalsInput}
                  onChange={(e) => setBuyingPotentialSignalsInput(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg bg-white dark:bg-[#1E222A] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1">
                  Sinais de Baixa Prioridade (Red Flags)
                </label>
                <textarea
                  value={lowPrioritySignalsInput}
                  onChange={(e) => setLowPrioritySignalsInput(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg bg-white dark:bg-[#1E222A] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PESOS & QUALIFICAÇÃO */}
        {activeTab === 'pesos' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 bg-[#FAFBFD] dark:bg-[#16191F] border border-[#E2E6EC] dark:border-[#272B33] rounded-xl">
              <span className="text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] block mb-1">
                Configuração dos Pesos no Score (Demanda Identificada: Total 100)
              </span>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Ajuste os pesos dos 4 pilares de qualificação para este perfil.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Adequação ao ICP (30)"
                type="number"
                value={weightIcp}
                onChange={(e) => setWeightIcp(Number(e.target.value))}
              />
              <Input
                label="Intensidade do Problema (30)"
                type="number"
                value={weightProblem}
                onChange={(e) => setWeightProblem(Number(e.target.value))}
              />
              <Input
                label="Potencial de Compra (25)"
                type="number"
                value={weightPotential}
                onChange={(e) => setWeightPotential(Number(e.target.value))}
              />
              <Input
                label="Intenção / Contato (15)"
                type="number"
                value={weightIntent}
                onChange={(e) => setWeightIntent(Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

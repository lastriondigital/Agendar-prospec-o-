import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  MinusCircle,
  Plus,
  PlusCircle,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { IdealCustomerProfile, Service } from '../../types';
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
  const [activeTab, setActiveTab] = useState<'geral' | 'demografico' | 'criterios'>('geral');

  // Basic Info
  const [name, setName] = useState(icp?.name || '');
  const [description, setDescription] = useState(icp?.description || '');
  const [nichesInput, setNichesInput] = useState(icp?.niches?.join(', ') || '');
  const [countriesInput, setCountriesInput] = useState(icp?.countries?.join(', ') || 'Brasil');
  const [citiesInput, setCitiesInput] = useState(icp?.cities?.join(', ') || '');
  const [companySize, setCompanySize] = useState(icp?.companySize || '');
  const [minUnits, setMinUnits] = useState<number | ''>(icp?.minUnits ?? '');
  const [maxUnits, setMaxUnits] = useState<number | ''>(icp?.maxUnits ?? '');
  const [minPriceRange, setMinPriceRange] = useState<number | ''>(icp?.priceRange?.min ?? '');
  const [maxPriceRange, setMaxPriceRange] = useState<number | ''>(icp?.priceRange?.max ?? '');
  const [problemsInput, setProblemsInput] = useState(icp?.commonProblems?.join('\n') || '');

  // Selected Services
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    icp?.suitableServiceIds || []
  );

  // Positive & Negative Criteria
  const [positiveCriteria, setPositiveCriteria] = useState<string[]>(
    icp?.positiveCriteria && icp.positiveCriteria.length > 0
      ? icp.positiveCriteria
      : ['Possui WhatsApp Comercial Ativo', 'Tem presença no Google com avaliações']
  );
  const [negativeCriteria, setNegativeCriteria] = useState<string[]>(
    icp?.negativeCriteria && icp.negativeCriteria.length > 0
      ? icp.negativeCriteria
      : ['Sem número de telefone direto', 'Empresa inativa na Receita']
  );

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
      const cleanCountries = countriesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const cleanCities = citiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const cleanProblems = problemsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const cleanPositives = positiveCriteria.map((c) => c.trim()).filter(Boolean);
      const cleanNegatives = negativeCriteria.map((c) => c.trim()).filter(Boolean);

      const payload: IdealCustomerProfile = {
        id: icp?.id || `icp-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || undefined,
        niches: cleanNiches,
        countries: cleanCountries,
        cities: cleanCities,
        companySize: companySize ? (companySize as any) : undefined,
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
        commonProblems: cleanProblems,
        suitableServiceIds: selectedServiceIds,
        positiveCriteria: cleanPositives,
        negativeCriteria: cleanNegatives,
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
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            {icp ? 'Salvar Alterações' : 'Criar Perfil ICP'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Navegação por Abas */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'geral'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            1. Perfil, Nichos & Dores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demografico')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'demografico'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            2. Localização & Porte
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('criterios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'criterios'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            3. Critérios Positivos/Negativos & Serviços
          </button>
        </div>

        {/* TAB 1: GERAL, NICHOS & DORES */}
        {activeTab === 'geral' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Input
              label="Nome do Perfil ICP *"
              placeholder="Ex: Clínicas Médicas e Odontológicas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Descrição & Objetivo do ICP
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Empresas de saúde de médio porte que investem em captação de pacientes particulares..."
                rows={2}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <Input
                label="Nichos e Segmentos (separados por vírgula)"
                placeholder="Ex: Odontologia, Dermatologia, Cirurgia Plástica, Oftalmologia"
                value={nichesInput}
                onChange={(e) => setNichesInput(e.target.value)}
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                O motor de scoring compara esses nichos com a categoria cadastrada da empresa.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Problemas e Dores Comuns deste Perfil (1 por linha)
              </label>
              <textarea
                value={problemsInput}
                onChange={(e) => setProblemsInput(e.target.value)}
                placeholder={'Site não adaptado para celular\nBaixa posição na busca do Google\nFalta de agendamento online automático'}
                rows={3}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        )}

        {/* TAB 2: LOCALIZAÇÃO & PORTE */}
        {activeTab === 'demografico' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Países Alvo (separados por vírgula)"
                placeholder="Ex: Brasil, Portugal"
                value={countriesInput}
                onChange={(e) => setCountriesInput(e.target.value)}
              />
              <Input
                label="Cidades Alvo (separados por vírgula)"
                placeholder="Ex: São Paulo, Rio de Janeiro, Curitiba"
                value={citiesInput}
                onChange={(e) => setCitiesInput(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Porte / Tamanho da Empresa
                </label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Qualquer porte</option>
                  <option value="1-10">1 a 10 funcionários (Pequena)</option>
                  <option value="11-50">11 a 50 funcionários (Média)</option>
                  <option value="51-200">51 a 200 funcionários (Grande)</option>
                  <option value="200+">200+ funcionários (Enterprise)</option>
                </select>
              </div>

              <Input
                label="Mínimo de Unidades / Filiais"
                type="number"
                placeholder="Ex: 1"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Input
                label="Faixa de Preço / Ticket Mínimo (R$)"
                type="number"
                placeholder="Ex: 2000"
                value={minPriceRange}
                onChange={(e) => setMinPriceRange(e.target.value ? Number(e.target.value) : '')}
              />
              <Input
                label="Faixa de Preço / Ticket Máximo (R$)"
                type="number"
                placeholder="Ex: 15000"
                value={maxPriceRange}
                onChange={(e) => setMaxPriceRange(e.target.value ? Number(e.target.value) : '')}
              />
            </div>
          </div>
        )}

        {/* TAB 3: CRITÉRIOS & SERVIÇOS ADEQUADOS */}
        {activeTab === 'criterios' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Serviços Adequados */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-200 block">
                Serviços Adequados para este ICP (Cross-sell & Up-sell)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                {availableServices.map((srv) => {
                  const isChecked = selectedServiceIds.includes(srv.id);
                  return (
                    <label
                      key={srv.id}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'text-neutral-400 hover:bg-neutral-900 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleService(srv.id)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-900 border-neutral-700"
                      />
                      <span className="truncate">{srv.name}</span>
                    </label>
                  );
                })}
                {availableServices.length === 0 && (
                  <p className="text-xs text-neutral-500 col-span-2 p-2">
                    Nenhum serviço cadastrado no catálogo.
                  </p>
                )}
              </div>
            </div>

            {/* Critérios Positivos */}
            <div className="space-y-2 pt-3 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" />
                  Critérios Positivos (Bonificam o Lead Score)
                </label>
                <button
                  type="button"
                  onClick={() => setPositiveCriteria([...positiveCriteria, ''])}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
              <div className="space-y-1.5">
                {positiveCriteria.map((crit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={crit}
                      onChange={(e) => {
                        const updated = [...positiveCriteria];
                        updated[idx] = e.target.value;
                        setPositiveCriteria(updated);
                      }}
                      placeholder={`Critério Positivo ${idx + 1}`}
                      className="flex-1 rounded-xl bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                    />
                    {positiveCriteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPositiveCriteria(positiveCriteria.filter((_, i) => i !== idx))}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Critérios Negativos */}
            <div className="space-y-2 pt-3 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <MinusCircle className="w-3.5 h-3.5" />
                  Critérios Negativos (Penalizam o Lead Score)
                </label>
                <button
                  type="button"
                  onClick={() => setNegativeCriteria([...negativeCriteria, ''])}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
              <div className="space-y-1.5">
                {negativeCriteria.map((crit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={crit}
                      onChange={(e) => {
                        const updated = [...negativeCriteria];
                        updated[idx] = e.target.value;
                        setNegativeCriteria(updated);
                      }}
                      placeholder={`Critério Negativo ${idx + 1}`}
                      className="flex-1 rounded-xl bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                    />
                    {negativeCriteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNegativeCriteria(negativeCriteria.filter((_, i) => i !== idx))}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

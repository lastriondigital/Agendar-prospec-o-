import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Globe,
  HelpCircle,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { MarketPriceItem, Service } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onSave: (service: Service) => Promise<void>;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  service,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'precos_mercado' | 'beneficios' | 'objecoes' | 'provas'>('geral');

  // Basic Info
  const [name, setName] = useState(service?.name || '');
  const [description, setDescription] = useState(service?.description || '');
  const [basePrice, setBasePrice] = useState<number | ''>(service?.basePrice || service?.ticketValue || '');
  const [currency, setCurrency] = useState(service?.currency || 'BRL');
  const [anchorPrice, setAnchorPrice] = useState<number | ''>(service?.anchorPrice || '');
  const [idealCustomerProfile, setIdealCustomerProfile] = useState(service?.idealCustomerProfile || '');
  const [standardCTA, setStandardCTA] = useState(service?.standardCTA || '');
  const [active, setActive] = useState(service ? service.active : true);

  // Market Prices
  const [marketPrices, setMarketPrices] = useState<MarketPriceItem[]>(
    service?.marketPrices || []
  );

  // Dynamic Lists
  const [benefits, setBenefits] = useState<string[]>(
    service?.benefits && service.benefits.length > 0
      ? service.benefits
      : service?.keyDifferentiators || ['']
  );
  const [problemsSolved, setProblemsSolved] = useState<string[]>(
    service?.problemsSolved && service.problemsSolved.length > 0
      ? service.problemsSolved
      : ['']
  );
  const [objections, setObjections] = useState<{ objection: string; counterArgument: string }[]>(
    service?.commonObjections && service.commonObjections.length > 0
      ? service.commonObjections
      : [{ objection: '', counterArgument: '' }]
  );
  const [argumentsList, setArgumentsList] = useState<string[]>(
    service?.arguments && service.arguments.length > 0
      ? service.arguments
      : ['']
  );
  const [associatedProofs, setAssociatedProofs] = useState<string[]>(
    service?.associatedProofs && service.associatedProofs.length > 0
      ? service.associatedProofs
      : ['']
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMarketPrice = () => {
    setMarketPrices([
      ...marketPrices,
      {
        id: `mp-${Date.now()}`,
        country: 'Portugal',
        currency: 'EUR',
        currencySymbol: '€',
        price: 350,
        anchorPrice: 500,
      },
    ]);
  };

  const handleRemoveMarketPrice = (index: number) => {
    setMarketPrices(marketPrices.filter((_, i) => i !== index));
  };

  const handleUpdateMarketPrice = (index: number, updates: Partial<MarketPriceItem>) => {
    setMarketPrices(
      marketPrices.map((mp, i) => (i === index ? { ...mp, ...updates } : mp))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const cleanBenefits = benefits.map((b) => b.trim()).filter(Boolean);
      const cleanProblems = problemsSolved.map((p) => p.trim()).filter(Boolean);
      const cleanObjections = objections
        .map((o) => ({ objection: o.objection.trim(), counterArgument: o.counterArgument.trim() }))
        .filter((o) => o.objection || o.counterArgument);
      const cleanArguments = argumentsList.map((a) => a.trim()).filter(Boolean);
      const cleanProofs = associatedProofs.map((p) => p.trim()).filter(Boolean);
      const cleanMarketPrices = marketPrices.filter((mp) => mp.country && mp.currency && mp.price > 0);

      const payload: Service = {
        id: service?.id || `srv-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || name.trim(),
        basePrice: basePrice !== '' ? Number(basePrice) : undefined,
        currency,
        anchorPrice: anchorPrice !== '' ? Number(anchorPrice) : undefined,
        ticketValue: basePrice !== '' ? Number(basePrice) : undefined,
        marketPrices: cleanMarketPrices,
        benefits: cleanBenefits,
        idealCustomerProfile: idealCustomerProfile.trim(),
        problemsSolved: cleanProblems,
        commonObjections: cleanObjections,
        arguments: cleanArguments,
        associatedProofs: cleanProofs,
        standardCTA: standardCTA.trim(),
        active,
        keyDifferentiators: cleanBenefits,
        valueProposition: description.trim() || name.trim(),
        createdAt: service?.createdAt || new Date().toISOString(),
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
      title={service ? 'Editar Serviço' : 'Novo Serviço'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            {service ? 'Salvar Alterações' : 'Criar Serviço'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Navegação por Abas Internas */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'geral'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            1. Geral & Preço Base
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('precos_mercado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'precos_mercado'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>2. Preços por Mercado ({marketPrices.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('beneficios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'beneficios'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            3. Benefícios & Dores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('objecoes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'objecoes'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            4. Objeções & Argumentos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('provas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'provas'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            5. Provas & CTA
          </button>
        </div>

        {/* TAB 1: GERAL & PREÇO */}
        {activeTab === 'geral' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Nome do Serviço *"
                  placeholder="Ex: Landing Page de Alta Conversão"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <label className="flex items-center gap-2 text-xs text-neutral-300 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-900 border-neutral-700"
                  />
                  <span>Serviço Ativo</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Descrição do Serviço *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o escopo e o que é entregue nesta solução..."
                rows={3}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Preço Base Padrão"
                type="number"
                placeholder="Ex: 1500"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value ? Number(e.target.value) : '')}
              />
              <Input
                label="Preço Âncora (Tabela/Cheio)"
                type="number"
                placeholder="Ex: 2500"
                value={anchorPrice}
                onChange={(e) => setAnchorPrice(e.target.value ? Number(e.target.value) : '')}
              />
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Moeda Padrão
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="MZN">MZN (MT)</option>
                  <option value="AOA">AOA (Kz)</option>
                  <option value="CVE">CVE ($)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div>
              <Input
                label="Público Ideal (ICP Alvo)"
                placeholder="Ex: Clínicas médicas, escritórios de advocacia, e-commerces"
                value={idealCustomerProfile}
                onChange={(e) => setIdealCustomerProfile(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* TAB 2: PREÇOS POR MERCADO */}
        {activeTab === 'precos_mercado' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-neutral-300 space-y-1">
              <p className="font-bold text-blue-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Preços Específicos por País / Mercado
              </p>
              <p className="text-[11px] text-neutral-400">
                Configure valores comerciais customizados para cada país ou moeda. O sistema respeita estritamente o poder de compra local sem conversões cegas.
              </p>
            </div>

            {marketPrices.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-neutral-800 rounded-xl space-y-2">
                <Globe className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400 font-medium">Nenhum preço específico por mercado cadastrado.</p>
                <p className="text-[11px] text-neutral-500">Este serviço usará o Preço Base padrão ({currency} {basePrice || 'não definido'}).</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={handleAddMarketPrice}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="mt-2"
                >
                  Adicionar Preço para Outro País
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {marketPrices.map((mp, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        Regra #{index + 1}: {mp.country || 'Novo Mercado'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMarketPrice(index)}
                        className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                        title="Remover regra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-400 mb-1">País</label>
                        <select
                          value={mp.country}
                          onChange={(e) => {
                            const newCountry = e.target.value;
                            let autoCurrency = mp.currency;
                            if (newCountry === 'Portugal') autoCurrency = 'EUR';
                            if (newCountry === 'Brasil') autoCurrency = 'BRL';
                            if (newCountry === 'Moçambique') autoCurrency = 'MZN';
                            if (newCountry === 'Angola') autoCurrency = 'AOA';
                            if (newCountry === 'Cabo Verde') autoCurrency = 'CVE';
                            if (newCountry === 'Estados Unidos') autoCurrency = 'USD';
                            if (newCountry === 'Reino Unido') autoCurrency = 'GBP';
                            handleUpdateMarketPrice(index, { country: newCountry, currency: autoCurrency });
                          }}
                          className="w-full rounded-lg bg-neutral-900 border border-neutral-800 p-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Portugal">🇵🇹 Portugal</option>
                          <option value="Brasil">🇧🇷 Brasil</option>
                          <option value="Moçambique">🇲🇿 Moçambique</option>
                          <option value="Angola">🇦🇴 Angola</option>
                          <option value="Cabo Verde">🇨🇻 Cabo Verde</option>
                          <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
                          <option value="Reino Unido">🇬🇧 Reino Unido</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-400 mb-1">Moeda</label>
                        <select
                          value={mp.currency}
                          onChange={(e) => handleUpdateMarketPrice(index, { currency: e.target.value })}
                          className="w-full rounded-lg bg-neutral-900 border border-neutral-800 p-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="EUR">EUR (€)</option>
                          <option value="BRL">BRL (R$)</option>
                          <option value="MZN">MZN (MT)</option>
                          <option value="AOA">AOA (Kz)</option>
                          <option value="CVE">CVE ($)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-400 mb-1">Preço Base *</label>
                        <input
                          type="number"
                          value={mp.price}
                          onChange={(e) => handleUpdateMarketPrice(index, { price: Number(e.target.value) || 0 })}
                          placeholder="Ex: 350"
                          className="w-full rounded-lg bg-neutral-900 border border-neutral-800 p-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-400 mb-1">Preço Âncora</label>
                        <input
                          type="number"
                          value={mp.anchorPrice || ''}
                          onChange={(e) => handleUpdateMarketPrice(index, { anchorPrice: Number(e.target.value) || undefined })}
                          placeholder="Ex: 500"
                          className="w-full rounded-lg bg-neutral-900 border border-neutral-800 p-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={handleAddMarketPrice}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="w-full justify-center"
                >
                  Adicionar Outro Mercado / País
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BENEFÍCIOS & PROBLEMAS */}
        {activeTab === 'beneficios' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Benefícios */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Benefícios & Vantagens do Serviço
                </label>
                <button
                  type="button"
                  onClick={() => setBenefits([...benefits, ''])}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => {
                        const updated = [...benefits];
                        updated[idx] = e.target.value;
                        setBenefits(updated);
                      }}
                      placeholder={`Benefício ${idx + 1} (ex: Dobra a conversão de leads do Google)`}
                      className="flex-1 rounded-xl bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                    />
                    {benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))}
                        className="p-2 text-neutral-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Problemas Resolvidos */}
            <div className="space-y-2 pt-3 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Problemas & Dores Resolvidas
                </label>
                <button
                  type="button"
                  onClick={() => setProblemsSolved([...problemsSolved, ''])}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {problemsSolved.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => {
                        const updated = [...problemsSolved];
                        updated[idx] = e.target.value;
                        setProblemsSolved(updated);
                      }}
                      placeholder={`Problema ${idx + 1} (ex: Site lento e não adaptado para celular)`}
                      className="flex-1 rounded-xl bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                    />
                    {problemsSolved.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setProblemsSolved(problemsSolved.filter((_, i) => i !== idx))}
                        className="p-2 text-neutral-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OBJEÇÕES & ARGUMENTOS */}
        {activeTab === 'objecoes' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Objeções Comuns e Contra-Argumentos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                  Objeções Comuns & Como Contornar
                </label>
                <button
                  type="button"
                  onClick={() => setObjections([...objections, { objection: '', counterArgument: '' }])}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Objeção
                </button>
              </div>

              <div className="space-y-3">
                {objections.map((obj, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Objeção #{idx + 1}
                      </span>
                      {objections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setObjections(objections.filter((_, i) => i !== idx))}
                          className="text-neutral-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={obj.objection}
                      onChange={(e) => {
                        const updated = [...objections];
                        updated[idx].objection = e.target.value;
                        setObjections(updated);
                      }}
                      placeholder="Objeção do cliente (ex: 'Já tenho quem faça')"
                      className="w-full rounded-lg bg-neutral-900 border border-neutral-700/80 p-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
                    />
                    <textarea
                      value={obj.counterArgument}
                      onChange={(e) => {
                        const updated = [...objections];
                        updated[idx].counterArgument = e.target.value;
                        setObjections(updated);
                      }}
                      placeholder="Contra-argumento / Resposta recomendada..."
                      rows={2}
                      className="w-full rounded-lg bg-neutral-900 border border-neutral-700/80 p-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Argumentos Comerciais Extras */}
            <div className="space-y-2 pt-3 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-200">
                  Argumentos de Fechamento Rápidos
                </label>
                <button
                  type="button"
                  onClick={() => setArgumentsList([...argumentsList, ''])}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {argumentsList.map((arg, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={arg}
                      onChange={(e) => {
                        const updated = [...argumentsList];
                        updated[idx] = e.target.value;
                        setArgumentsList(updated);
                      }}
                      placeholder={`Argumento ${idx + 1} (ex: Garantia incondicional de 30 dias)`}
                      className="flex-1 rounded-xl bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                    />
                    {argumentsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setArgumentsList(argumentsList.filter((_, i) => i !== idx))}
                        className="p-2 text-neutral-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROVAS & CTA PADRÃO */}
        {activeTab === 'provas' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Provas Associadas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-200">
                  Provas Associadas (Cases, Depoimentos, Métricas)
                </label>
                <button
                  type="button"
                  onClick={() => setAssociatedProofs([...associatedProofs, ''])}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Prova
                </button>
              </div>
              <div className="space-y-2">
                {associatedProofs.map((proof, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={proof}
                      onChange={(e) => {
                        const updated = [...associatedProofs];
                        updated[idx] = e.target.value;
                        setAssociatedProofs(updated);
                      }}
                      placeholder={`Prova ${idx + 1} (ex: '+47% de agendamentos para Clínica Sorriso')`}
                      className="flex-1 rounded-xl bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                    />
                    {associatedProofs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setAssociatedProofs(associatedProofs.filter((_, i) => i !== idx))}
                        className="p-2 text-neutral-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Padrão */}
            <div className="space-y-1 pt-3 border-t border-neutral-800">
              <label className="block text-xs font-bold text-neutral-200">
                Chamada para Ação Padrão (CTA)
              </label>
              <textarea
                value={standardCTA}
                onChange={(e) => setStandardCTA(e.target.value)}
                placeholder="Ex: 'Podemos agendar uma ligação rápida de 10 minutos na quinta às 14h para eu te mostrar como funciona?'"
                rows={3}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500">
                Este CTA é inserido automaticamente em templates de mensagens quando este serviço for o selecionado.
              </p>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

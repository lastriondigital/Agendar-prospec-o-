import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { Service } from '../../types';
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
  const [activeTab, setActiveTab] = useState<'geral' | 'beneficios' | 'objecoes' | 'provas'>('geral');

  // Basic Info
  const [name, setName] = useState(service?.name || '');
  const [description, setDescription] = useState(service?.description || '');
  const [basePrice, setBasePrice] = useState<number | ''>(service?.basePrice || service?.ticketValue || '');
  const [currency, setCurrency] = useState(service?.currency || 'BRL');
  const [anchorPrice, setAnchorPrice] = useState<number | ''>(service?.anchorPrice || '');
  const [idealCustomerProfile, setIdealCustomerProfile] = useState(service?.idealCustomerProfile || '');
  const [standardCTA, setStandardCTA] = useState(service?.standardCTA || '');
  const [active, setActive] = useState(service ? service.active : true);

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

      const payload: Service = {
        id: service?.id || `srv-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || name.trim(),
        basePrice: basePrice !== '' ? Number(basePrice) : undefined,
        currency,
        anchorPrice: anchorPrice !== '' ? Number(anchorPrice) : undefined,
        ticketValue: basePrice !== '' ? Number(basePrice) : undefined,
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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'geral'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            1. Dados Gerais & Preço
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('beneficios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'beneficios'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            2. Benefícios & Dores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('objecoes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'objecoes'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            3. Objeções & Argumentos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('provas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'provas'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            4. Provas & CTA Padrão
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
                label="Preço Base (Mínimo)"
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
                  Moeda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
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

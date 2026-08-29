import React, { useState } from 'react';
import {
  Globe,
  Palette,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Company, Lead, ProspectingMode, SignalCategory } from '../../types';
import { PROSPECT_SIGNALS } from '../../utils/prospectingEngine';

interface SignalSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  lead?: Lead | null;
  mode: ProspectingMode;
  onSaveSignals: (signals: string[], customSignals: string[]) => Promise<void>;
}

export const SignalSelectorModal: React.FC<SignalSelectorModalProps> = ({
  isOpen,
  onClose,
  company,
  lead,
  mode,
  onSaveSignals,
}) => {
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>(() => company?.signals || []);
  const [customSignals, setCustomSignals] = useState<string[]>(() => [
    ...(company?.customSignals || []),
    ...(lead?.customSignals || []),
  ]);
  const [newCustomInput, setNewCustomInput] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<SignalCategory | 'todas'>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sinais relevantes para o modo
  const modeSignals = PROSPECT_SIGNALS.filter(
    (s) => s.mode === mode || s.mode === 'AMBOS'
  );

  const filteredSignals = modeSignals.filter((s) => {
    const matchesCategory = activeCategoryTab === 'todas' || s.category === activeCategoryTab;
    const matchesSearch =
      s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleToggleSignal = (id: string) => {
    if (selectedSignalIds.includes(id)) {
      setSelectedSignalIds(selectedSignalIds.filter((s) => s !== id));
    } else {
      setSelectedSignalIds([...selectedSignalIds, id]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomInput.trim()) return;
    setCustomSignals([...customSignals, newCustomInput.trim()]);
    setNewCustomInput('');
  };

  const handleRemoveCustom = (index: number) => {
    setCustomSignals(customSignals.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSignals(selectedSignalIds, customSignals);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sinais e Diagnóstico — ${company?.tradeName || company?.name || 'Empresa'}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {selectedSignalIds.length + customSignals.length} sinal(is) selecionado(s)
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
              Salvar Sinais & Recalcular
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Banner Explicativo */}
        <div className="p-3.5 rounded-xl bg-[#F4F6F9] dark:bg-[#1E222A] border border-[#E2E6EC] dark:border-[#272B33]">
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
            {mode === 'DEMANDA_IDENTIFICADA'
              ? 'Marque os problemas observáveis na presença digital da empresa (Website, Design ou Google Business Profile).'
              : 'Mapeie as características operacionais que justificam a hipótese de desenvolvimento de App ou SaaS.'}
          </p>
        </div>

        {/* Abas de Categorias para Demanda Identificada */}
        {mode === 'DEMANDA_IDENTIFICADA' && (
          <div className="flex flex-wrap gap-1.5 border-b border-[#E2E6EC] dark:border-[#272B33] pb-3">
            <button
              type="button"
              onClick={() => setActiveCategoryTab('todas')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeCategoryTab === 'todas'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white dark:bg-[#1E222A] text-[#64748B] hover:bg-slate-100 border border-[#E2E6EC] dark:border-[#272B33]'
              }`}
            >
              Todos os Sinais
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('website')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                activeCategoryTab === 'website'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white dark:bg-[#1E222A] text-[#64748B] hover:bg-slate-100 border border-[#E2E6EC] dark:border-[#272B33]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Website
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('design')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                activeCategoryTab === 'design'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white dark:bg-[#1E222A] text-[#64748B] hover:bg-slate-100 border border-[#E2E6EC] dark:border-[#272B33]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Design
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('gmb')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                activeCategoryTab === 'gmb'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white dark:bg-[#1E222A] text-[#64748B] hover:bg-slate-100 border border-[#E2E6EC] dark:border-[#272B33]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Google Business (GMB)
            </button>
          </div>
        )}

        {/* Lista de Sinais Padrão */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredSignals.map((signal) => {
            const isChecked = selectedSignalIds.includes(signal.id);
            return (
              <div
                key={signal.id}
                onClick={() => handleToggleSignal(signal.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 shadow-2xs'
                    : 'bg-white dark:bg-[#1E222A] border-[#E2E6EC] dark:border-[#272B33] hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                    isChecked
                      ? 'bg-[#2563EB] border-[#2563EB] text-white'
                      : 'bg-white dark:bg-[#16191F] border-slate-300 dark:border-slate-700 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0]">
                      {signal.label}
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-wider">
                      {signal.category}
                    </span>
                  </div>
                  {signal.description && (
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      {signal.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Adicionar Sinal Personalizado Manualmente */}
        <div className="space-y-2.5 pt-3 border-t border-[#E2E6EC] dark:border-[#272B33]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
            Adicionar sinais manuais específicos
          </span>

          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              value={newCustomInput}
              onChange={(e) => setNewCustomInput(e.target.value)}
              placeholder="Ex: Utiliza sistema legado sem integração / WhatsApp demora 4h"
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-white dark:bg-[#1E222A] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
            <Button type="submit" variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Adicionar
            </Button>
          </form>

          {/* Lista de Sinais Personalizados */}
          {customSignals.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {customSignals.map((custom, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 flex items-center gap-1.5"
                >
                  <span>{custom}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustom(idx)}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

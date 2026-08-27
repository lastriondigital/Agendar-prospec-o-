import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Sparkles,
  Users,
  AlertTriangle,
  ArrowRight,
  Target,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Campaign, ProspectAction, Company, Contact, Lead } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { ScoreBadge } from '../qualification/ScoreBadge';
import { calculateLeadScore } from '../../utils/leadScoring';
import { formatPhoneNumber, getChannelBadgeDetails } from '../../utils/formatting';

interface ApplyCadenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onApplied?: (count: number) => void;
}

export const ApplyCadenceModal: React.FC<ApplyCadenceModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onApplied,
}) => {
  const {
    companies,
    contacts,
    leads,
    clients,
    services,
    icps,
    templates,
    actions,
    settings,
    upsertAction,
    refreshData,
  } = useApp();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProspectIds, setSelectedProspectIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [defaultTime, setDefaultTime] = useState<string>('10:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified prospect candidates
  const prospectCandidates = useMemo(() => {
    return companies
      .filter((comp) => comp.status !== 'archived')
      .map((comp) => {
        const primaryContact =
          contacts.find((c) => c.companyId === comp.id && c.isPrimary) ||
          contacts.find((c) => c.companyId === comp.id);
        const lead = leads.find((l) => l.companyId === comp.id);
        const scoreResult = calculateLeadScore(
          comp,
          primaryContact,
          lead,
          icps,
          services
        );

        // Check if there are already scheduled actions for this company in this campaign
        const existingActionsCount = actions.filter(
          (a) =>
            (a.clientId === comp.id || a.companyId === comp.id) &&
            a.campaignId === campaign.id &&
            a.status === 'pending'
        ).length;

        return {
          id: comp.id,
          name: comp.name,
          tradeName: comp.tradeName,
          contactName: primaryContact?.name,
          contactRole: primaryContact?.role,
          whatsapp: primaryContact?.whatsapp,
          niche: comp.niche,
          city: comp.city,
          stage: lead?.stage,
          score: scoreResult.score,
          existingActionsCount,
        };
      });
  }, [companies, contacts, leads, services, icps, actions, campaign.id]);

  const filteredCandidates = useMemo(() => {
    if (!searchTerm.trim()) return prospectCandidates;
    const q = searchTerm.toLowerCase();
    return prospectCandidates.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.contactName && p.contactName.toLowerCase().includes(q)) ||
        (p.niche && p.niche.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q))
      );
    });
  }, [prospectCandidates, searchTerm]);

  // Toggle selection
  const handleToggleProspect = (id: string) => {
    setSelectedProspectIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredCandidates.map((p) => p.id);
    const areAllSelected = allFilteredIds.every((id) => selectedProspectIds.includes(id));
    if (areAllSelected) {
      setSelectedProspectIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedProspectIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  // Steps
  const sequenceSteps = useMemo(() => {
    return campaign.sequence && campaign.sequence.length > 0
      ? campaign.sequence
      : [{ id: 's1', dayOffset: 0, title: 'Primeiro contato' }];
  }, [campaign.sequence]);

  // Calculated batch summary
  const totalActionsToCreate = selectedProspectIds.length * sequenceSteps.length;

  const handleGenerateCadence = async () => {
    if (selectedProspectIds.length === 0) {
      error('Selecione pelo menos um prospect para aplicar a cadência.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newActions: ProspectAction[] = [];
      const baseDate = new Date(startDate + 'T00:00:00');
      const now = new Date().toISOString();

      selectedProspectIds.forEach((prospectId) => {
        const cand = prospectCandidates.find((c) => c.id === prospectId);

        sequenceSteps.forEach((step, stepIndex) => {
          const stepDate = new Date(baseDate);
          stepDate.setDate(stepDate.getDate() + (step.dayOffset || 0));
          const stepDateStr = stepDate.toISOString().slice(0, 10);

          const template = templates.find((t) => t.id === step.templateId);

          newActions.push({
            id: `act-${Date.now()}-${stepIndex}-${Math.random().toString(36).slice(2, 6)}`,
            clientId: prospectId,
            companyId: prospectId,
            campaignId: campaign.id,
            campaignType: campaign.campaignType || 'Follow-up Cadenciado',
            actionType: step.actionType || step.title,
            templateId: step.templateId,
            scriptId: step.templateId,
            scriptTitle: template?.title || step.title,
            channel: step.channel || campaign.channel || 'whatsapp',
            scheduledDate: stepDateStr,
            scheduledTime: defaultTime,
            status: 'pending',
            priority: 'medium',
            estMinutes: settings.estMinutesPerAction || 2,
            cadenceStepIndex: stepIndex + 1,
            cadenceStepTitle: step.title,
            notes: step.notes,
            createdAt: now,
            updatedAt: now,
          });
        });
      });

      for (const act of newActions) {
        await upsertAction(act);
      }
      await refreshData();

      success(
        'Cadência aplicada com sucesso!',
        `${newActions.length} mensagens agendadas para ${selectedProspectIds.length} prospects ao longo de ${sequenceSteps.length} etapas.`
      );

      if (onApplied) {
        onApplied(newActions.length);
      }

      onClose();
    } catch (err) {
      console.error(err);
      error('Erro ao gerar cadência', (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Aplicar Cadência de Campanha: ${campaign.name}`}
      maxWidth="xl"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Campaign Info & Steps Preview */}
        <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-400" />
              Etapas da Cadência ({sequenceSteps.length} passos configurados)
            </span>
            <Badge variant="blue" size="sm">
              {campaign.channel.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {sequenceSteps.map((step, idx) => {
              const badge = getChannelBadgeDetails(step.channel || campaign.channel);
              return (
                <div
                  key={step.id || idx}
                  className="p-2 bg-neutral-950/80 border border-neutral-800 rounded-lg shrink-0 min-w-[140px] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-bold text-neutral-300">Passo {idx + 1}</span>
                    <span className="text-blue-400 font-mono">D+{step.dayOffset}</span>
                  </div>
                  <p className="font-medium text-neutral-200 truncate">{step.title}</p>
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${badge.bgClass} ${badge.textClass}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date & Time settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Data de Início da Cadência (Dia 0)
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              leftIcon={<Calendar className="w-4 h-4 text-neutral-400" />}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Horário Padrão de Execução
            </label>
            <Input
              type="time"
              value={defaultTime}
              onChange={(e) => setDefaultTime(e.target.value)}
              required
              leftIcon={<Clock className="w-4 h-4 text-neutral-400" />}
            />
          </div>
        </div>

        {/* Prospect Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Selecione os Prospects ({selectedProspectIds.length} selecionados)
            </label>
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {filteredCandidates.every((p) => selectedProspectIds.includes(p.id))
                ? 'Desmarcar Todos'
                : 'Selecionar Todos Filtrados'}
            </button>
          </div>

          <Input
            placeholder="Buscar por nome, nicho ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
          />

          <div className="border border-neutral-800 rounded-xl divide-y divide-neutral-800 max-h-48 overflow-y-auto bg-neutral-900/50">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((p) => {
                const isSelected = selectedProspectIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleProspect(p.id)}
                    className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-800/80 transition-colors ${
                      isSelected ? 'bg-blue-950/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-neutral-700 text-blue-600 focus:ring-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-neutral-200 truncate">
                            {p.name}
                          </span>
                          {p.contactName && (
                            <span className="text-[11px] text-neutral-400 truncate">
                              ({p.contactName})
                            </span>
                          )}
                          <ScoreBadge score={p.score} size="sm" />
                        </div>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          {p.niche && <span>{p.niche}</span>}
                          {p.city && <span>• {p.city}</span>}
                          {p.whatsapp && (
                            <span className="text-emerald-400 font-mono">
                              {formatPhoneNumber(p.whatsapp)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {p.existingActionsCount > 0 && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded shrink-0">
                        {p.existingActionsCount} agendamento(s) ativos
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-neutral-500">
                Nenhum prospect encontrado para o filtro.
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-3 bg-neutral-950 border border-blue-500/30 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium">Total de Mensagens Agendadas:</span>
            <span className="text-sm font-bold text-blue-400 font-mono">
              {totalActionsToCreate} ações
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            {selectedProspectIds.length} prospects × {sequenceSteps.length} etapas na cadência da campanha.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleGenerateCadence}
            isLoading={isSubmitting}
            disabled={selectedProspectIds.length === 0}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            Gerar e Agendar Cadência
          </Button>
        </div>
      </div>
    </Modal>
  );
};

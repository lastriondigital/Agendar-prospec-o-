import React, { useState } from 'react';
import {
  Flame,
  Target,
  Send,
  FileText,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  BookOpen,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Filter,
  Calendar,
  Layers,
} from 'lucide-react';
import { Company, Contact, HistoryEvent, IdealCustomerProfile, Lead, Service } from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { calculateDualLeadScore, DualLeadScoreResult } from '../../utils/leadScoring';
import { generateWhatsAppLink, interpolateMessage } from '../../utils/formatting';
import { Button } from '../ui/Button';
import { PlaybookModal } from '../sales/PlaybookModal';
import { DualScoreBreakdownModal } from '../qualification/DualScoreBreakdownModal';
import { LeadAiAnalysisModal } from '../copilot/LeadAiAnalysisModal';

interface NextActionsCentralProps {
  onOpenCompany: (company: Company) => void;
}

export const NextActionsCentral: React.FC<NextActionsCentralProps> = ({ onOpenCompany }) => {
  const { companies, contacts, leads, services, icps, history, completeAction, addHistoryEvent } = useApp();
  const { success, error } = useToast();

  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);
  const [activeScoreBreakdown, setActiveScoreBreakdown] = useState<{
    dualScore: DualLeadScoreResult;
    company: Company;
  } | null>(null);
  const [activeAiAnalysis, setActiveAiAnalysis] = useState<{
    company: Company;
    contact?: Contact;
    lead?: Lead;
  } | null>(null);
  const [activeScriptModal, setActiveScriptModal] = useState<{
    company: Company;
    contact?: Contact;
    lead?: Lead;
    script: string;
    actionTitle: string;
  } | null>(null);

  // Computa as oportunidades prioritárias ordenadas pelo Score Combinado (Dual Score)
  const prioritizedItems = companies
    .map((company) => {
      const companyContact = contacts.find((c) => c.companyId === company.id);
      const companyLead = leads.find((l) => l.companyId === company.id);
      const dualScore = calculateDualLeadScore(
        company,
        companyContact,
        companyLead,
        icps,
        services,
        history
      );

      // Determina problema ou sinal
      let problemOrSignal = 'Oportunidade de expansão e captação de clientes';
      if (!company.website || company.website.trim().length < 4) {
        problemOrSignal = 'Sem website oficial';
      } else if (company.websiteQuality === 'outdated') {
        problemOrSignal = 'Website desatualizado / baixa conversão';
      } else if (company.apparentNeed) {
        problemOrSignal = company.apparentNeed;
      } else if ((company.unitsCount ?? 1) > 1) {
        problemOrSignal = `Múltiplas unidades (${company.unitsCount}) + processos a padronizar`;
      }

      // Próxima ação recomendada
      let nextActionTitle = 'Primeiro contato personalizado';
      if (companyLead?.stage === 'PRIMEIRO_CONTACTO') {
        nextActionTitle = 'Follow-up de valor';
      } else if (companyLead?.stage === 'QUALIFICADO') {
        nextActionTitle = 'Diagnóstico e proposta consultiva';
      } else if (companyLead?.stage === 'PROPOSTA') {
        nextActionTitle = 'Alinhamento de escopo e fechamento';
      }

      // Script recomendado
      const contactName = companyContact?.name ? `Olá, ${companyContact.name}` : `Olá equipe da ${company.name}`;
      const defaultScript = `${contactName}, tudo bem?\n\nAcompanhei a presença da ${company.name} no setor de ${company.niche} e notei ${problemOrSignal.toLowerCase()}.\n\nEstruturamos soluções práticas para acelerar sua geração de demanda sem complicação. Terias 10 minutos nesta semana para um diagnóstico rápido?`;

      return {
        company,
        contact: companyContact,
        lead: companyLead,
        dualScore,
        problemOrSignal,
        nextActionTitle,
        defaultScript,
      };
    })
    .filter((item) => item.lead?.stage !== 'CLIENTE' && item.lead?.stage !== 'PERDIDO')
    .sort((a, b) => b.dualScore.priorityScore - a.dualScore.priorityScore)
    .slice(0, 8); // Top 8 ações de hoje

  const handleOpenWhatsApp = (item: (typeof prioritizedItems)[0]) => {
    const phone = item.contact?.whatsapp || item.contact?.phone;
    if (!phone) {
      error('Este prospect não possui telefone/WhatsApp cadastrado.');
      return;
    }
    const link = generateWhatsAppLink(phone, item.defaultScript);
    window.open(link, '_blank');
    addHistoryEvent({
      companyId: item.company.id,
      leadId: item.lead?.id,
      contactId: item.contact?.id,
      type: 'whatsapp_opened',
      title: 'WhatsApp Aberto via Minhas Próximas Ações',
      description: `Mensagem enviada com foco em "${item.problemOrSignal}".`,
    });
    success('WhatsApp aberto com mensagem preparada!');
  };

  const handleMarkAsDone = async (item: (typeof prioritizedItems)[0]) => {
    if (item.lead) {
      await completeAction(item.lead.id, 'Ação concluída pela Central de Ações');
    } else {
      await addHistoryEvent({
        companyId: item.company.id,
        contactId: item.contact?.id,
        type: 'action_completed',
        title: `Ação Concluída: ${item.nextActionTitle}`,
        description: `Contato realizado com sucesso para ${item.company.name}.`,
      });
    }
    success(`Ação concluída para ${item.company.name}!`);
  };

  return (
    <div className="space-y-4">
      {/* Header Central de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl border border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-current" />
              O Que Fazer Agora?
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
              {prioritizedItems.length} Oportunidades Prioritárias
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#202124] dark:text-[#E8EAED]">
            Minhas Próximas Ações
          </h2>
          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
            Oportunidades ranqueadas por Score Duplo (Oportunidade x Qualificação) com scripts prontos para contato imediato.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPlaybookOpen(true)}
            leftIcon={<BookOpen className="w-4 h-4 text-[#3F6FB5]" />}
          >
            Playbook Comercial
          </Button>
        </div>
      </div>

      {/* Grid / Lista de Oportunidades Prioritárias */}
      <div className="space-y-3">
        {prioritizedItems.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#181B20] rounded-2xl border border-[#E6E8EB] dark:border-[#2D3139] text-[#5F6368] dark:text-[#9AA0A6] space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
              Tudo em dia! Nenhuma ação pendente no momento.
            </p>
            <p className="text-xs">Cadastre novas empresas ou reative contatos anteriores no funil.</p>
          </div>
        ) : (
          prioritizedItems.map((item) => {
            const isIdentifiedDemand = item.dualScore.demandType === 'demanda_identificada';

            return (
              <div
                key={item.company.id}
                className="p-4 rounded-2xl border border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20] shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Score Badge Interativo */}
                  <button
                    onClick={() =>
                      setActiveScoreBreakdown({
                        dualScore: item.dualScore,
                        company: item.company,
                      })
                    }
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0 hover:scale-105 transition-transform"
                    title="Clique para ver o detalhamento do Score"
                  >
                    <div className="flex items-center gap-0.5 text-xs font-black">
                      <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
                      {item.dualScore.priorityScore}
                    </div>
                    <span className="text-[9px] font-bold uppercase opacity-80">Score</span>
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        onClick={() => onOpenCompany(item.company)}
                        className="text-sm font-bold text-[#202124] dark:text-[#E8EAED] hover:text-[#3F6FB5] dark:hover:text-blue-400 cursor-pointer truncate"
                      >
                        {item.company.name}
                      </h3>

                      {/* Tag de Demanda */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isIdentifiedDemand
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                            : 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {isIdentifiedDemand ? 'Demanda Identificada' : 'Oportunidade Latente'}
                      </span>

                      {/* Nicho / Cidade */}
                      <span className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                        • {item.company.niche} {item.company.city ? `(${item.company.city})` : ''}
                      </span>
                    </div>

                    {/* Problema / Sinais */}
                    <div className="text-xs text-[#5F6368] dark:text-[#9AA0A6] flex flex-wrap items-center gap-1.5">
                      <strong className="text-[#202124] dark:text-[#E8EAED]">Problema/Sinais:</strong>
                      <span className="text-neutral-700 dark:text-neutral-300">{item.problemOrSignal}</span>
                    </div>

                    {/* Próxima Ação */}
                    <div className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1 font-semibold">
                      <span>Próxima ação:</span>
                      <span className="underline decoration-blue-300 dark:decoration-blue-700">
                        {item.nextActionTitle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E6E8EB] dark:border-[#2D3139]">
                  {/* [ABRIR] */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenCompany(item.company)}
                    className="text-xs"
                  >
                    Abrir
                  </Button>

                  {/* [ANALISAR COM IA] */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setActiveAiAnalysis({
                        company: item.company,
                        contact: item.contact,
                        lead: item.lead,
                      })
                    }
                    className="text-xs text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40"
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                  >
                    IA
                  </Button>

                  {/* [VER SCRIPT] */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setActiveScriptModal({
                        company: item.company,
                        contact: item.contact,
                        lead: item.lead,
                        script: item.defaultScript,
                        actionTitle: item.nextActionTitle,
                      })
                    }
                    className="text-xs"
                    leftIcon={<FileText className="w-3.5 h-3.5" />}
                  >
                    Ver Script
                  </Button>

                  {/* [ABRIR WHATSAPP] */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenWhatsApp(item)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    WhatsApp
                  </Button>

                  {/* [MARCAR COMO CONCLUÍDO] */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleMarkAsDone(item)}
                    className="text-xs hover:text-emerald-600 hover:border-emerald-300"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Concluir
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Playbook Comercial */}
      {isPlaybookOpen && <PlaybookModal onClose={() => setIsPlaybookOpen(false)} />}

      {/* Modal Detalhamento de Score */}
      {activeScoreBreakdown && (
        <DualScoreBreakdownModal
          dualScore={activeScoreBreakdown.dualScore}
          company={activeScoreBreakdown.company}
          onClose={() => setActiveScoreBreakdown(null)}
        />
      )}

      {/* Modal Analisar com IA */}
      {activeAiAnalysis && (
        <LeadAiAnalysisModal
          company={activeAiAnalysis.company}
          contact={activeAiAnalysis.contact}
          lead={activeAiAnalysis.lead}
          onClose={() => setActiveAiAnalysis(null)}
        />
      )}

      {/* Modal Ver Script Rápido */}
      {activeScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#181B20] rounded-2xl border border-[#E6E8EB] dark:border-[#2D3139] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E8EB] dark:border-[#2D3139]">
              <div>
                <span className="text-xs font-bold text-[#3F6FB5] uppercase tracking-wider">
                  Script de Mensagem
                </span>
                <h3 className="text-base font-bold text-[#202124] dark:text-[#E8EAED]">
                  {activeScriptModal.company.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveScriptModal(null)}
                className="p-1 text-[#5F6368] hover:text-[#202124] dark:text-[#9AA0A6] dark:hover:text-[#E8EAED] rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl border border-[#E6E8EB] dark:border-[#2D3139] bg-[#F7F8FA] dark:bg-[#20242A] text-xs text-[#202124] dark:text-[#E8EAED] whitespace-pre-wrap leading-relaxed">
              {activeScriptModal.script}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(activeScriptModal.script);
                  success('Script copiado!');
                }}
              >
                Copiar Texto
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const phone = activeScriptModal.contact?.whatsapp || activeScriptModal.contact?.phone;
                    if (phone) {
                      window.open(generateWhatsAppLink(phone, activeScriptModal.script), '_blank');
                      success('WhatsApp aberto!');
                    } else {
                      error('Sem telefone/WhatsApp cadastrado.');
                    }
                    setActiveScriptModal(null);
                  }}
                >
                  Abrir no WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

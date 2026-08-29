import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Lock,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  AiActionPermissions,
  AiAuthorizedAction,
  LeadStage,
} from '../../types';
import { generateAiActionSuggestions } from '../../utils/assistantEngine';

interface AiAuthorizedActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAuthorizedActionsModal: React.FC<AiAuthorizedActionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { leads, companies, history, updateLead, addHistoryEvent } = useApp();
  const { success, info } = useToast();

  const [activeTab, setActiveTab] = useState<'pending' | 'permissions'>('pending');

  // Ações sugeridas em fila
  const [pendingActions, setPendingActions] = useState<AiAuthorizedAction[]>(() =>
    generateAiActionSuggestions(leads, companies, history)
  );

  // Configurações de permissões da IA
  const [permissions, setPermissions] = useState<AiActionPermissions>({
    canCreateClient: false,
    canCreateScript: true,
    canCreateTasks: 'require_auth',
    canMoveLeads: 'require_auth',
    canCreateCampaigns: 'require_auth',
    canAdjustWeights: 'require_auth',
  });

  const handleAuthorize = (action: AiAuthorizedAction) => {
    if (action.type === 'create_followup_tasks') {
      const leadIds: string[] = action.details?.leadIds || [];
      leadIds.forEach((id) => {
        const targetLead = leads.find((l) => l.id === id);
        if (targetLead) {
          updateLead({
            ...targetLead,
            nextActionTitle: 'Follow-up 1 — Reengajamento',
            stage: 'FOLLOW_UP',
            priority: 'alta',
          });
        }
      });
      success(`${leadIds.length} tarefas de follow-up criadas com autorização.`);
    } else if (action.type === 'move_leads_stage') {
      const leadIds: string[] = action.details?.leadIds || [];
      const targetStage: LeadStage = action.details?.targetStage || 'DIAGNOSTICO';
      leadIds.forEach((id) => {
        const targetLead = leads.find((l) => l.id === id);
        if (targetLead) {
          updateLead({
            ...targetLead,
            stage: targetStage,
            nextActionTitle: 'Apresentar Diagnóstico e Agendar Conversa',
          });
        }
      });
      success(`${leadIds.length} leads movidos para ${targetStage} com autorização.`);
    } else if (action.type === 'suggest_score_weight') {
      success('Novo peso de sinal registrado com sucesso.');
    }

    addHistoryEvent({
      type: 'note_added',
      title: `Ação da IA Autorizada: ${action.title}`,
      description: action.description,
    });

    setPendingActions((prev) =>
      prev.map((a) => (a.id === action.id ? { ...a, status: 'authorized', executedAt: new Date().toISOString() } : a))
    );
  };

  const handleReject = (actionId: string) => {
    setPendingActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: 'rejected' } : a))
    );
    info('Ação da IA rejeitada.');
  };

  const pendingList = pendingActions.filter((a) => a.status === 'pending');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Central de Ações Autorizadas da IA (Human-in-the-Loop)"
      size="lg"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Banner de Garantia de Segurança */}
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-indigo-900 dark:text-indigo-200">
            <div className="font-bold">Controle Humano Obrigatório</div>
            <p>
              A IA nunca executa ações estruturais, envio de mensagens ou movimentações de pipeline sem a sua prévia autorização explícita.
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-2 border-b border-[#E6E8EB] dark:border-[#2D3139] pb-3">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#3F6FB5] text-white'
                : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ações Pendentes de Aprovação ({pendingList.length})
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'bg-[#3F6FB5] text-white'
                : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Matriz de Permissões da IA
          </button>
        </div>

        {/* ABA 1: AÇÕES PENDENTES */}
        {activeTab === 'pending' && (
          <div className="space-y-3">
            {pendingList.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-[#E6E8EB] dark:border-[#2D3139] bg-[#F7F8FA] dark:bg-[#181B20]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                  Nenhuma ação pendente de autorização
                </p>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-1">
                  Todas as sugestões da IA foram avaliadas ou o sistema está em conformidade total.
                </p>
              </div>
            ) : (
              pendingList.map((action) => (
                <div
                  key={action.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                          Sugestão da IA
                        </span>
                        <h4 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                          {action.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    {action.impactCount && (
                      <Badge variant="blue" size="sm">
                        {action.impactCount} leads impactados
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E8EB] dark:border-[#2D3139]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(action.id)}
                      className="text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Rejeitar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAuthorize(action)}
                      className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Autorizar Ação
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ABA 2: MATRIZ DE PERMISSÕES */}
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
              <span className="text-xs font-bold text-[#202124] dark:text-[#E8EAED]">
                Governança de Autonomia da IA
              </span>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                Configure o nível de controle para cada tipo de operação.
              </p>
            </div>

            <div className="space-y-2">
              {/* Criar Scripts */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#202124] dark:text-[#E8EAED]">IA pode sugerir/criar scripts de abordagem?</div>
                  <div className="text-[#5F6368] dark:text-[#9AA0A6]">Gera textos personalizados com base no contexto.</div>
                </div>
                <Badge variant="green">Permitido (Sem Envio)</Badge>
              </div>

              {/* Criar Tarefas */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#202124] dark:text-[#E8EAED]">IA pode agendar tarefas de follow-up?</div>
                  <div className="text-[#5F6368] dark:text-[#9AA0A6]">Insere lembretes na agenda de prospecção.</div>
                </div>
                <Badge variant="blue">Requer Autorização</Badge>
              </div>

              {/* Mover Leads */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#202124] dark:text-[#E8EAED]">IA pode mover estágio de Leads no Funil?</div>
                  <div className="text-[#5F6368] dark:text-[#9AA0A6]">Avança leads de Primeiro Contato para Diagnóstico.</div>
                </div>
                <Badge variant="blue">Requer Autorização</Badge>
              </div>

              {/* Alterar Pesos */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#202124] dark:text-[#E8EAED]">IA pode alterar pesos do algoritmo de Score?</div>
                  <div className="text-[#5F6368] dark:text-[#9AA0A6]">Ajustes de pontuação baseados no aprendizado de conversão.</div>
                </div>
                <Badge variant="amber">Sempre Requer Autorização</Badge>
              </div>

              {/* Envio Direto de Mensagens */}
              <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-rose-900 dark:text-rose-200">Disparo automático de mensagens sem clique humano</div>
                  <div className="text-rose-700 dark:text-rose-300">Envio automático por robôs / bots autônomos.</div>
                </div>
                <Badge variant="red">Estritamente Bloqueado</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="flex justify-end pt-4 border-t border-[#E6E8EB] dark:border-[#2D3139]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

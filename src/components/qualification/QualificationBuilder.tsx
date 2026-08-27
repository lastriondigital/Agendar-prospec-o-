import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  Edit2,
  HelpCircle,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmDialogContext';
import {
  DEFAULT_SERVICE_QUALIFICATIONS,
  getQuestionsForService,
} from '../../utils/qualification';
import { QualificationQuestion, Service, ServiceQualificationConfig } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

export const QualificationBuilder: React.FC = () => {
  const { services, settings, updateSettings } = useApp();
  const { success, info } = useToast();
  const confirm = useConfirm();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services[0]?.id || 'website'
  );

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0] || {
    id: 'website',
    name: 'Criação de Website',
    description: 'Desenvolvimento e reformulação de sites institucionais',
  };

  const customConfigs = settings.qualificationConfigs || [];
  const activeCustomConfig = customConfigs.find(
    (c) => c.serviceId === currentService.id || c.serviceName === currentService.name
  );

  // Perguntas ativas (customizadas ou padrão)
  const currentQuestions: QualificationQuestion[] = activeCustomConfig
    ? activeCustomConfig.questions
    : getQuestionsForService(currentService.name, currentService.id, customConfigs);

  // Estado do Modal de Adicionar / Editar Pergunta
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QualificationQuestion | null>(null);

  // Form fields
  const [formText, setFormText] = useState('');
  const [formWeightYes, setFormWeightYes] = useState<number>(20);
  const [formWeightNo, setFormWeightNo] = useState<number>(0);
  const [formPositiveIf, setFormPositiveIf] = useState<'SIM' | 'NAO'>('SIM');
  const [formPositiveLabel, setFormPositiveLabel] = useState('');
  const [formNegativeLabel, setFormNegativeLabel] = useState('');

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormText('');
    setFormWeightYes(20);
    setFormWeightNo(0);
    setFormPositiveIf('SIM');
    setFormPositiveLabel('');
    setFormNegativeLabel('');
    setIsQuestionModalOpen(true);
  };

  const handleOpenEdit = (q: QualificationQuestion) => {
    setEditingQuestion(q);
    setFormText(q.question);
    setFormWeightYes(q.weightYes);
    setFormWeightNo(q.weightNo);
    setFormPositiveIf(q.positiveCriterionIf || 'SIM');
    setFormPositiveLabel(q.positiveLabel || '');
    setFormNegativeLabel(q.negativeLabel || '');
    setIsQuestionModalOpen(true);
  };

  // Salvar perguntas para o serviço selecionado
  const saveQuestionsForCurrentService = async (newQuestions: QualificationQuestion[]) => {
    const updatedConfigs = [...customConfigs];
    const existingIdx = updatedConfigs.findIndex(
      (c) => c.serviceId === currentService.id || c.serviceName === currentService.name
    );

    const configItem: ServiceQualificationConfig = {
      id: activeCustomConfig?.id || `cfg-${currentService.id}`,
      serviceId: currentService.id,
      serviceName: currentService.name,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      updatedConfigs[existingIdx] = configItem;
    } else {
      updatedConfigs.push(configItem);
    }

    await updateSettings({ qualificationConfigs: updatedConfigs });
  };

  // Salvar pergunta no modal
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) return;

    let updatedList: QualificationQuestion[];

    if (editingQuestion) {
      // Editar
      updatedList = currentQuestions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              question: formText.trim(),
              weightYes: Number(formWeightYes),
              weightNo: Number(formWeightNo),
              positiveCriterionIf: formPositiveIf,
              positiveLabel: formPositiveLabel.trim() || undefined,
              negativeLabel: formNegativeLabel.trim() || undefined,
            }
          : q
      );
      success('Pergunta atualizada com sucesso!');
    } else {
      // Adicionar nova
      const newQuestion: QualificationQuestion = {
        id: `q-custom-${Date.now()}`,
        question: formText.trim(),
        type: 'SIM_NAO',
        weightYes: Number(formWeightYes),
        weightNo: Number(formWeightNo),
        positiveCriterionIf: formPositiveIf,
        positiveLabel: formPositiveLabel.trim() || undefined,
        negativeLabel: formNegativeLabel.trim() || undefined,
        active: true,
        order: currentQuestions.length + 1,
      };
      updatedList = [...currentQuestions, newQuestion];
      success('Nova pergunta adicionada ao questionário!');
    }

    await saveQuestionsForCurrentService(updatedList);
    setIsQuestionModalOpen(false);
  };

  // Duplicar pergunta
  const handleDuplicate = async (q: QualificationQuestion) => {
    const duplicate: QualificationQuestion = {
      ...q,
      id: `q-dup-${Date.now()}`,
      question: `${q.question} (Cópia)`,
      order: currentQuestions.length + 1,
    };
    const updated = [...currentQuestions, duplicate];
    await saveQuestionsForCurrentService(updated);
    success('Pergunta duplicada com sucesso!');
  };

  // Reordenar para cima
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const items = [...currentQuestions];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    await saveQuestionsForCurrentService(items);
  };

  // Reordenar para baixo
  const handleMoveDown = async (index: number) => {
    if (index === currentQuestions.length - 1) return;
    const items = [...currentQuestions];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    await saveQuestionsForCurrentService(items);
  };

  // Ativar / Desativar
  const handleToggleActive = async (q: QualificationQuestion) => {
    const updated = currentQuestions.map((item) =>
      item.id === q.id ? { ...item, active: item.active === false ? true : false } : item
    );
    await saveQuestionsForCurrentService(updated);
  };

  // Excluir pergunta
  const handleDelete = (q: QualificationQuestion) => {
    confirm({
      title: 'Remover Pergunta',
      message: `Tem certeza que deseja remover a pergunta "${q.question}"?`,
      isDestructive: true,
      onConfirm: async () => {
        const updated = currentQuestions.filter((item) => item.id !== q.id);
        await saveQuestionsForCurrentService(updated);
        info('Pergunta removida do questionário.');
      },
    });
  };

  // Restaurar padrão
  const handleResetToDefault = () => {
    confirm({
      title: 'Restaurar Questionário Padrão',
      message: `Deseja restaurar as perguntas recomendadas de fábrica para o serviço "${currentService.name}"?`,
      onConfirm: async () => {
        const defaultSet = getQuestionsForService(currentService.name, currentService.id);
        await saveQuestionsForCurrentService(defaultSet);
        success('Questionário padrão restaurado!');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Seletor de Serviço */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-neutral-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>Construtor de Questionário de Qualificação</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Personalize o questionário específico de cada serviço. Defina perguntas, tipos (SIM/NÃO) e pesos de pontuação.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              title="Restaurar padrão deste serviço"
            >
              Restaurar Padrão
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Adicionar Pergunta
            </Button>
          </div>
        </div>

        {/* Seletor de Abas de Serviço */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-neutral-800/80">
          <span className="text-xs font-semibold text-neutral-400 shrink-0 mr-1">
            Selecione o Serviço:
          </span>
          {services.map((srv) => (
            <button
              key={srv.id}
              onClick={() => setSelectedServiceId(srv.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedServiceId === srv.id
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-xs'
                  : 'bg-neutral-950/60 text-neutral-400 border border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              {srv.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Perguntas do Serviço */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Perguntas para: <strong className="text-emerald-400">{currentService.name}</strong> ({currentQuestions.length})
          </span>
          <span className="text-[11px] text-neutral-500">
            Respostas alimentam o Score 0–100 e recomendação automática
          </span>
        </div>

        {currentQuestions.length > 0 ? (
          <div className="space-y-2.5">
            {currentQuestions.map((q, idx) => (
              <Card
                key={q.id}
                padding="md"
                className={`transition-colors border ${
                  q.active === false
                    ? 'bg-neutral-950/40 border-neutral-900 opacity-60'
                    : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Pergunta & Detalhes */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-black text-neutral-500">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-neutral-100 leading-snug">
                        {q.question}
                      </span>
                      {q.active === false && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                          Inativa
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400 flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <span className="text-emerald-400 font-bold">SIM:</span> +{q.weightYes} pts
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <span className="text-rose-400 font-bold">NÃO:</span> +{q.weightNo} pts
                      </span>
                      {q.positiveLabel && (
                        <span className="text-[11px] text-neutral-400 truncate max-w-xs">
                          • <strong className="text-neutral-300">Gatilho:</strong> {q.positiveLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações de Reordenação e Edição */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-neutral-400" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === currentQuestions.length - 1}
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-neutral-400" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleToggleActive(q)}
                      title={q.active === false ? 'Ativar pergunta' : 'Desativar pergunta'}
                    >
                      {q.active === false ? (
                        <ToggleLeft className="w-4 h-4 text-neutral-600" />
                      ) : (
                        <ToggleRight className="w-4 h-4 text-emerald-400" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDuplicate(q)}
                      title="Duplicar pergunta"
                    >
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleOpenEdit(q)}
                      title="Editar pergunta"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-neutral-300" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDelete(q)}
                      title="Excluir pergunta"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-3">
            <Sliders className="w-8 h-8 text-neutral-500 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-200">
              Nenhuma pergunta cadastrada para este serviço
            </h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Adicione perguntas específicas para calcular o Score (0–100) deste serviço durante o diagnóstico do lead.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Criar Primeira Pergunta
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Adicionar / Editar Pergunta */}
      {isQuestionModalOpen && (
        <Modal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          title={editingQuestion ? 'Editar Pergunta de Qualificação' : 'Nova Pergunta de Qualificação'}
          size="md"
        >
          <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
            {/* Texto da Pergunta */}
            <div>
              <label className="block text-xs font-bold text-neutral-200 mb-1">
                Texto da Pergunta <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                required
                rows={2}
                placeholder="Ex: A empresa possui website próprio ativo?"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Pesos de Pontuação (SIM e NÃO) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">
                  Pontos se SIM (0 a 50)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={formWeightYes}
                  onChange={(e) => setFormWeightYes(Number(e.target.value))}
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">
                  Ex: +20 pts quando o critério for atendido
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-400 mb-1">
                  Pontos se NÃO (0 a 50)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={formWeightNo}
                  onChange={(e) => setFormWeightNo(Number(e.target.value))}
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">
                  Ex: +20 pts se NÃO possui site (oportunidade)
                </span>
              </div>
            </div>

            {/* Qual resposta é considerada positiva para a venda */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Qual resposta indica alta oportunidade de venda?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormPositiveIf('SIM')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    formPositiveIf === 'SIM'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  SIM é positivo
                </button>
                <button
                  type="button"
                  onClick={() => setFormPositiveIf('NAO')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    formPositiveIf === 'NAO'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  NÃO é positivo (Oportunidade)
                </button>
              </div>
            </div>

            {/* Rótulo de Gatilho / Ponto Positivo */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Rótulo do Ponto Forte / Gatilho Identificado
              </label>
              <Input
                value={formPositiveLabel}
                onChange={(e) => setFormPositiveLabel(e.target.value)}
                placeholder="Ex: Não possui website (alta oportunidade de criação)"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Será exibido na explicação do resultado ("Por que este lead é prioritário?")
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsQuestionModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Salvar Pergunta
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

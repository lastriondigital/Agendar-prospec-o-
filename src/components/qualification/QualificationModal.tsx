import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  HelpCircle,
  MessageSquare,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  XCircle,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Company, Contact, Lead, QualificationResult } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  calculateQualificationResult,
  getQuestionsForService,
  QualificationQuestion,
} from '../../utils/qualification';

interface QualificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  contact?: Contact | null;
  lead: Lead | null;
  onStartExecution?: () => void;
}

export const QualificationModal: React.FC<QualificationModalProps> = ({
  isOpen,
  onClose,
  company,
  contact,
  lead,
  onStartExecution,
}) => {
  const { services, settings, updateLead, updateCompany, addHistoryEvent } = useApp();
  const { success } = useToast();

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, 'SIM' | 'NÃO' | 'NAO'>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && lead) {
      const activeServiceId = lead.serviceId || services[0]?.id || 'website';
      setSelectedServiceId(activeServiceId);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setIsCompleted(false);
      setNotes('');
    }
  }, [isOpen, lead, services]);

  if (!isOpen || !company || !lead) return null;

  const currentService =
    services.find((s) => s.id === selectedServiceId) ||
    services[0] || { id: 'website', name: 'Website', description: '' };
  const serviceName = currentService?.name || lead.serviceName || 'Website';

  const questions: QualificationQuestion[] = getQuestionsForService(
    serviceName,
    currentService?.id,
    settings.qualificationConfigs
  );

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  const currentResult: QualificationResult = calculateQualificationResult(
    questions,
    answers,
    {
      company,
      contact,
      lead,
      serviceId: currentService.id,
      serviceName: currentService.name,
    }
  );

  // Manipular resposta com auto-avanço para a próxima pergunta
  const handleSelectAnswer = (ans: 'SIM' | 'NÃO') => {
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion.id]: ans };
    setAnswers(newAnswers);

    // Se não for a última pergunta, avança automaticamente após breve feedback
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 150);
    } else {
      // Chegou ao final
      setTimeout(() => {
        setIsCompleted(true);
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
  };

  const handleSaveResult = async (startExecutionAfter = false) => {
    try {
      setIsSaving(true);

      // Salvar diagnóstico no lead
      const updatedLead: Lead = {
        ...lead,
        score: currentResult.score,
        priority:
          currentResult.score >= 80
            ? 'alta'
            : currentResult.score >= 60
            ? 'média'
            : 'baixa',
        qualificationResult: currentResult,
        serviceQualifications: {
          ...(lead.serviceQualifications || {}),
          [currentService.id]: currentResult,
        },
        notes: notes.trim()
          ? `${lead.notes ? `${lead.notes}\n\n` : ''}[Qualificação ${new Date().toLocaleDateString('pt-BR')} - ${currentService.name}: ${currentResult.score}/100 pts - ${currentResult.classificationLabel}]: ${notes.trim()}`
          : lead.notes,
        updatedAt: new Date().toISOString(),
      };

      await updateLead(updatedLead);

      // Salvar também no registro consolidado da empresa
      const updatedCompany: Company = {
        ...company,
        serviceQualifications: {
          ...(company.serviceQualifications || {}),
          [currentService.id]: currentResult,
        },
        updatedAt: new Date().toISOString(),
      };

      await updateCompany(updatedCompany);

      await addHistoryEvent({
        companyId: company.id,
        contactId: contact?.id,
        leadId: lead.id,
        type: 'updated',
        title: `Qualificação ${currentService.name}: ${currentResult.score}/100 pts (${currentResult.classificationLabel})`,
        description: `Resultado: ${currentResult.recommendation}. Motivos identificados: ${currentResult.positivePoints.join(', ') || 'Nenhum'}. ${notes ? `Notas: ${notes}` : ''}`,
      });

      success(`Qualificação de ${currentResult.score} pts (${currentResult.classificationLabel}) salva com sucesso!`);
      onClose();

      if (startExecutionAfter && onStartExecution) {
        onStartExecution();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Qualificação de Lead — ${company.name}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Top Header: Empresa, Contato e Seletor de Serviço */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block">
              Lead Selecionado
            </span>
            <p className="font-bold text-neutral-100 mt-0.5">
              {company.name} {contact ? `• ${contact.name} (${contact.role || 'Contacto'})` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-medium">Serviço:</span>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setAnswers({});
                setCurrentQuestionIndex(0);
                setIsCompleted(false);
              }}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FLUXO INTERATIVO: 1 PERGUNTA POR VEZ */}
        {!isCompleted && currentQuestion && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Barra de Progresso Superior */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-emerald-400">
                  PERGUNTA {currentQuestionIndex + 1} DE {totalQuestions}
                </span>
                <span className="text-neutral-400 font-medium">{progressPercent}% Concluído</span>
              </div>
              <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Card da Pergunta Atual */}
            <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                  Critério #{currentQuestionIndex + 1}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-100 leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Botões Ergonômicos Grandes com Auto-Avanço */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectAnswer('SIM')}
                  className={`py-4 px-5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    answers[currentQuestion.id] === 'SIM'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md ring-2 ring-emerald-500/20 scale-[1.01]'
                      : 'bg-neutral-950/80 border-neutral-800 text-neutral-200 hover:border-emerald-500/40 hover:bg-neutral-800'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>SIM</span>
                  <span className="text-xs font-mono font-normal text-emerald-400/80">
                    (+{currentQuestion.weightYes} pts)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAnswer('NÃO')}
                  className={`py-4 px-5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    answers[currentQuestion.id] === 'NÃO'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md ring-2 ring-rose-500/20 scale-[1.01]'
                      : 'bg-neutral-950/80 border-neutral-800 text-neutral-200 hover:border-rose-500/40 hover:bg-neutral-800'
                  }`}
                >
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>NÃO</span>
                  <span className="text-xs font-mono font-normal text-rose-400/80">
                    (+{currentQuestion.weightNo} pts)
                  </span>
                </button>
              </div>
            </div>

            {/* Controles de Navegação Anterior / Próxima */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Anterior
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCompleted(true)}
                  disabled={answeredCount === 0}
                >
                  Ver Resultado Parcial
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {currentQuestionIndex === totalQuestions - 1 ? 'Finalizar' : 'Próxima'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TELA FINAL: RESULTADO DA QUALIFICAÇÃO & EXPLICABILIDADE */}
        {isCompleted && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header de Score e Faixa */}
            <div
              className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
                currentResult.classification === 'prioridade_maxima'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : currentResult.classification === 'alta'
                  ? 'bg-sky-500/10 border-sky-500/30'
                  : currentResult.classification === 'media'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Score Circular Badge */}
                <div className="w-20 h-20 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center shadow-inner shrink-0">
                  <span
                    className={`text-3xl font-black font-mono leading-none ${
                      currentResult.classification === 'prioridade_maxima'
                        ? 'text-emerald-400'
                        : currentResult.classification === 'alta'
                        ? 'text-sky-400'
                        : currentResult.classification === 'media'
                        ? 'text-amber-400'
                        : 'text-neutral-400'
                    }`}
                  >
                    {currentResult.score}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-1 font-mono">/100</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        currentResult.classification === 'prioridade_maxima'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : currentResult.classification === 'alta'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : currentResult.classification === 'media'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      {currentResult.classificationLabel}
                    </span>
                    {currentResult.score >= 80 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <Flame className="w-4 h-4 fill-emerald-400" />
                        Oportunidade Quente
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-neutral-200">
                    Qualificação Concluída para: {currentService.name}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {answeredCount} de {totalQuestions} perguntas respondidas com sucesso.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Refazer Perguntas
              </Button>
            </div>

            {/* Bloco 1: Por que este lead é prioritário? */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Por que este lead é prioritário?</span>
              </h4>

              {currentResult.breakdown && currentResult.breakdown.length > 0 ? (
                <div className="space-y-2">
                  {currentResult.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-neutral-950/60 border border-emerald-500/20 text-xs"
                    >
                      <div className="flex items-start gap-2">
                        <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-neutral-200">{item.reason}</span>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{item.questionText}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                        +{item.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  Nenhum gatilho de pontuação positiva registrado nas respostas.
                </p>
              )}
            </div>

            {/* Bloco 2: Dados Ausentes Identificados */}
            {currentResult.missingData && currentResult.missingData.length > 0 && (
              <div className="p-4 rounded-2xl bg-neutral-900 border border-amber-500/20 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Dados Ausentes no Cadastro</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {currentResult.missingData.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800 text-neutral-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bloco 3: Recomendação Acionável */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                Recomendação Operacional do PROSPECT OS
              </span>
              <p className="text-xs text-emerald-200 font-medium leading-relaxed">
                {currentResult.recommendation}
              </p>
            </div>

            {/* Campo Opcional de Notas */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Notas & Observações do Diagnóstico (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ex: Decisor demonstrou urgência para renovar o site antes do lançamento em setembro..."
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Ações Finais */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentQuestionIndex(0);
                }}
              >
                Revisar Perguntas
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveResult(false)}
                  isLoading={isSaving}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Salvar Score ({currentResult.score} pts)
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveResult(true)}
                  isLoading={isSaving}
                  leftIcon={<Zap className="w-4 h-4" />}
                >
                  Salvar & Iniciar Prospecção
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

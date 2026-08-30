import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  Flame,
  HardDrive,
  Kanban,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { LeadionLogo } from '../common/LeadionLogo';

export interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFirstCompany?: () => void;
}

interface TutorialStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: string[];
  keyTakeaway: string;
  badge: string;
}

export const OnboardingTutorialModal: React.FC<OnboardingTutorialModalProps> = ({
  isOpen,
  onClose,
  onAddFirstCompany,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const steps: TutorialStep[] = [
    {
      stepNumber: 1,
      badge: 'Visão Geral',
      title: 'Bem-vindo ao LEADION',
      subtitle: 'Plataforma profissional de prospecção e conversão comercial',
      icon: <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      content: [
        'O LEADION foi construído para eliminar a hesitação e acelerar o ritmo diário das suas abordagens comerciais.',
        'Ao invés de se perder em planilhas dispersas ou ferramentas complexas, você opera com foco total: uma oportunidade por vez, com script personalizado e histórico centralizado.',
      ],
      keyTakeaway: 'Foco na execução: menos tempo perdido planejando e mais tempo falando com decisores reais.',
    },
    {
      stepNumber: 2,
      badge: 'Estrutura de Contatos',
      title: 'Módulo Clientes & Decisores',
      subtitle: 'Organize empresas com múltiplos decisores e canais',
      icon: <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      content: [
        'Toda abordagem começa cadastrando uma empresa e seus responsáveis comerciais (Sócios, Diretores, Gerentes).',
        'Empresas recém-adicionadas começam como Leads ou Prospects, e só passam para Clientes quando você fechar a proposta.',
        'Nosso sistema previne duplicidades automaticamente por nome, telefone e domínio.',
      ],
      keyTakeaway: 'Você pode importar planilhas ou cadastrar rapidamente pelo botão "+ Adicionar Empresa".',
    },
    {
      stepNumber: 3,
      badge: 'Execução Rápida',
      title: 'Fila de Prospecção Diária',
      subtitle: 'Execute seus contatos um a um com máxima velocidade',
      icon: <Flame className="w-6 h-6 text-amber-500" />,
      content: [
        'O Modo Prospecção é o coração operacional do Leadion: organiza as ações do dia por prioridade e urgência.',
        'Com 1 clique você abre o WhatsApp com a mensagem personalizada pronta para envio e registra o resultado.',
        'Atalhos de teclado (W: WhatsApp, C: copiar, Enter: concluir) aceleram sua rotina diária.',
      ],
      keyTakeaway: 'Sem distrações: você só precisa focar no contato que está na sua tela agora.',
    },
    {
      stepNumber: 4,
      badge: 'Gestão Visual',
      title: 'Pipeline de Oportunidades',
      subtitle: 'Acompanhe negociações do primeiro contato ao fechamento',
      icon: <Kanban className="w-6 h-6 text-emerald-500" />,
      content: [
        'Visualize oportunidades em estágios claros: Novo, Primeiro Contato, Respondeu, Reunião, Proposta, Negociação e Ganho.',
        'Mova cards facilmente e acompanhe o valor total em aberto no funil.',
        'O Leadion alerta visualmente qualquer oportunidade sem próxima ação agendada.',
      ],
      keyTakeaway: 'Nenhum lead esquecido: cada oportunidade sempre tem uma data e canal definidos.',
    },
    {
      stepNumber: 5,
      badge: 'Scripts Prontos',
      title: 'Mensagens Inteligentes & Modelos',
      subtitle: 'Variáveis dinâmicas para comunicação natural e de alta resposta',
      icon: <MessageSquareText className="w-6 h-6 text-indigo-500" />,
      content: [
        'Acesse modelos testados para Primeiro Contato, Follow-up 1, Follow-up 2, Reativação e Quebra de Objeções.',
        'As variáveis ({{primeiro_nome}}, {{empresa}}, {{nicho}}, {{cidade}}, {{servico}}) são preenchidas instantaneamente.',
        'Crie, edite e organize seus próprios scripts personalizados por nicho ou oferta.',
      ],
      keyTakeaway: 'Mensagens padronizadas com personalização cirúrgica para cada decisor.',
    },
    {
      stepNumber: 6,
      badge: 'Qualificação Comercial',
      title: 'Sales Engine & Lead Scoring',
      subtitle: 'Qualifique leads e quebre objeções com argumentos validados',
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      content: [
        'Avalie o Lead Score (0 a 100) com base no perfil da empresa, presença digital e potencial de fechamento.',
        'Consulte a biblioteca do Sales Engine para contornar objeções comuns ("está caro", "já tenho parceiro", "fale mês que vem").',
      ],
      keyTakeaway: 'Qualifique antes de despender energia e aumente a taxa de conversão das propostas.',
    },
    {
      stepNumber: 7,
      badge: 'Ritmo & Metas',
      title: 'Planejador de Follow-ups & Metas',
      subtitle: 'A fórmula das vendas previsíveis: consistência diária',
      icon: <CalendarCheck className="w-6 h-6 text-sky-500" />,
      content: [
        'Acompanhe lembretes, agendamentos e follow-ups pendentes em um calendário unificado.',
        'Defina sua meta diária de contatos (ex: 15 ações por dia) e acompanhe seu streak de dias consecutivos.',
      ],
      keyTakeaway: 'Prospecção é ritmo. Manter o follow-up em dia é onde mora 80% das vendas.',
    },
    {
      stepNumber: 8,
      badge: 'Segurança & Nuvem',
      title: 'Segurança, Sincronização & Modo Offline',
      subtitle: 'Seus dados 100% preservados, seguros e sempre disponíveis',
      icon: <HardDrive className="w-6 h-6 text-emerald-500" />,
      content: [
        'O Leadion funciona com arquitetura offline-first (IndexedDB): seus dados são salvos localmente mesmo sem internet.',
        'Ao conectar sua conta, seus dados sincronizam automaticamente com a nuvem (Supabase).',
        'Agora você está pronto para iniciar sua primeira rodada de prospecção!',
      ],
      keyTakeaway: 'Comece agora mesmo cadastrando sua primeira empresa ou importando uma lista.',
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('leadion_tutorial_seen', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  const handleAddFirstAndClose = () => {
    handleComplete();
    if (onAddFirstCompany) {
      onAddFirstCompany();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 shrink-0">
              {currentStep.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                {currentStep.badge} • Etapa {currentStep.stepNumber} de {steps.length}
              </span>
              <h2
                id="tutorial-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5"
              >
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar guia"
            aria-label="Fechar guia"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="bg-blue-600 h-1 transition-all duration-300 ease-out"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {currentStep.subtitle}
          </p>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {currentStep.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Destaque / Conclusão do Passo */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5 text-blue-600 dark:text-blue-400">
                Ponto Chave
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-normal">
                {currentStep.keyTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Footer com Navegação */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Indicadores de bolinhas */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-blue-600'
                    : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                title={`Ir para a etapa ${idx + 1}`}
                aria-label={`Ir para a etapa ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="text-slate-500 dark:text-slate-400"
            >
              Pular Guia
            </Button>

            {!isFirstStep && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Voltar
              </Button>
            )}

            {isLastStep ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddFirstAndClose}
                leftIcon={<Building2 className="w-4 h-4" />}
              >
                Adicionar 1ª Empresa
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Avançar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

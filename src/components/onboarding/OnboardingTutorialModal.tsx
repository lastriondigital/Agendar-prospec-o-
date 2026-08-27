import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Flame,
  Kanban,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';

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
      title: 'Bem-vindo ao PROSPECT OS',
      subtitle: 'Sistema operacional pessoal de prospecção rápida e alta conversão',
      icon: <Zap className="w-6 h-6 text-[#3F6FB5]" />,
      content: [
        'O PROSPECT OS foi projetado para eliminar a hesitação e acelerar o ritmo diário das suas abordagens comerciais.',
        'Ao invés de se perder em dezenas de abas, você opera com uma fila diária clara: uma ação por vez, com script pronto e histórico consolidado.',
      ],
      keyTakeaway: 'Foco na execução: menos tempo planejando e mais tempo falando com decisores reais.',
    },
    {
      stepNumber: 2,
      badge: 'Primeiro Passo',
      title: 'Cadastre Empresas e Decisores',
      subtitle: 'Múltiplos contatos por empresa, canais de WhatsApp e histórico',
      icon: <Building2 className="w-6 h-6 text-[#3F6FB5]" />,
      content: [
        'Toda abordagem começa cadastrando uma empresa e seus responsáveis (Sócios, Diretores, Gerentes).',
        'Empresas recém-adicionadas começam como Leads ou Prospects, e só passam para Clientes quando você fechar a proposta.',
        'Nosso sistema previne duplicidades automaticamente por nome, telefone e domínio.',
      ],
      keyTakeaway: 'Dica: Você pode importar planilhas ou cadastrar rapidamente pelo botão "+ Adicionar Empresa".',
    },
    {
      stepNumber: 3,
      badge: 'Foco Total',
      title: 'Modo Prospecção (Fila Diária)',
      subtitle: 'Uma interface limpa para executar contato a contato',
      icon: <Flame className="w-6 h-6 text-amber-500" />,
      content: [
        'O Modo Prospecção é o coração do sistema: ele organiza os contatos do dia por ordem de prioridade e urgência.',
        'Com 1 clique você abre o WhatsApp com mensagem já personalizada, envia o contato e registra o resultado.',
        'Atalhos de teclado (C: copiar, W: WhatsApp, Enter: concluir) aceleram sua rotina.',
      ],
      keyTakeaway: 'Sem distrações: você só precisa focar no contato que está na sua tela agora.',
    },
    {
      stepNumber: 4,
      badge: 'Funil Visual',
      title: 'Pipeline de Oportunidades',
      subtitle: 'Acompanhe cada negociação do primeiro contato ao fechamento',
      icon: <Kanban className="w-6 h-6 text-emerald-500" />,
      content: [
        'Visualize todas as suas oportunidades em colunas organizadas (Novo, Primeiro Contato, Respondeu, Reunião, Proposta, Negociação, Ganho).',
        'Arraste e solte os cards entre os estágios conforme a conversa avança.',
        'O sistema alerta visualmente qualquer oportunidade que esteja sem próxima ação agendada.',
      ],
      keyTakeaway: 'Nenhum lead é esquecido: cada oportunidade sempre tem uma data e canal definidos.',
    },
    {
      stepNumber: 5,
      badge: 'Mensagens Inteligentes',
      title: 'Scripts Base & Modelos Prontos',
      subtitle: 'Variáveis dinâmicas para nunca soar robótico',
      icon: <MessageSquareText className="w-6 h-6 text-indigo-500" />,
      content: [
        'O sistema vem com Scripts Base para Primeiro Contato, Follow-up 1, Follow-up 2, Reativação e Quebra de Objeções.',
        'As variáveis ({{primeiro_nome}}, {{empresa}}, {{nicho}}, {{cidade}}, {{servico}}) são preenchidas automaticamente em tempo real.',
        'Você pode editar, duplicar, testar em A/B e criar quantos scripts desejar.',
      ],
      keyTakeaway: 'Mensagens padronizadas, porém altamente personalizadas para cada nicho.',
    },
    {
      stepNumber: 6,
      badge: 'Vendas & Inteligência',
      title: 'Sales Engine & Lead Scoring',
      subtitle: 'Qualificação de leads e respostas a objeções na ponta dos dedos',
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      content: [
        'Avalie o Score de cada lead (0 a 100) com base no perfil da empresa, presença digital e critérios de qualificação.',
        'Acesse a biblioteca do Sales Engine para contornar objeções comuns ("está caro", "já tenho fornecedor", "fale mês que vem") com argumentos testados.',
      ],
      keyTakeaway: 'Qualifique antes de investir energia e feche negociações com maior margem.',
    },
    {
      stepNumber: 7,
      badge: 'Ritmo & Metas',
      title: 'Consistência Diária & Metas',
      subtitle: 'A fórmula das vendas previsíveis: bater a meta todos os dias',
      icon: <Target className="w-6 h-6 text-rose-500" />,
      content: [
        'Defina sua meta diária de contatos (ex: 15 ações por dia) e acompanhe seu streak de dias consecutivos.',
        'Seus dados ficam 100% seguros no seu dispositivo (IndexedDB) e sincronizam com a nuvem quando você estiver autenticado.',
        'Agora você está pronto para iniciar sua primeira rodada de prospecção!',
      ],
      keyTakeaway: 'Prospecção é ritmo diário. Comece adicionando sua primeira empresa.',
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
      localStorage.setItem('prospect_os_tutorial_seen', 'true');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#ECEEF1] dark:border-[#2D3139] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40">
              {currentStep.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F6FB5] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                {currentStep.badge} • Passo {currentStep.stepNumber} de {steps.length}
              </span>
              <h2
                id="tutorial-title"
                className="text-base sm:text-lg font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5"
              >
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="p-1.5 rounded-lg text-[#80868B] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] transition-colors cursor-pointer"
            title="Pular tutorial"
            aria-label="Pular tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-[#ECEEF1] dark:bg-[#282D36] h-1">
          <div
            className="bg-[#3F6FB5] h-1 transition-all duration-300 ease-out"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
            {currentStep.subtitle}
          </p>

          <div className="space-y-3 text-xs sm:text-sm text-[#202124] dark:text-[#E8EAED] leading-relaxed">
            {currentStep.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Destaque / Conclusão do Passo */}
          <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#202124] dark:text-[#E8EAED] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5 text-[#3F6FB5] dark:text-blue-300">
                Ponto Chave
              </span>
              <p className="text-[#5F6368] dark:text-[#9AA0A6] leading-normal">
                {currentStep.keyTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Footer com Navegação */}
        <div className="p-4 border-t border-[#ECEEF1] dark:border-[#2D3139] bg-[#FAFBFD] dark:bg-[#15171B] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Indicadores de bolinhas */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-[#3F6FB5]'
                    : 'w-1.5 bg-[#DADDE1] dark:bg-[#2D3139] hover:bg-[#80868B]'
                }`}
                title={`Ir para o passo ${idx + 1}`}
                aria-label={`Ir para o passo ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="text-[#5F6368] dark:text-[#9AA0A6]"
            >
              Pular Tutorial
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

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Globe,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  Clock,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';
import { PROBLEMA_IDENTIFICADO_STEPS } from '../../db/whatsappProblemFlowSeed';
import { OPORTUNIDADE_LATENTE_STEPS } from '../../db/whatsappLatentFlowSeed';
import {
  CountryCode,
  CommunicationStyle,
  ProspectingFlowType,
  ScriptStepDefinition,
} from '../../types/scripts';
import { interpolateSmartVariables } from '../../services/scriptEngine';
import { generateWhatsAppLink } from '../../utils/formatting';

interface FlowStepsExplorerProps {
  onScheduleStep?: (step: ScriptStepDefinition, interpolatedText: string) => void;
}

export const FlowStepsExplorer: React.FC<FlowStepsExplorerProps> = ({ onScheduleStep }) => {
  const { success } = useToast();
  const { companies, contacts, services } = useApp();

  const [activeFlow, setActiveFlow] = useState<ProspectingFlowType>('problema_identificado');
  const [selectedStepNumber, setSelectedStepNumber] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('BR');
  const [selectedTone, setSelectedTone] = useState<CommunicationStyle>('consultivo');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeFollowUpIndex, setActiveFollowUpIndex] = useState<number | null>(null);

  // Sample lead data for preview
  const sampleCompany = companies[0] || {
    name: 'Clínica Sorriso Perfeito',
    niche: 'Odontologia & Saúde',
    city: 'São Paulo',
    country: 'Brasil',
    apparentNeed: 'não possui agendamento rápido pelo WhatsApp no site',
  };
  const sampleContact = contacts[0] || {
    name: 'Dr. Lucas Silveira',
    role: 'Diretor Clínico',
    phone: '11987654321',
  };
  const sampleService = services[0] || {
    name: 'Landing Page de Alta Conversão com Agendamento WhatsApp',
    basePrice: 597,
    currency: 'R$',
    deliverables: ['Página rápida', 'Botão WhatsApp', 'Integração Google'],
    benefits: ['mais agendamentos todo mês'],
  };

  const stepsList = activeFlow === 'problema_identificado' ? PROBLEMA_IDENTIFICADO_STEPS : OPORTUNIDADE_LATENTE_STEPS;

  const filteredSteps = useMemo(() => {
    return stepsList.filter((s) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.objective.toLowerCase().includes(q) ||
        s.scriptTemplate.toLowerCase().includes(q) ||
        s.purposeDescription.toLowerCase().includes(q)
      );
    });
  }, [stepsList, searchTerm]);

  const activeStep = stepsList.find((s) => s.stepNumber === selectedStepNumber) || stepsList[0];

  // Derive template based on country and tone
  let baseTemplate = activeStep.scriptTemplate;
  if (selectedCountry !== 'BR' && activeStep.countryVariations && activeStep.countryVariations[selectedCountry]) {
    baseTemplate = activeStep.countryVariations[selectedCountry]!;
  }
  if (selectedTone === 'direto' && activeStep.alternativeTemplates?.direto) {
    baseTemplate = activeStep.alternativeTemplates.direto;
  } else if (selectedTone === 'casual' && activeStep.alternativeTemplates?.casual) {
    baseTemplate = activeStep.alternativeTemplates.casual;
  }

  // If a follow-up is clicked
  if (activeFollowUpIndex !== null && activeStep.followUps?.[activeFollowUpIndex]) {
    baseTemplate = activeStep.followUps[activeFollowUpIndex].message;
  }

  const { text: interpolatedText, variablesMap } = interpolateSmartVariables(baseTemplate, {
    company: sampleCompany,
    contact: sampleContact,
    service: sampleService,
    country: selectedCountry,
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Script copiado com sucesso para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Flow Switcher, Country, and Tone */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        {/* Flow Tabs */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => {
              setActiveFlow('problema_identificado');
              setSelectedStepNumber(1);
              setActiveFollowUpIndex(null);
            }}
            className={`flex-1 lg:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeFlow === 'problema_identificado'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            Fluxo 1: Problema Identificado (23 Etapas)
          </button>

          <button
            onClick={() => {
              setActiveFlow('oportunidade_latente');
              setSelectedStepNumber(1);
              setActiveFollowUpIndex(null);
            }}
            className={`flex-1 lg:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeFlow === 'oportunidade_latente'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Fluxo 2: Oportunidade Latente (16 Etapas)
          </button>
        </div>

        {/* Country & Tone */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
          {/* Tone Selector */}
          <div className="inline-flex rounded-lg p-1 bg-neutral-100 dark:bg-neutral-800 text-xs font-medium">
            <button
              onClick={() => {
                setSelectedTone('consultivo');
                setActiveFollowUpIndex(null);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTone === 'consultivo' && activeFollowUpIndex === null
                  ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Consultivo
            </button>
            <button
              onClick={() => {
                setSelectedTone('direto');
                setActiveFollowUpIndex(null);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTone === 'direto' && activeFollowUpIndex === null
                  ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Direto
            </button>
            <button
              onClick={() => {
                setSelectedTone('casual');
                setActiveFollowUpIndex(null);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTone === 'casual' && activeFollowUpIndex === null
                  ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Casual
            </button>
          </div>

          {/* Country Selector */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value as CountryCode)}
              aria-label="Selecionar país do fluxo"
              className="bg-transparent text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="BR">Brasil (R$)</option>
              <option value="PT">Portugal (€)</option>
              <option value="MZ">Moçambique (MT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Layout: Steps Sidebar + Active Step Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Step List Navigator */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Buscar etapa por nome ou objetivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            />
          </div>

          <div className="max-h-[640px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {filteredSteps.map((step) => {
              const isSelected = selectedStepNumber === step.stepNumber;
              return (
                <div
                  key={step.id}
                  onClick={() => {
                    setSelectedStepNumber(step.stepNumber);
                    setActiveFollowUpIndex(null);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30 shadow-xs'
                      : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                        {step.title.split('—')[1]?.trim() || step.title}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'text-emerald-600 translate-x-0.5' : 'text-neutral-400'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 ml-7">
                    {step.objective}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Step Details & Actions */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-5">
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold">
                    Etapa {activeStep.stepNumber} de {stepsList.length}
                  </span>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    {activeStep.title}
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  {activeStep.purposeDescription}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(interpolatedText)}
                  className="gap-1.5 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar Script'}
                </Button>

                {onScheduleStep && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onScheduleStep(activeStep, interpolatedText)}
                    className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Agendar Mensagem
                  </Button>
                )}
              </div>
            </div>

            {/* Script Text Box (Live Interpolated with Sample Lead) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Texto Personalizado para WhatsApp ({interpolatedText.length} caracteres):
                </span>
                <span className="text-[11px] text-neutral-400">Variáveis calculadas dinamicamente</span>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50 text-sm leading-relaxed text-neutral-800 dark:text-neutral-100 whitespace-pre-line font-normal select-text">
                {interpolatedText}
              </div>
            </div>

            {/* Operational Directives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-950 dark:text-emerald-200">
                <strong className="block font-semibold mb-1">🎯 Objetivo Desta Etapa:</strong>
                <span>{activeStep.objective}</span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-blue-950 dark:text-blue-200">
                <strong className="block font-semibold mb-1">⏱️ Contexto de Aplicação:</strong>
                <span>{activeStep.purposeDescription}</span>
              </div>
            </div>

            {/* 6 Structured Follow-ups Cadence */}
            {activeStep.followUps && activeStep.followUps.length > 0 && (
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    Sequência de Follow-ups Desta Etapa ({activeStep.followUps.length} Cadências)
                  </h4>
                  {activeFollowUpIndex !== null && (
                    <button
                      onClick={() => setActiveFollowUpIndex(null)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      Voltar ao Script Principal
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {activeStep.followUps.map((fu, idx) => {
                    const isSelected = activeFollowUpIndex === idx;
                    return (
                      <div
                        key={fu.number}
                        onClick={() => setActiveFollowUpIndex(idx)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/40 shadow-xs'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            Follow-up #{fu.number}
                          </span>
                          <Badge variant="amber" className="text-[10px]">
                            {fu.intervalRecommended}
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-1">
                          "{fu.message}"
                        </p>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {fu.objective}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

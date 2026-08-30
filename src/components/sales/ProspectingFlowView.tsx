import React, { useState } from 'react';
import {
  GitCommit,
  CheckCircle2,
  Copy,
  Clock,
  Send,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  User,
  Building,
  Target,
  FileText,
  PhoneCall,
  Flame,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { ProspectingType, ScriptStepDefinition } from '../../types/scripts';
import {
  fillScriptVariables,
  getProspectingSteps,
  formatCurrencyValue,
} from '../../services/salesEngine';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const ProspectingFlowView: React.FC = () => {
  const { companies, contacts, leads, services } = useApp();
  const { success, info } = useToast();

  const [flowType, setFlowType] = useState<ProspectingType>('identified_problem');
  const [selectedStepNumber, setSelectedStepNumber] = useState<number>(1);
  const [selectedStyle, setSelectedStyle] = useState<'consultivo' | 'direto' | 'casual' | 'formal'>('consultivo');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');
  const [selectedFollowUpIdx, setSelectedFollowUpIdx] = useState<number>(0);
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  const steps = getProspectingSteps(flowType);
  const currentStep = steps.find((s) => s.stepNumber === selectedStepNumber) || steps[0];

  // Lead / Company Context
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];
  const selectedContact = contacts.find((c) => c.companyId === selectedCompany?.id);
  const selectedLead = leads.find((l) => l.companyId === selectedCompany?.id);
  const selectedService = services.find((s) => s.id === selectedLead?.serviceId) || services[0];

  const variableData = {
    nome: selectedContact?.name || selectedCompany?.name || 'Gestor(a)',
    empresa: selectedCompany?.name || 'sua empresa',
    niche: selectedCompany?.niche || 'seu segmento',
    servico: selectedService?.name || 'Landing Page de Alta Conversão',
    problema: selectedCompany?.apparentNeed || 'perda de contatos no WhatsApp',
    preco: selectedService?.basePrice ? formatCurrencyValue(selectedService.basePrice, selectedService.currency || 'BRL') : 'R$ 1.500,00',
    preco_ancora: selectedService?.basePrice ? formatCurrencyValue(selectedService.basePrice * 1.6, selectedService.currency || 'BRL') : 'R$ 2.400,00',
    cidade: selectedCompany?.city || 'sua região',
    dias_sem_resposta: 2,
    dia_semana: 'quinta-feira',
  };

  // Raw script & filled script
  const rawScript =
    currentStep.variationsByStyle?.[selectedStyle] || currentStep.defaultScript;
  const renderedScript = fillScriptVariables(rawScript, variableData);

  const phases = Array.from(new Set(steps.map((s) => s.phase)));
  const filteredSteps = steps.filter((s) => phaseFilter === 'all' || s.phase === phaseFilter);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    success(`${label} copiado para a área de transferência!`);
  };

  const handleSendWhatsApp = (text: string) => {
    const phone = selectedContact?.whatsapp || selectedContact?.phone || selectedCompany?.companyWhatsApp || selectedCompany?.companyPhone;
    if (!phone) {
      info('Nenhum telefone cadastrado para este contato. Copiando texto.');
      handleCopy(text, 'Texto');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header com seleção de Fluxo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Fluxo de Prospecção & Qualificação Estruturado
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Escolha a rota de abordagem de acordo com a maturidade e necessidade do cliente:
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setFlowType('identified_problem');
                setSelectedStepNumber(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                flowType === 'identified_problem'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              1. Problema Identificado (23 Etapas)
            </button>
            <button
              onClick={() => {
                setFlowType('latent_opportunity');
                setSelectedStepNumber(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                flowType === 'latent_opportunity'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              2. Oportunidade Latente / App / SaaS (16 Etapas)
            </button>
          </div>
        </div>

        {/* Lead Context Selector */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Building className="w-4 h-4 text-slate-500" />
            <span>Simular variáveis com os dados do lead:</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none text-xs font-medium"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.niche || 'Sem nicho'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <User className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-medium">
              Contato: {variableData.nome}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">
              Serviço: {variableData.servico} ({variableData.preco})
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Steps Sidebar + Right Step Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Stages Timeline / Navigation (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
              Etapas ({steps.length})
            </div>

            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3 h-3 text-slate-500" />
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-0.5 text-[11px] focus:outline-none"
              >
                <option value="all">Todas as Fases</option>
                {phases.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1 no-scrollbar">
            {filteredSteps.map((step) => {
              const isSelected = step.stepNumber === selectedStepNumber;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setSelectedStepNumber(step.stepNumber);
                    setSelectedFollowUpIdx(0);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition border flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {step.stepNumber}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                        {step.stepName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {step.phase} • {step.followUps?.length || 0} follow-ups
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition ${
                      isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Step Cockpit (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Step Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-sm">
                  {currentStep.stepNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
                      {currentStep.code}
                    </span>
                    <Badge variant="blue" size="sm">
                      FASE: {currentStep.phase}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {currentStep.stepName}
                  </h3>
                </div>
              </div>

              {/* Variations Style Selector */}
              {currentStep.variationsByStyle && (
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['consultivo', 'direto', 'casual', 'formal'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStyle(st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition ${
                        selectedStyle === st
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Objective & Structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5 text-indigo-400">
                  <Target className="w-3.5 h-3.5" />
                  Objetivo Central
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {currentStep.objective}
                </p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5 text-cyan-400">
                  <FileText className="w-3.5 h-3.5" />
                  Estrutura Recomendada
                </div>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                  {currentStep.structure}
                </p>
              </div>
            </div>

            {/* Script Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Script de Mensagem (Pronto para Envio)
                </span>
                <span className="text-[11px] text-slate-400">
                  Variáveis substituídas automaticamente
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm leading-relaxed font-sans relative group">
                <p className="whitespace-pre-wrap">{renderedScript}</p>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(renderedScript, 'Roteiro')}
                    className="text-xs"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    Copiar Roteiro
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSendWhatsApp(renderedScript)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Enviar pelo WhatsApp
                  </Button>
                </div>
              </div>
            </div>

            {/* Diagnostic Questions (if present) */}
            {currentStep.diagnosticQuestions && currentStep.diagnosticQuestions.length > 0 && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Perguntas de Diagnóstico & Investigação
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {currentStep.diagnosticQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-cyan-400 font-bold">?</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rule Box */}
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-amber-200">
                  Regra Mandatória desta Etapa:
                </div>
                <p className="text-amber-300/90 leading-relaxed">
                  {currentStep.requiresClientResponse
                    ? 'Avançar para a próxima etapa APENAS se o cliente responder positivamente. Se houver silêncio, execute a sequência de Follow-up abaixo respeitando os intervalos de tempo.'
                    : 'Esta mensagem pode ser enviada como continuidade de alinhamento.'}
                </p>
              </div>
            </div>
          </div>

          {/* Follow-up Sequences Card (6 a 8 follow-ups) */}
          {currentStep.followUps && currentStep.followUps.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">
                    Sequência Completa de Follow-ups ({currentStep.followUps.length} disparos cronometrados)
                  </h4>
                </div>
                <span className="text-xs text-slate-400">
                  Intervalo inteligente de 4h a 14 dias
                </span>
              </div>

              {/* Follow-up tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {currentStep.followUps.map((fu, idx) => (
                  <button
                    key={fu.id}
                    onClick={() => setSelectedFollowUpIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      selectedFollowUpIdx === idx
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>FU {fu.stepNumber}</span>
                    <span className="text-[10px] opacity-80">({fu.intervalText})</span>
                  </button>
                ))}
              </div>

              {/* Active Follow-up Detail */}
              {(() => {
                const activeFu = currentStep.followUps[selectedFollowUpIdx] || currentStep.followUps[0];
                const renderedFuMessage = fillScriptVariables(activeFu.message, variableData);
                return (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="purple" size="sm">
                          {activeFu.intervalText} após mensagem anterior
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          Tom: {activeFu.tone}
                        </Badge>
                      </div>
                      <span className="text-slate-400 italic">
                        {activeFu.objective}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg text-slate-200 text-sm whitespace-pre-wrap">
                      {renderedFuMessage}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      <div className="text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2 rounded">
                        <strong>Condição de Envio:</strong> {activeFu.condition}
                      </div>
                      <div className="text-rose-400 bg-rose-950/20 border border-rose-500/20 p-2 rounded">
                        <strong>Quando NÃO Usar:</strong> {activeFu.whenNotToUse}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(renderedFuMessage, `Follow-up ${activeFu.stepNumber}`)}
                        className="text-xs"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copiar Follow-up
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSendWhatsApp(renderedFuMessage)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Disparar no WhatsApp
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Edit3,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  Briefcase,
  AlertCircle,
  Award,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Company, Contact, Lead, SalesApproachRecommendation } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateApproachRecommendation, formatCurrencyValue } from '../../services/salesEngine';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';

interface ApproachRecommendationCardProps {
  company: Company;
  contact?: Contact | null;
  lead?: Lead | null;
  onApplyMessage?: (message: string) => void;
  onExecuteNextAction?: (actionText: string) => void;
  className?: string;
}

export const ApproachRecommendationCard: React.FC<ApproachRecommendationCardProps> = ({
  company,
  contact,
  lead,
  onApplyMessage,
  className = '',
}) => {
  const {
    services,
    objections,
    proofs,
    pricing,
    arguments: argsList,
    painPoints,
    ctas,
    logInteractionAndAdvance,
  } = useApp();
  const { success, info } = useToast();

  const [recommendation, setRecommendation] = useState<SalesApproachRecommendation>(() =>
    generateApproachRecommendation({
      company,
      contact,
      lead,
      availableServices: services,
      availableObjections: objections,
      availableProofs: proofs,
      availablePricing: pricing,
      availableArguments: argsList,
      availablePainPoints: painPoints,
      availableCtas: ctas,
    })
  );

  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showObjectionHelper, setShowObjectionHelper] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Recalculate recommendation when lead or company changes
  useEffect(() => {
    const rec = generateApproachRecommendation({
      company,
      contact,
      lead,
      availableServices: services,
      availableObjections: objections,
      availableProofs: proofs,
      availablePricing: pricing,
      availableArguments: argsList,
      availablePainPoints: painPoints,
      availableCtas: ctas,
    });
    setRecommendation(rec);
    setEditedMessage(rec.message);
  }, [company, contact, lead, services, objections, proofs, pricing, argsList, painPoints, ctas]);

  const handleCopyMessage = () => {
    const textToCopy = isEditingMessage ? editedMessage : recommendation.message;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    success('Mensagem copiada para a área de transferência!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const phone = contact?.whatsapp || contact?.phone;
    if (!phone) {
      info('Telefone não encontrado', 'Cadastre o WhatsApp do contato para envio direto.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const textToSend = isEditingMessage ? editedMessage : recommendation.message;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');

    // Registrar no histórico
    logInteractionAndAdvance({
      companyId: company.id,
      contactId: contact?.id,
      leadId: lead?.id,
      channel: 'whatsapp',
      messageSent: textToSend,
      notes: `Abordagem enviada: ${recommendation.serviceName}`,
    });
  };

  const handleServiceChange = (serviceId: string) => {
    const targetService = services.find((s) => s.id === serviceId);
    const updatedRec = generateApproachRecommendation({
      company,
      contact,
      lead,
      service: targetService,
      availableServices: services,
      availableObjections: objections,
      availableProofs: proofs,
      availablePricing: pricing,
      availableArguments: argsList,
      availablePainPoints: painPoints,
      availableCtas: ctas,
    });
    setRecommendation(updatedRec);
    setEditedMessage(updatedRec.message);
  };

  const handleInsertObjectionCounter = (objectionId: string) => {
    const obj = objections.find((o) => o.id === objectionId);
    if (!obj) return;

    const counterText = `\n\n[RESPOSTA À OBJEÇÃO: ${obj.name}]\n"${obj.response}"`;
    const updated = (isEditingMessage ? editedMessage : recommendation.message) + counterText;
    setEditedMessage(updated);
    setRecommendation((prev) => ({ ...prev, message: updated }));
    setIsEditingMessage(true);
    success(`Argumento de superação para "${obj.name}" inserido!`);
  };

  return (
    <div
      id={`approach-rec-${company.id}`}
      className={`bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-sm ${className}`}
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-base">Recomendação de Abordagem</h3>
              <Badge variant="purple" size="sm">
                Sales Engine
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Estratégia personalizada para <span className="text-slate-200 font-medium">{company.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="text-xs text-slate-300 hover:text-white"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            {isCustomizing ? 'Fechar Ajustes' : 'Personalizar Abordagem'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const rec = generateApproachRecommendation({
                company,
                contact,
                lead,
                availableServices: services,
                availableObjections: objections,
                availableProofs: proofs,
                availablePricing: pricing,
                availableArguments: argsList,
                availablePainPoints: painPoints,
                availableCtas: ctas,
              });
              setRecommendation(rec);
              setEditedMessage(rec.message);
              info('Abordagem recalculada com novos parâmetros.');
            }}
            title="Recalcular com base na biblioteca"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Customization Drawer / Controls */}
      {isCustomizing && (
        <div className="my-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3 animate-fadeIn">
          <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            Ajustar Parâmetros da Recomendação
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Serviço Alvo:</label>
              <select
                value={recommendation.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">CTA Recomendada:</label>
              <select
                onChange={(e) => {
                  const targetCta = ctas.find((c) => c.id === e.target.value);
                  if (targetCta) {
                    setRecommendation((prev) => ({
                      ...prev,
                      cta: targetCta.ctaText.replace(/\[Empresa\]/g, company.name).replace(/\[Nome\]/g, contact?.name || 'Gestor'),
                    }));
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {ctas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.funnelStage})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 7 Pilares da Recomendação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
        {/* 1. SERVIÇO RECOMENDADO */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 mt-0.5">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              1. Serviço Recomendado
            </div>
            <div className="text-sm font-semibold text-slate-100 mt-0.5 truncate">
              {recommendation.serviceName}
            </div>
            {recommendation.pricingItem && (
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className="text-emerald-400 font-medium">
                  {formatCurrencyValue(recommendation.pricingItem.regularPrice, recommendation.pricingItem.currency)}
                </span>
                {recommendation.pricingItem.anchorPrice && (
                  <span className="text-slate-500 line-through">
                    {formatCurrencyValue(recommendation.pricingItem.anchorPrice, recommendation.pricingItem.currency)}
                  </span>
                )}
                <span className="text-slate-500 text-[10px]">(Sem desconto auto)</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. PROBLEMA IDENTIFICADO */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              2. Problema Identificado
            </div>
            <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {recommendation.identifiedProblem}
            </div>
          </div>
        </div>

        {/* 3. ARGUMENTO DE VALOR */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              3. Argumento Central
            </div>
            <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {recommendation.argument}
            </div>
          </div>
        </div>

        {/* 4. PROVA RECOMENDADA */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 mt-0.5">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              4. Prova Social / Case
            </div>
            <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {recommendation.recommendedProof}
            </div>
            {recommendation.proofItem?.beforeAfter && (
              <div className="text-[10px] text-emerald-400/90 mt-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 inline-block">
                ⚡ Antes: {recommendation.proofItem.beforeAfter.beforeText || '—'} ➔ Depois: {recommendation.proofItem.beforeAfter.afterText || '—'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. MENSAGEM PREPARADA */}
      <div className="mt-4 p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              5. Mensagem Pronta para Envio
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (isEditingMessage) {
                  setRecommendation((prev) => ({ ...prev, message: editedMessage }));
                  setIsEditingMessage(false);
                  success('Mensagem salva!');
                } else {
                  setIsEditingMessage(true);
                }
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              {isEditingMessage ? 'Concluir Edição' : 'Editar'}
            </button>
            <button
              onClick={handleCopyMessage}
              className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {isCopied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {isEditingMessage ? (
          <textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            rows={6}
            className="w-full bg-slate-900 border border-indigo-500/50 rounded-lg p-2.5 text-xs text-slate-100 leading-relaxed focus:outline-none font-mono"
            placeholder="Edite o script antes de enviar..."
          />
        ) : (
          <div className="p-3 bg-slate-900/90 rounded-lg text-xs text-slate-200 leading-relaxed whitespace-pre-line border border-slate-800 font-sans">
            {recommendation.message}
          </div>
        )}

        {/* 6. CTA & 7. PRÓXIMA AÇÃO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              6. CTA Sugerida
            </span>
            <p className="text-xs text-slate-300 italic">"{recommendation.cta}"</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              7. Próxima Ação
            </span>
            <p className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {recommendation.nextAction}
            </p>
          </div>
        </div>
      </div>

      {/* Objeções Rápidas (Cheat-Sheet) */}
      <div className="mt-3.5">
        <button
          type="button"
          onClick={() => setShowObjectionHelper(!showObjectionHelper)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 p-2 bg-slate-950/40 rounded-lg border border-slate-800/60 transition"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Biblioteca de Objeções: O prospect colocou um obstáculo?</span>
          </div>
          {showObjectionHelper ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showObjectionHelper && (
          <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 animate-fadeIn">
            <div className="text-xs text-slate-300 font-medium mb-1">
              Selecione a objeção para carregar a resposta estratégica:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {objections.map((obj) => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => handleInsertObjectionCounter(obj.id)}
                  className="p-1.5 text-left text-[11px] rounded bg-slate-900 hover:bg-indigo-950/60 hover:border-indigo-500/50 border border-slate-800 text-slate-300 hover:text-indigo-200 transition truncate"
                  title={`${obj.name}: ${obj.response}`}
                >
                  ⚠️ {obj.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2">
          {onApplyMessage && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApplyMessage(isEditingMessage ? editedMessage : recommendation.message)}
            >
              Usar no Copiloto
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyMessage}
            className="text-xs"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            Copiar Script
          </Button>

          <Button
            size="sm"
            onClick={handleSendWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Enviar no WhatsApp & Registrar
          </Button>
        </div>
      </div>
    </div>
  );
};

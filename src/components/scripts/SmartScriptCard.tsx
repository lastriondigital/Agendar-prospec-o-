import React, { useState } from 'react';
import {
  MessageCircle,
  Copy,
  Check,
  Send,
  AlertOctagon,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';
import {
  CountryCode,
  CommunicationStyle,
  FollowUpItem,
  ScriptRecommendationResult,
} from '../../types/scripts';

interface SmartScriptCardProps {
  recommendation: ScriptRecommendationResult;
  onSendWhatsApp?: (text: string) => void;
  onSchedule?: (text: string) => void;
  onMarkDnc?: () => void;
  onSelectTone?: (tone: CommunicationStyle) => void;
  onSelectCountry?: (country: CountryCode) => void;
}

export const SmartScriptCard: React.FC<SmartScriptCardProps> = ({
  recommendation,
  onSendWhatsApp,
  onSchedule,
  onMarkDnc,
  onSelectTone,
  onSelectCountry,
}) => {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState<CommunicationStyle>('consultivo');
  const [customText, setCustomText] = useState(recommendation.message);
  const [isEditing, setIsEditing] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [activeFollowUpIndex, setActiveFollowUpIndex] = useState(recommendation.currentFollowUpIndex);

  // Sync customText when recommendation changes
  React.useEffect(() => {
    setCustomText(recommendation.message);
    setActiveFollowUpIndex(recommendation.currentFollowUpIndex);
  }, [recommendation.message, recommendation.currentFollowUpIndex]);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    success('Script copiado com sucesso para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToneChange = (tone: CommunicationStyle) => {
    setSelectedTone(tone);
    if (tone === 'consultivo') setCustomText(recommendation.alternatives.consultivo || recommendation.message);
    else if (tone === 'direto') setCustomText(recommendation.alternatives.direto || recommendation.message);
    else if (tone === 'casual') setCustomText(recommendation.alternatives.casual || recommendation.message);
    onSelectTone?.(tone);
  };

  const handleSelectFollowUp = (fu: FollowUpItem, idx: number) => {
    setActiveFollowUpIndex(idx);
    setCustomText(fu.message);
  };

  if (recommendation.isDnc) {
    return (
      <Card className="border-rose-500/30 bg-rose-500/5 p-5 text-rose-900 dark:text-rose-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              {recommendation.stepTitle}
              <Badge variant="rose">DNC Ativo</Badge>
            </h3>
            <p className="text-sm opacity-90">{recommendation.rationale}</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              Por conformidade com as diretrizes de prospecção, nenhum contato adicional deve ser realizado com este prospect.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="space-y-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs">
              {recommendation.stepNumber > 0 ? recommendation.stepNumber : '★'}
            </span>
            <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
              {recommendation.stepTitle}
            </h3>
            {recommendation.isFollowUp && (
              <Badge variant="amber" className="text-xs font-semibold">
                Follow-up #{recommendation.currentFollowUpIndex + 1}
              </Badge>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {recommendation.rationale}
          </p>
        </div>

        {/* Tone and Country Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg p-1 bg-neutral-100 dark:bg-neutral-800 text-xs font-medium">
            <button
              onClick={() => handleToneChange('consultivo')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTone === 'consultivo'
                  ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Consultivo
            </button>
            <button
              onClick={() => handleToneChange('direto')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTone === 'direto'
                  ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Direto
            </button>
            <button
              onClick={() => handleToneChange('casual')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTone === 'casual'
                  ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Casual
            </button>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={recommendation.country}
              onChange={(e) => onSelectCountry?.(e.target.value as CountryCode)}
              aria-label="Selecionar país do script"
              className="bg-transparent text-xs font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="BR">Brasil (R$)</option>
              <option value="PT">Portugal (€)</option>
              <option value="MZ">Moçambique (MT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Script Content Area */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="relative">
          {isEditing ? (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={5}
              className="w-full p-3 rounded-lg border border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/20 text-sm font-normal text-neutral-800 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          ) : (
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-line select-text">
              {customText}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
            <span>{customText.length} caracteres • Pronto para WhatsApp</span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              {isEditing ? 'Concluir edição' : 'Editar texto antes de enviar'}
            </button>
          </div>
        </div>

        {/* Pricing Anchor Insight (if applicable) */}
        {recommendation.pricingAnchor && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Ancoragem de Preço:</strong> Âncora {recommendation.pricingAnchor.currency} {recommendation.pricingAnchor.anchorPrice.toLocaleString('pt-BR')} vs Proposta Especial {recommendation.pricingAnchor.currency} {recommendation.pricingAnchor.regularPrice.toLocaleString('pt-BR')}
              </span>
            </div>
            <Badge variant="amber" className="text-[10px]">Estratégia</Badge>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {recommendation.whatsappUrl ? (
              <a
                href={recommendation.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onSendWhatsApp?.(customText)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-sm font-semibold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Abrir no WhatsApp
              </a>
            ) : (
              <Button
                variant="primary"
                onClick={() => onSendWhatsApp?.(customText)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Send className="w-4 h-4" />
                Enviar Mensagem
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => handleCopy(customText)}
              className="gap-2 text-xs sm:text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Script'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {recommendation.followUps && recommendation.followUps.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFollowUps(!showFollowUps)}
                className="text-xs text-neutral-600 dark:text-neutral-400 gap-1"
              >
                <Clock className="w-3.5 h-3.5" />
                {showFollowUps ? 'Ocultar Follow-ups' : `Ver ${recommendation.followUps.length} Follow-ups`}
                {showFollowUps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkDnc}
              className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              Marcar DNC
            </Button>
          </div>
        </div>

        {/* Expandable Follow-up Sequence */}
        {showFollowUps && recommendation.followUps && (
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Sequência Completa de Follow-ups ({recommendation.followUps.length} Etapas)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {recommendation.followUps.map((fu, idx) => (
                <div
                  key={fu.number}
                  onClick={() => handleSelectFollowUp(fu, idx)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    activeFollowUpIndex === idx
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/30 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Follow-up #{fu.number}
                    </span>
                    <Badge variant="neutral" className="text-[10px]">
                      {fu.intervalRecommended}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-1.5">
                    {fu.message}
                  </p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {fu.objective}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

import React, { useState } from 'react';
import {
  Clock,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { CONTEXTUAL_FOLLOWUP_SCENARIOS } from '../../db/whatsappContextFollowUpsSeed';
import { ContextualFollowUpScenario } from '../../types/scripts';

export const ContextFollowUpsMatrix: React.FC = () => {
  const { success } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredScenarios = CONTEXTUAL_FOLLOWUP_SCENARIOS.filter((scen) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      scen.title.toLowerCase().includes(q) ||
      scen.description.toLowerCase().includes(q) ||
      scen.followUps.some((f) => f.message.toLowerCase().includes(q) || f.objective.toLowerCase().includes(q))
    );
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    success('Mensagem de follow-up copiada com sucesso!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar por cenário de follow-up (ex: 'orçamento enviado', 'vou pensar', 'sumiu')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm"
          />
        </div>
      </div>

      {/* Grid of 14 Scenarios */}
      <div className="space-y-4">
        {filteredScenarios.map((scen) => {
          const isExpanded = expandedScenarioId === scen.id;

          return (
            <Card
              key={scen.id}
              className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs hover:border-emerald-500/40 transition-all"
            >
              {/* Header */}
              <div
                onClick={() => setExpandedScenarioId(isExpanded ? null : scen.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer bg-neutral-50/40 dark:bg-neutral-900/40 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold">
                      Cenário {scen.number}
                    </span>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                      {scen.title}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {scen.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="neutral" className="text-xs">
                    6 Cadências
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
              </div>

              {/* Follow-ups Grid (Shown when expanded) */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {scen.followUps.map((fu) => {
                      const key = `${scen.id}-${fu.number}`;
                      const isCopied = copiedKey === key;

                      return (
                        <div
                          key={fu.number}
                          className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-col justify-between space-y-2.5"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                Follow-up #{fu.number}
                              </span>
                              <Badge variant="amber" className="text-[10px] font-semibold">
                                {fu.intervalRecommended}
                              </Badge>
                            </div>

                            <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal whitespace-pre-line">
                              "{fu.message}"
                            </p>
                          </div>

                          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate">
                              {fu.objective}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(fu.message, key)}
                              className="text-[10px] h-7 px-2 gap-1 shrink-0"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              {isCopied ? 'Copiado' : 'Copiar'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

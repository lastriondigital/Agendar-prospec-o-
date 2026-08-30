import React, { useState, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  HelpCircle,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
  Layers,
  Clock,
  ArrowRight,
  ShieldX,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { COMPREHENSIVE_OBJECTIONS } from '../../db/whatsappObjectionsSeed';
import { ObjectionComprehensive, ObjectionCategory } from '../../types/scripts';
import { generateWhatsAppLink } from '../../utils/formatting';

interface ObjectionsExplorerProps {
  onSelectObjectionForScript?: (objection: ObjectionComprehensive) => void;
  targetPhone?: string;
}

export const ObjectionsExplorer: React.FC<ObjectionsExplorerProps> = ({
  onSelectObjectionForScript,
  targetPhone,
}) => {
  const { success } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedObjectionId, setExpandedObjectionId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<Record<string, 'whatsapp' | 'consultive' | 'short' | 'call'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: { label: string; value: string; count: number }[] = useMemo(() => {
    const counts: Record<string, number> = {};
    COMPREHENSIVE_OBJECTIONS.forEach((obj) => {
      counts[obj.category] = (counts[obj.category] || 0) + 1;
    });

    const list = [
      { label: 'Todas as Objeções', value: 'all', count: COMPREHENSIVE_OBJECTIONS.length },
      { label: 'Preço & Orçamento', value: 'preco', count: counts['preco'] || 0 },
      { label: 'Momento & Prioridade', value: 'timing', count: counts['timing'] || 0 },
      { label: 'Confiança & Prova Social', value: 'confianca', count: counts['confianca'] || 0 },
      { label: 'Necessidade & Conscientização', value: 'necessidade', count: counts['necessidade'] || 0 },
      { label: 'Autoridade & Decisor', value: 'autoridade', count: counts['autoridade'] || 0 },
      { label: 'Concorrência / Já Tem Solução', value: 'concorrencia', count: counts['concorrencia'] || 0 },
      { label: 'Complexidade & Tecnologia', value: 'complexidade', count: counts['complexidade'] || 0 },
      { label: 'Experiência Negativa Passada', value: 'experiencia_passada', count: counts['experiencia_passada'] || 0 },
      { label: 'Canal & Formato de Contato', value: 'canal', count: counts['canal'] || 0 },
      { label: 'Desinteresse / Ceticismo', value: 'desinteresse', count: counts['desinteresse'] || 0 },
    ];

    return list;
  }, []);

  const filteredObjections = useMemo(() => {
    return COMPREHENSIVE_OBJECTIONS.filter((obj) => {
      if (selectedCategory !== 'all' && obj.category !== selectedCategory) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          obj.title.toLowerCase().includes(q) ||
          obj.clientPhrase.toLowerCase().includes(q) ||
          obj.underlyingMeaning.toLowerCase().includes(q) ||
          obj.diagnosticQuestion.toLowerCase().includes(q) ||
          obj.whatsappResponse.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchTerm, selectedCategory]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Resposta copiada para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActiveFormatText = (obj: ObjectionComprehensive): string => {
    const fmt = selectedFormat[obj.id] || 'whatsapp';
    switch (fmt) {
      case 'consultive':
        return obj.consultativeResponse;
      case 'short':
        return obj.shortResponse;
      case 'call':
        return obj.callResponse;
      case 'whatsapp':
      default:
        return obj.whatsappResponse;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar por objeção (ex: 'tá caro', 'já temos agência', 'manda por email')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filtrar categoria de objeção"
            className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label} ({c.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.slice(0, 6).map((c) => (
          <button
            key={c.value}
            onClick={() => setSelectedCategory(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === c.value
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {c.label} <span className="opacity-70 text-[10px]">({c.count})</span>
          </button>
        ))}
      </div>

      {/* Objections List */}
      <div className="space-y-4">
        {filteredObjections.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl">
            <AlertTriangle className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Nenhuma objeção encontrada para os filtros selecionados.
            </p>
          </div>
        ) : (
          filteredObjections.map((obj) => {
            const isExpanded = expandedObjectionId === obj.id;
            const currentFormat = selectedFormat[obj.id] || 'whatsapp';
            const responseText = getActiveFormatText(obj);

            return (
              <Card
                key={obj.id}
                className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs hover:border-emerald-500/40 transition-all"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold">
                        #{obj.number}
                      </span>
                      <h3 className="font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                        {obj.title}
                      </h3>
                      <Badge variant="neutral" className="text-[10px] capitalize">
                        {obj.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        O que o prospect diz:
                      </span>
                      <span className="italic font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                        "{obj.clientPhrase}"
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedObjectionId(isExpanded ? null : obj.id)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 gap-1 font-semibold"
                    >
                      {isExpanded ? 'Recolher Detalhes' : 'Ver Matriz Completa'}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Primary Response Box */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Meaning and What NOT to say alert */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-blue-900 dark:text-blue-200">
                      <strong className="block font-semibold mb-1 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        O Que Realmente Significa (Diagnóstico Psicológico):
                      </strong>
                      <span>{obj.underlyingMeaning}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
                      <strong className="block font-semibold mb-1 flex items-center gap-1.5">
                        <ShieldX className="w-3.5 h-3.5 text-rose-600" />
                        O Que NUNCA Dizer (Erro Fatal):
                      </strong>
                      <span>{obj.whatNotToSay}</span>
                    </div>
                  </div>

                  {/* Diagnostic Question */}
                  <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 text-xs">
                    <strong className="block font-semibold mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Pergunta Diagnóstica Recomendada:
                    </strong>
                    <span className="italic font-serif text-sm">"{obj.diagnosticQuestion}"</span>
                  </div>

                  {/* Format Selector */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
                    <div className="inline-flex rounded-lg p-1 bg-neutral-100 dark:bg-neutral-800 text-xs font-medium">
                      <button
                        onClick={() => setSelectedFormat({ ...selectedFormat, [obj.id]: 'whatsapp' })}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          currentFormat === 'whatsapp'
                            ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => setSelectedFormat({ ...selectedFormat, [obj.id]: 'consultive' })}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          currentFormat === 'consultive'
                            ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        Consultiva
                      </button>
                      <button
                        onClick={() => setSelectedFormat({ ...selectedFormat, [obj.id]: 'short' })}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          currentFormat === 'short'
                            ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        Curta / Direta
                      </button>
                      <button
                        onClick={() => setSelectedFormat({ ...selectedFormat, [obj.id]: 'call' })}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          currentFormat === 'call'
                            ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        Ligação / Áudio
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(responseText, obj.id)}
                        className="text-xs gap-1.5"
                      >
                        {copiedId === obj.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === obj.id ? 'Copiado!' : 'Copiar Resposta'}
                      </Button>

                      {targetPhone && (
                        <a
                          href={generateWhatsAppLink(targetPhone, responseText)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Enviar WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Render Selected Script Text */}
                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 text-xs sm:text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-line font-normal">
                    {responseText}
                  </div>

                  {/* Next Step Guidance */}
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                    <span className="flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      <strong>Próximo Passo:</strong> {obj.nextStep}
                    </span>
                    <span>Reengajamento: {obj.followUps.length} follow-ups disponíveis</span>
                  </div>

                  {/* Expanded Follow-up Cadence for Objection */}
                  {isExpanded && obj.followUps && (
                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        Sequência de Follow-ups Específica para Esta Objeção (6 Etapas)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {obj.followUps.map((fu) => (
                          <div
                            key={fu.number}
                            className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                Follow-up #{fu.number}
                              </span>
                              <Badge variant="neutral" className="text-[10px]">
                                {fu.intervalRecommended}
                              </Badge>
                            </div>
                            <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-3">
                              "{fu.message}"
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                {fu.objective}
                              </span>
                              <button
                                onClick={() => handleCopy(fu.message, `${obj.id}-fu-${fu.number}`)}
                                className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-medium flex items-center gap-1"
                              >
                                {copiedId === `${obj.id}-fu-${fu.number}` ? 'Copiado' : 'Copiar'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

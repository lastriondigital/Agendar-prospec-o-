import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Copy,
  Send,
  AlertOctagon,
  HelpCircle,
  MessageSquare,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Tag,
  Building,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { DetailedObjection, FollowUpItem } from '../../types/scripts';
import { DETAILED_OBJECTIONS } from '../../db/objectionsData';
import { fillScriptVariables, formatCurrencyValue } from '../../services/salesEngine';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const DetailedObjectionsBankView: React.FC = () => {
  const { companies, contacts, leads, services } = useApp();
  const { success, info } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedObjectionId, setSelectedObjectionId] = useState<string>(
    DETAILED_OBJECTIONS[0]?.id || ''
  );
  const [responseFormat, setResponseFormat] = useState<'whatsapp' | 'consultive' | 'short' | 'call'>('whatsapp');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');
  const [selectedFuIndex, setSelectedFuIndex] = useState<number>(0);

  // Context Variables
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

  const categories = [
    { id: 'all', label: 'Todas as Categorias' },
    { id: 'preco', label: 'Preço & Orçamento' },
    { id: 'timing', label: 'Timing & Pressa' },
    { id: 'confianca', label: 'Confiança & Garantia' },
    { id: 'concorrencia', label: 'Concorrência & Outros' },
    { id: 'necessidade', label: 'Necessidade & Ceticismo' },
    { id: 'autoridade', label: 'Autoridade & Sócio' },
    { id: 'processo', label: 'Processo & Escopo' },
  ];

  const filteredObjections = DETAILED_OBJECTIONS.filter((obj) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      obj.title.toLowerCase().includes(term) ||
      obj.code.toLowerCase().includes(term) ||
      obj.keywords.some((k) => k.toLowerCase().includes(term)) ||
      obj.shortResponse.toLowerCase().includes(term);
    const matchCategory = categoryFilter === 'all' || obj.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const activeObjection: DetailedObjection =
    DETAILED_OBJECTIONS.find((o) => o.id === selectedObjectionId) ||
    filteredObjections[0] ||
    DETAILED_OBJECTIONS[0];

  const getResponseText = (obj: DetailedObjection) => {
    switch (responseFormat) {
      case 'whatsapp':
        return obj.whatsAppResponse;
      case 'consultive':
        return obj.consultativeResponse;
      case 'short':
        return obj.shortResponse;
      case 'call':
        return obj.callResponse;
      default:
        return obj.whatsAppResponse;
    }
  };

  const renderedResponse = fillScriptVariables(getResponseText(activeObjection), variableData);
  const renderedDiagnosis = fillScriptVariables(activeObjection.diagnosticQuestion, variableData);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    success(`${label} copiado!`);
  };

  const handleSendWhatsApp = (text: string) => {
    const phone = selectedContact?.whatsapp || selectedContact?.phone || selectedCompany?.companyWhatsApp || selectedCompany?.companyPhone;
    if (!phone) {
      info('Telefone não encontrado. Texto copiado!');
      handleCopy(text, 'Resposta');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Banco Estratégico de Objeções Reais (45+ Casos)
              </h2>
              <Badge variant="amber" size="md">
                Diagnóstico + 4 Formatos + 6 Follow-ups
              </Badge>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Respostas estruturadas para neutralizar qualquer trava comercial, aplicando os 3 Cs (Concordar, Redirecionar, Conduzir) sem abaixar o preço no desespero.
            </p>
          </div>

          {/* Lead Context Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
            <Building className="w-4 h-4 text-slate-500" />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1 focus:outline-none text-xs"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.niche || 'Geral'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search and Category Filter */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Digite o que o cliente falou (ex: está caro, não tenho tempo, vou falar com meu sócio, já tenho site)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  categoryFilter === cat.id
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Objections List + Selected Objection Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Objections List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400 font-semibold">
            <span>OBJEÇÕES ENCONTRADAS ({filteredObjections.length})</span>
          </div>

          <div className="space-y-1.5 max-h-[700px] overflow-y-auto pr-1 no-scrollbar">
            {filteredObjections.map((obj, index) => {
              const isSelected = obj.id === activeObjection?.id;
              return (
                <button
                  key={obj.id}
                  onClick={() => {
                    setSelectedObjectionId(obj.id);
                    setSelectedFuIndex(0);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition border flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500/50 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                        {obj.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="capitalize text-slate-500">[{obj.category}]</span>
                      <span>•</span>
                      <span className="line-clamp-1">{obj.keywords.slice(0, 3).join(', ')}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Objection Treatment & Strategies (8 cols) */}
        {activeObjection && (
          <div className="lg:col-span-8 space-y-5">
            {/* Objection Deep-Dive Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="amber" size="sm">
                      {activeObjection.category.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-mono text-slate-400">
                      {activeObjection.code}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {activeObjection.title}
                  </h3>
                </div>

                {/* Format switcher */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setResponseFormat('whatsapp')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                      responseFormat === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </button>
                  <button
                    onClick={() => setResponseFormat('consultive')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                      responseFormat === 'consultive' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" /> Consultiva
                  </button>
                  <button
                    onClick={() => setResponseFormat('short')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                      responseFormat === 'short' ? 'bg-amber-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Curta
                  </button>
                  <button
                    onClick={() => setResponseFormat('call')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                      responseFormat === 'call' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <PhoneCall className="w-3 h-3" /> Call
                  </button>
                </div>
              </div>

              {/* Meaning & What NOT to say */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Significado Oculto / O que o lead pensa
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {activeObjection.possibleMeaning}
                  </p>
                </div>

                <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-500/20">
                  <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    O que NUNCA Falar
                  </div>
                  <p className="text-rose-200/90 leading-relaxed font-medium">
                    {activeObjection.whatNotToSay}
                  </p>
                </div>
              </div>

              {/* Diagnostic Question */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Pergunta de Diagnóstico / Aprofundamento
                </div>
                <p className="text-slate-200 font-medium text-sm">
                  "{renderedDiagnosis}"
                </p>
              </div>

              {/* Response Message Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Resposta Recomendada ({responseFormat.toUpperCase()})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Com os 3 Cs aplicados
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  <p>{renderedResponse}</p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-400">
                      <strong>Próximo Passo:</strong> {activeObjection.nextStep}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(renderedResponse, 'Resposta')}
                        className="text-xs"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copiar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSendWhatsApp(renderedResponse)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Enviar no WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Objection Follow-up Sequence */}
            {activeObjection.followUps && activeObjection.followUps.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">
                      Follow-ups de Reativação Pós-Objeção ({activeObjection.followUps.length} etapas)
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400">
                    Caso o cliente não responda à resposta da objeção
                  </span>
                </div>

                {/* Follow-up Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {activeObjection.followUps.map((fu, idx) => (
                    <button
                      key={fu.id}
                      onClick={() => setSelectedFuIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                        selectedFuIndex === idx
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>FU {fu.stepNumber}</span>
                      <span className="text-[10px] opacity-80">({fu.intervalText})</span>
                    </button>
                  ))}
                </div>

                {/* Active FU Details */}
                {(() => {
                  const currentFu = activeObjection.followUps[selectedFuIndex] || activeObjection.followUps[0];
                  const fuText = fillScriptVariables(currentFu.message, variableData);
                  return (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="amber" size="sm">
                            {currentFu.intervalText} após a objeção
                          </Badge>
                          <Badge variant="neutral" size="sm">
                            Tom: {currentFu.tone}
                          </Badge>
                        </div>
                        <span className="text-slate-400 italic">
                          {currentFu.objective}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg text-slate-200 text-sm whitespace-pre-wrap">
                        {fuText}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(fuText, `Follow-up ${currentFu.stepNumber}`)}
                          className="text-xs"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          Copiar Follow-up
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSendWhatsApp(fuText)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-500"
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          Enviar no WhatsApp
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  MessageCircle,
  Copy,
  Check,
  Globe,
  Sliders,
  AlertTriangle,
  Send,
  RefreshCw,
  Code,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';
import { CountryCode } from '../../types/scripts';
import { interpolateSmartVariables } from '../../services/scriptEngine';
import { generateWhatsAppLink, cleanPhoneNumberDigits } from '../../utils/formatting';

export const ScriptSimulatorTester: React.FC = () => {
  const { success } = useToast();
  const { companies, contacts, services } = useApp();

  // Test parameters state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('BR');
  const [customName, setCustomName] = useState('Dr. Carlos Mendes');
  const [customCompany, setCustomCompany] = useState('Clínica Estética Vital');
  const [customNiche, setCustomNiche] = useState('Dermatologia & Estética');
  const [customCity, setCustomCity] = useState('São Paulo');
  const [customPhone, setCustomPhone] = useState('11987654321');
  const [customProblem, setCustomProblem] = useState('o site demora para carregar e não tem botão de WhatsApp');
  const [customService, setCustomService] = useState('Landing Page de Alta Conversão com Agendamento');
  const [customPrice, setCustomPrice] = useState('597');

  const [rawTemplate, setRawTemplate] = useState<string>(
    'Olá {{primeiro_nome}}, tudo bem?\n\nVi que você lidera a {{empresa}} em {{cidade}}. Analisando seu setor ({{nicho}}), notei que {{problema}}.\n\nPreparamos uma demonstração rápida de {{servico}} por apenas {{preco}} (ancorado de {{preco_ancora}}).\n\nPodemos enviar o link para você avaliar em 1 minuto?'
  );

  const [copied, setCopied] = useState(false);

  // Sync with selected company
  const handleSelectCompany = (compId: string) => {
    setSelectedCompanyId(compId);
    const comp = companies.find((c) => c.id === compId);
    if (comp) {
      setCustomCompany(comp.name);
      setCustomNiche(comp.niche || 'Geral');
      setCustomCity(comp.city || 'São Paulo');
      setCustomPhone(comp.companyPhone || (comp as any).phone || '11987654321');
      if (comp.apparentNeed) setCustomProblem(comp.apparentNeed);

      const contact = contacts.find((c) => c.companyId === comp.id);
      if (contact) {
        setCustomName(contact.name);
        if (contact.phone) setCustomPhone(contact.phone);
      }
    }
  };

  // Interpolation result
  const { text: interpolatedText, variablesMap } = useMemo(() => {
    const mockCompany = {
      name: customCompany,
      niche: customNiche,
      city: customCity,
      phone: customPhone,
      apparentNeed: customProblem,
    };
    const mockContact = {
      name: customName,
      phone: customPhone,
    };
    const mockService = {
      name: customService,
      basePrice: Number(customPrice) || 597,
    };

    return interpolateSmartVariables(rawTemplate, {
      company: mockCompany,
      contact: mockContact,
      service: mockService,
      country: selectedCountry,
    });
  }, [
    rawTemplate,
    customName,
    customCompany,
    customNiche,
    customCity,
    customPhone,
    customProblem,
    customService,
    customPrice,
    selectedCountry,
  ]);

  // Anti-spam & placeholder validation
  const unreplacedVariables = useMemo(() => {
    const matches = interpolatedText.match(/\{\{[^}]+\}\}/g);
    return matches || [];
  }, [interpolatedText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(interpolatedText);
    setCopied(true);
    success('Texto copiado com sucesso para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = generateWhatsAppLink(customPhone, interpolatedText);

  return (
    <div className="space-y-6">
      {/* Configuration & Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Variable Controls */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Configurar Variáveis do Prospect
              </h3>
              <Badge variant="neutral" className="text-[10px]">
                Simulador Dinâmico
              </Badge>
            </div>

            {/* Pick from existing company */}
            {companies.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Carregar Dados de um Prospect Existente:
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => handleSelectCompany(e.target.value)}
                  aria-label="Carregar dados de um prospect existente"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
                >
                  <option value="">Personalizado (Manual)</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.niche || 'Geral'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  País / Moeda
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value as CountryCode)}
                  aria-label="Selecionar país e moeda do prospect"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200"
                >
                  <option value="BR">Brasil (R$)</option>
                  <option value="PT">Portugal (€)</option>
                  <option value="MZ">Moçambique (MT)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  Telefone / WhatsApp
                </label>
                <Input
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Ex: 11987654321"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  Nome do Contato
                </label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  Nome da Empresa
                </label>
                <Input
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  Nicho / Setor
                </label>
                <Input
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  Cidade
                </label>
                <Input
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                Problema Observado ({'{{problema}}'})
              </label>
              <Input
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
                className="text-xs"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Template Editor & Live Preview */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-600" />
                Template com Variáveis
              </h3>
              <span className="text-xs text-neutral-400">
                Suporta todas as 22+ variáveis do motor
              </span>
            </div>

            <textarea
              value={rawTemplate}
              onChange={(e) => setRawTemplate(e.target.value)}
              rows={4}
              aria-label="Template de mensagem com variáveis"
              className="w-full p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 text-xs font-mono text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />

            {/* Validation alert */}
            {unreplacedVariables.length > 0 ? (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Variáveis não preenchidas: <strong>{unreplacedVariables.join(', ')}</strong>
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Todas as variáveis resolvidas com sucesso! Pronto para WhatsApp.</span>
              </div>
            )}

            {/* Live WhatsApp Preview Box */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Resultado Final Interpolado ({interpolatedText.length} caracteres):
                </span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20 text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 whitespace-pre-line select-text">
                {interpolatedText}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar Texto'}
                </Button>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Testar no WhatsApp
                  </a>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Edit2,
  Globe,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CommercialPersonalizationSettings, CountryPersonalizationRule, FormalityLevel, PronounUsage } from '../../types';
import { DEFAULT_COMMERCIAL_SETTINGS, DEFAULT_COUNTRY_RULES } from '../../utils/commercialPersonalization';

export const CommercialPersonalizationPanel: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { success } = useToast();

  const currentCommercial: CommercialPersonalizationSettings =
    settings.commercialPersonalization || DEFAULT_COMMERCIAL_SETTINGS;

  const [defaultCountry, setDefaultCountry] = useState(currentCommercial.defaultCountry || 'Brasil');
  const [defaultCurrency, setDefaultCurrency] = useState(currentCommercial.defaultCurrency || 'BRL');
  const [defaultLanguage, setDefaultLanguage] = useState(currentCommercial.defaultLanguage || 'pt-BR');
  const [defaultFormality, setDefaultFormality] = useState<FormalityLevel>(currentCommercial.defaultFormality || 'consultivo');
  const [defaultTreatment, setDefaultTreatment] = useState<PronounUsage>(currentCommercial.defaultTreatment || 'voce');
  const [strictNoGuessGender, setStrictNoGuessGender] = useState(
    currentCommercial.strictNoGuessGender ?? true
  );
  const [strictNoAutoCurrencyConversion, setStrictNoAutoCurrencyConversion] = useState(
    currentCommercial.strictNoAutoCurrencyConversion ?? true
  );

  const [marketRules, setMarketRules] = useState<CountryPersonalizationRule[]>(
    currentCommercial.marketRules && currentCommercial.marketRules.length > 0
      ? currentCommercial.marketRules
      : DEFAULT_COUNTRY_RULES
  );

  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: CommercialPersonalizationSettings = {
        defaultCountry,
        defaultCurrency,
        defaultLanguage,
        defaultFormality,
        defaultTreatment,
        marketRules,
        globalMarketPrices: currentCommercial.globalMarketPrices || [],
        strictNoGuessGender,
        strictNoAutoCurrencyConversion,
        updatedAt: new Date().toISOString(),
      };

      await updateSettings({ commercialPersonalization: updated });
      success('Configurações de Personalização Comercial salvas!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setDefaultCountry(DEFAULT_COMMERCIAL_SETTINGS.defaultCountry);
    setDefaultCurrency(DEFAULT_COMMERCIAL_SETTINGS.defaultCurrency);
    setDefaultLanguage(DEFAULT_COMMERCIAL_SETTINGS.defaultLanguage);
    setDefaultFormality(DEFAULT_COMMERCIAL_SETTINGS.defaultFormality);
    setDefaultTreatment(DEFAULT_COMMERCIAL_SETTINGS.defaultTreatment);
    setStrictNoGuessGender(true);
    setStrictNoAutoCurrencyConversion(true);
    setMarketRules(DEFAULT_COUNTRY_RULES);
  };

  const handleAddCountryRule = () => {
    const newRule: CountryPersonalizationRule = {
      id: `rule-custom-${Date.now()}`,
      country: 'Novo País',
      countryCode: 'XX',
      defaultCurrency: 'USD',
      currencySymbol: '$',
      defaultLanguage: 'en-US',
      defaultLanguageLabel: 'Inglês Internacional',
      formality: 'consultivo',
      pronoun: 'voce',
      salutations: ['Hello', 'Dear'],
      terms: {
        site: 'website',
        budget: 'proposta',
        phone: 'WhatsApp / Telefone',
        team: 'equipe',
        company: 'empresa',
        pricePhrase: 'o investimento é de',
      },
    };
    setMarketRules([...marketRules, newRule]);
    setEditingRuleIndex(marketRules.length);
  };

  const handleRemoveRule = (index: number) => {
    setMarketRules(marketRules.filter((_, i) => i !== index));
    if (editingRuleIndex === index) setEditingRuleIndex(null);
  };

  const handleUpdateRule = (index: number, updates: Partial<CountryPersonalizationRule>) => {
    setMarketRules(
      marketRules.map((rule, i) => (i === index ? { ...rule, ...updates } : rule))
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Descrição */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#ECEEF1] dark:border-[#2D3139]">
        <div>
          <h2 className="text-base font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#3F6FB5]" />
            Personalização Comercial & Regras por Mercado
          </h2>
          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
            Gerencie regras automáticas de moeda, idioma, termos culturais e nível de formalidade por país.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleResetDefaults}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restaurar Padrões
          </Button>
          <Button
            variant="primary"
            size="xs"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* 2. Hierarquia de Resolução Comercial */}
      <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#3F6FB5] dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Hierarquia Estrita de Resolução Comercial (6 Níveis)
          </h3>
          <span className="text-[11px] font-mono text-[#3F6FB5] dark:text-blue-400">
            Regra Determinística
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-white dark:bg-[#1E2228] border border-blue-200 dark:border-blue-800/40 shadow-2xs">
            <span className="text-[10px] font-bold text-[#3F6FB5] block mb-0.5">1. LEAD</span>
            <span className="text-[11px] text-[#202124] dark:text-[#E8EAED] font-medium">Preço Específico</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-[#1E2228] border border-blue-200 dark:border-blue-800/40 shadow-2xs">
            <span className="text-[10px] font-bold text-[#3F6FB5] block mb-0.5">2. CAMPANHA</span>
            <span className="text-[11px] text-[#202124] dark:text-[#E8EAED] font-medium">Alvo da Ação</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-[#1E2228] border border-blue-200 dark:border-blue-800/40 shadow-2xs">
            <span className="text-[10px] font-bold text-[#3F6FB5] block mb-0.5">3. ICP</span>
            <span className="text-[11px] text-[#202124] dark:text-[#E8EAED] font-medium">Perfil de Cliente</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-[#1E2228] border border-blue-200 dark:border-blue-800/40 shadow-2xs">
            <span className="text-[10px] font-bold text-[#3F6FB5] block mb-0.5">4. SERVIÇO</span>
            <span className="text-[11px] text-[#202124] dark:text-[#E8EAED] font-medium">Tabela por Mercado</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-[#1E2228] border border-blue-200 dark:border-blue-800/40 shadow-2xs">
            <span className="text-[10px] font-bold text-[#3F6FB5] block mb-0.5">5. PAÍS</span>
            <span className="text-[11px] text-[#202124] dark:text-[#E8EAED] font-medium">Regra Nacional</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-[#1E2228] border border-blue-200 dark:border-blue-800/40 shadow-2xs">
            <span className="text-[10px] font-bold text-[#3F6FB5] block mb-0.5">6. GLOBAL</span>
            <span className="text-[11px] text-[#202124] dark:text-[#E8EAED] font-medium">Fallback Padrão</span>
          </div>
        </div>

        <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] pt-1">
          🛡️ <strong>Princípios Fundamentais:</strong> O sistema nunca realiza conversão cambial automática fictícia. Se não houver preço definido para o mercado, a comunicação comercial exibe &ldquo;Configuração não definida&rdquo;. A IA adapta ritmo, naturalidade e vocabulário sem exageros.
        </p>
      </div>

      {/* 3. Padrões Globais */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] space-y-4 shadow-xs">
        <h3 className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
          Configurações Globais Padrão (Nível 6)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED] mb-1">
              País Padrão
            </label>
            <Input
              value={defaultCountry}
              onChange={(e) => setDefaultCountry(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED] mb-1">
              Moeda Global Padrão
            </label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-xs text-[#202124] dark:text-[#E8EAED] focus:border-[#3F6FB5] focus:outline-none"
            >
              <option value="BRL">BRL - Real Brasileiro (R$)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="MZN">MZN - Metical Moçambicano (MT)</option>
              <option value="AOA">AOA - Kwanza Angolano (Kz)</option>
              <option value="CVE">CVE - Escudo Cabo-verdiano ($)</option>
              <option value="USD">USD - Dólar Americano ($)</option>
              <option value="GBP">GBP - Libra Esterlina (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED] mb-1">
              Idioma Padrão
            </label>
            <select
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-xs text-[#202124] dark:text-[#E8EAED] focus:border-[#3F6FB5] focus:outline-none"
            >
              <option value="pt-BR">Português Brasileiro (pt-BR)</option>
              <option value="pt-PT">Português Europeu (pt-PT)</option>
              <option value="pt-MZ">Português Moçambicano (pt-MZ)</option>
              <option value="pt-AO">Português Angolano (pt-AO)</option>
              <option value="pt-CV">Português Cabo-verdiano (pt-CV)</option>
              <option value="en-US">Inglês Americano (en-US)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED] mb-1">
              Formalidade Padrão
            </label>
            <select
              value={defaultFormality}
              onChange={(e) => setDefaultFormality(e.target.value as FormalityLevel)}
              className="w-full px-3 py-2 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-xs text-[#202124] dark:text-[#E8EAED] focus:border-[#3F6FB5] focus:outline-none"
            >
              <option value="consultivo">Consultivo (Recomendado)</option>
              <option value="formal">Formal</option>
              <option value="informal">Informal</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-[#ECEEF1] dark:border-[#2D3139] space-y-2">
          <label className="flex items-center gap-2 text-xs text-[#202124] dark:text-[#E8EAED] cursor-pointer">
            <input
              type="checkbox"
              checked={strictNoGuessGender}
              onChange={(e) => setStrictNoGuessGender(e.target.checked)}
              className="rounded border-[#DADDE1] dark:border-[#2D3139] text-[#3F6FB5]"
            />
            <span className="font-medium">
              Nunca inferir gênero apenas pelo nome quando não houver confirmação (utilizar comunicação neutra e natural)
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs text-[#202124] dark:text-[#E8EAED] cursor-pointer">
            <input
              type="checkbox"
              checked={strictNoAutoCurrencyConversion}
              onChange={(e) => setStrictNoAutoCurrencyConversion(e.target.checked)}
              className="rounded border-[#DADDE1] dark:border-[#2D3139] text-[#3F6FB5]"
            />
            <span className="font-medium">
              Não realizar conversão automática de preços apenas pela taxa cambial (respeitar preços cadastrados)
            </span>
          </label>
        </div>
      </div>

      {/* 4. Regras de Mercado por País */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
              Regras Pré-Configuradas por País & Mercado ({marketRules.length})
            </h3>
            <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
              Ao cadastrar uma empresa de um país específico, estas diretrizes são aplicadas deterministicamente.
            </p>
          </div>

          <Button
            variant="secondary"
            size="xs"
            onClick={handleAddCountryRule}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Adicionar País
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {marketRules.map((rule, index) => {
            const isEditing = editingRuleIndex === index;

            return (
              <div
                key={rule.id || index}
                className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#3F6FB5]" />
                    {rule.country} ({rule.countryCode})
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingRuleIndex(isEditing ? null : index)}
                      className="p-1 text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#3F6FB5] transition-colors"
                      title={isEditing ? 'Fechar edição' : 'Editar regra'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(index)}
                      className="p-1 text-[#5F6368] dark:text-[#9AA0A6] hover:text-red-500 transition-colors"
                      title="Excluir país"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="País"
                        value={rule.country}
                        onChange={(e) => handleUpdateRule(index, { country: e.target.value })}
                      />
                      <Input
                        label="Código (2 letras)"
                        value={rule.countryCode}
                        onChange={(e) => handleUpdateRule(index, { countryCode: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        label="Moeda"
                        value={rule.defaultCurrency}
                        onChange={(e) => handleUpdateRule(index, { defaultCurrency: e.target.value })}
                      />
                      <Input
                        label="Símbolo"
                        value={rule.currencySymbol}
                        onChange={(e) => handleUpdateRule(index, { currencySymbol: e.target.value })}
                      />
                      <Input
                        label="Idioma"
                        value={rule.defaultLanguage}
                        onChange={(e) => handleUpdateRule(index, { defaultLanguage: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED] mb-1">
                          Formalidade
                        </label>
                        <select
                          value={rule.formality}
                          onChange={(e) => handleUpdateRule(index, { formality: e.target.value as FormalityLevel })}
                          className="w-full px-2 py-1.5 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-xs"
                        >
                          <option value="consultivo">Consultivo</option>
                          <option value="formal">Formal</option>
                          <option value="informal">Informal</option>
                        </select>
                      </div>

                      <Input
                        label="Termo para 'Orçamento'"
                        value={rule.terms?.budget || ''}
                        onChange={(e) =>
                          handleUpdateRule(index, {
                            terms: { ...rule.terms, budget: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                    <div className="flex items-center justify-between text-[#202124] dark:text-[#E8EAED]">
                      <span>Moeda: <strong>{rule.defaultCurrency} ({rule.currencySymbol})</strong></span>
                      <span>Idioma: <strong>{rule.defaultLanguage}</strong></span>
                      <span className="capitalize">Estilo: <strong>{rule.formality}</strong></span>
                    </div>
                    <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] flex gap-2 flex-wrap pt-0.5">
                      <span>Termo orçamento: <em>&ldquo;{rule.terms?.budget}&rdquo;</em></span>
                      <span>•</span>
                      <span>Termo site: <em>&ldquo;{rule.terms?.site}&rdquo;</em></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

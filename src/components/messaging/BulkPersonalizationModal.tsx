import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Copy,
  Clock,
  Edit3,
  Check,
  Building2,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Company, Contact, Lead, MessageTemplate, Service, VariationLevel, PersonalizedMessageResult } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { preparePersonalizedMessage, generateMessageVariation } from '../../utils/messagePersonalizer';
import { generateWhatsAppLink } from '../../utils/formatting';
import { useToast } from '../../context/ToastContext';

interface BulkPersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies?: Company[];
  contacts?: Contact[];
  leads?: Lead[];
  templates?: MessageTemplate[];
  services?: Service[];
  onScheduleBulk?: (actions: Array<{ companyId: string; message: string; contactId?: string }>) => void;
}

interface BulkGeneratedItem {
  lead: Lead;
  company: Company;
  contact?: Contact | null;
  service?: Service | null;
  result: PersonalizedMessageResult;
  editableMessage: string;
  isEditing: boolean;
  isCopied: boolean;
}

export const BulkPersonalizationModal: React.FC<BulkPersonalizationModalProps> = ({
  isOpen,
  onClose,
  companies: propCompanies,
  contacts: propContacts,
  leads: propLeads,
  templates: propTemplates,
  services: propServices,
  onScheduleBulk,
}) => {
  const appContext = useApp();
  const companies = propCompanies || appContext.companies;
  const contacts = propContacts || appContext.contacts;
  const leads = propLeads || appContext.leads;
  const templates = propTemplates || appContext.templates;
  const services = propServices || appContext.services;

  const { success, error } = useToast();

  const [step, setStep] = useState<'select' | 'results'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedServiceId, setSelectedServiceId] = useState('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [variationLevel, setVariationLevel] = useState<VariationLevel>('contextual');

  // Seleção de Leads
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());

  // Mensagens Geradas
  const [generatedItems, setGeneratedItems] = useState<BulkGeneratedItem[]>([]);

  // Nichos únicos
  const availableNiches = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.niche) set.add(c.niche);
    });
    return Array.from(set);
  }, [companies]);

  // Empresas elegíveis
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (selectedNiche !== 'all' && c.niche !== selectedNiche) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesCity = c.city?.toLowerCase().includes(q);
        const matchesNiche = c.niche?.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesNiche) return false;
      }
      return true;
    });
  }, [companies, selectedNiche, searchTerm]);

  // Alterna seleção individual
  const toggleSelectCompany = (id: string) => {
    const next = new Set(selectedCompanyIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedCompanyIds(next);
  };

  // Selecionar todos os filtrados
  const handleSelectAll = () => {
    const next = new Set(selectedCompanyIds);
    filteredCompanies.forEach((c) => next.add(c.id));
    setSelectedCompanyIds(next);
  };

  // Desmarcar todos
  const handleDeselectAll = () => {
    setSelectedCompanyIds(new Set());
  };

  // Executa o motor de personalização em massa
  const handleGenerateBulk = () => {
    if (selectedCompanyIds.size === 0) {
      error('Selecione ao menos uma empresa para gerar as mensagens.');
      return;
    }

    const tpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (!tpl) {
      error('Selecione um script de base válido.');
      return;
    }

    const items: BulkGeneratedItem[] = [];

    selectedCompanyIds.forEach((companyId) => {
      const company = companies.find((c) => c.id === companyId);
      if (!company) return;

      const compContacts = contacts.filter((c) => c.companyId === companyId);
      const contact = compContacts.find((c) => c.isPrimary) || compContacts[0] || null;

      const fallbackLead: Lead = {
        id: `lead-${companyId}`,
        companyId,
        stage: 'PRIMEIRO_CONTACTO',
        priority: 'media',
        temperature: 'morno',
        status: 'active',
        serviceId: undefined,
        entryDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const lead = leads.find((l) => l.companyId === companyId) || fallbackLead;

      const service = services.find((s) => s.id === lead.serviceId || s.id === tpl.serviceId) || services[0] || null;

      const result = preparePersonalizedMessage(
        tpl,
        { company, contact, service, lead },
        variationLevel
      );

      items.push({
        lead,
        company,
        contact,
        service,
        result,
        editableMessage: result.message,
        isEditing: false,
        isCopied: false,
      });
    });

    setGeneratedItems(items);
    setStep('results');
    success(`${items.length} mensagens personalizadas geradas com sucesso!`);
  };

  // Ações na lista de resultados
  const handleCopyItem = async (index: number) => {
    const item = generatedItems[index];
    if (!item) return;

    try {
      await navigator.clipboard.writeText(item.editableMessage);
      const updated = [...generatedItems];
      updated[index].isCopied = true;
      setGeneratedItems(updated);
      success(`Mensagem para ${item.company.name} copiada!`);
      setTimeout(() => {
        const reset = [...generatedItems];
        if (reset[index]) reset[index].isCopied = false;
        setGeneratedItems(reset);
      }, 2000);
    } catch (err) {
      error('Erro ao copiar.');
    }
  };

  const handleOpenWhatsAppItem = (index: number) => {
    const item = generatedItems[index];
    if (!item) return;

    const phone =
      item.contact?.whatsapp ||
      item.contact?.phone ||
      item.company.companyWhatsApp ||
      item.company.companyPhone ||
      '';

    if (!phone) {
      error(`Nenhum WhatsApp cadastrado para ${item.company.name}.`);
      return;
    }

    const link = generateWhatsAppLink(phone, item.editableMessage);
    window.open(link, '_blank');
  };

  const handleUpdateMessageText = (index: number, newText: string) => {
    const updated = [...generatedItems];
    updated[index].editableMessage = newText;
    setGeneratedItems(updated);
  };

  const handleToggleEditItem = (index: number) => {
    const updated = [...generatedItems];
    updated[index].isEditing = !updated[index].isEditing;
    setGeneratedItems(updated);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Motor de Personalização em Massa"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Passos: 1. Seleção -> 2. Mensagens Preparadas */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('select')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                step === 'select'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> 1. Selecionar Leads ({selectedCompanyIds.size})
            </button>

            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />

            <button
              type="button"
              disabled={generatedItems.length === 0}
              onClick={() => setStep('results')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                step === 'results'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 disabled:opacity-40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 2. Mensagens Prontas ({generatedItems.length})
            </button>
          </div>

          <div className="text-xs text-neutral-400 hidden sm:block">
            {step === 'select' ? 'Filtre e selecione os prospects' : 'Revise, edite e envie'}
          </div>
        </div>

        {/* ETAPA 1: SELEÇÃO DE LEADS E CONFIGURAÇÃO */}
        {step === 'select' && (
          <div className="space-y-4">
            {/* Controles de Script e Variação */}
            <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1">
                    Script / Template de Base *
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.title} ({tpl.channel.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1">
                    Nível de Variação
                  </label>
                  <select
                    value={variationLevel}
                    onChange={(e) => setVariationLevel(e.target.value as VariationLevel)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="none">1. Sem Variação (Template Exato)</option>
                    <option value="minor">2. Pequena Variação (Sinônimos & Aberturas)</option>
                    <option value="contextual">3. Variação Contextual (Dor & Persona)</option>
                    <option value="ai">4. Personalização por IA (Hiperpersonalizada)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filtros e Busca de Leads */}
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div className="flex flex-1 gap-2 w-full">
                <div className="flex-1">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar empresas por nome, cidade ou nicho..."
                    leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
                  />
                </div>

                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todos os Nichos</option>
                  {availableNiches.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Selecionar Todos ({filteredCompanies.length})
                </Button>
                {selectedCompanyIds.size > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {/* Tabela / Lista de Leads Elegíveis */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 sticky top-0">
                  <tr>
                    <th className="p-3 w-10 text-center">Sel.</th>
                    <th className="p-3">Empresa</th>
                    <th className="p-3">Contato & Tratamento</th>
                    <th className="p-3">Nicho / Cidade</th>
                    <th className="p-3">Dor Diagnosticada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                  {filteredCompanies.map((c) => {
                    const isSelected = selectedCompanyIds.has(c.id);
                    const compContacts = contacts.filter((ct) => ct.companyId === c.id);
                    const primary = compContacts.find((ct) => ct.isPrimary) || compContacts[0];

                    return (
                      <tr
                        key={c.id}
                        onClick={() => toggleSelectCompany(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-600/10 hover:bg-blue-600/15' : 'hover:bg-neutral-900/40'
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // controlado pelo tr
                            className="rounded border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 font-semibold text-neutral-100">{c.name}</td>
                        <td className="p-3 text-neutral-300">
                          {primary ? (
                            <div>
                              <span>{primary.name}</span>
                              <span className="text-[10px] text-neutral-400 block">
                                {primary.salutation ? `Tratamento: ${primary.salutation}` : 'Nome próprio'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">Sem contato</span>
                          )}
                        </td>
                        <td className="p-3 text-neutral-400">
                          {c.niche || 'Geral'} • {c.city || 'S/D'}
                        </td>
                        <td className="p-3 text-amber-400/90 text-[11px] truncate max-w-xs">
                          {c.apparentNeed || 'Necessidade geral'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Rodapé da Etapa 1 */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <span className="text-xs text-neutral-400">
                {selectedCompanyIds.size} de {filteredCompanies.length} empresas selecionadas
              </span>

              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateBulk}
                disabled={selectedCompanyIds.size === 0}
                leftIcon={<Sparkles className="w-4 h-4 text-amber-400" />}
              >
                Gerar {selectedCompanyIds.size} Mensagens Personalizadas
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 2: MENSAGENS GERADAS & AUDITADAS */}
        {step === 'results' && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong>{generatedItems.length} Mensagens Preparadas:</strong> Cada mensagem está estritamente vinculada ao respectivo lead (sem cruzamento de dados).
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs font-semibold underline hover:text-emerald-200"
              >
                Alterar Seleção
              </button>
            </div>

            {/* Lista de Mensagens Geradas */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {generatedItems.map((item, idx) => {
                const { metadata, audit } = item.result;
                const isAuditOk = audit.status === 'approved';

                return (
                  <div
                    key={item.company.id}
                    className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-2.5"
                  >
                    {/* Header da Mensagem do Lead */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-100">
                          {idx + 1}. {item.company.name}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          • {metadata.recipientName} ({metadata.recipientSalutation})
                        </span>
                        <Badge
                          variant={isAuditOk ? 'emerald' : 'amber'}
                          size="sm"
                          className="text-[10px] py-0 px-1.5"
                        >
                          {isAuditOk ? '✓ Auditada' : `⚠️ Faltam ${audit.missingFields.length} campos`}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEditItem(idx)}
                          className="text-xs h-7 px-2"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          {item.isEditing ? 'Pronto' : 'Editar'}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyItem(idx)}
                          className="text-xs h-7 px-2"
                        >
                          {item.isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 mr-1" />
                          )}
                          {item.isCopied ? 'Copiado' : 'Copiar'}
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenWhatsAppItem(idx)}
                          className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> WhatsApp
                        </Button>
                      </div>
                    </div>

                    {/* Caixa de Texto */}
                    {item.isEditing ? (
                      <textarea
                        rows={4}
                        value={item.editableMessage}
                        onChange={(e) => handleUpdateMessageText(idx, e.target.value)}
                        className="w-full bg-neutral-950 border border-blue-500 rounded-lg p-2.5 text-xs text-neutral-100 focus:outline-none"
                      />
                    ) : (
                      <div className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">
                        {item.editableMessage}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Rodapé da Etapa 2 */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
                Voltar
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Concluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

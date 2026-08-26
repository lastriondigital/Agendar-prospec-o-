import React, { useEffect, useState } from 'react';
import {
  Building2,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
  Target,
  User,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Company,
  Contact,
  ContactChannel,
  DuplicateMatch,
  Lead,
  LeadPriority,
  LeadStage,
  LeadTemperature,
} from '../../types';
import { ALL_LEAD_STAGES, DEFAULT_NICHES, DEFAULT_SOURCES, STAGES_CONFIG } from '../../utils/constants';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Tabs } from '../ui/Tabs';
import { DuplicateAlert } from './DuplicateAlert';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCompany?: Company | null;
  onOpenExistingCompany?: (companyId: string) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  editingCompany,
  onOpenExistingCompany,
}) => {
  const {
    companies,
    contacts,
    leads,
    services,
    createCompanyWithLead,
    updateCompany,
    updateContact,
    validateDuplicates,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'company' | 'contact' | 'lead'>('company');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States - Empresa
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [category, setCategory] = useState('Serviços B2B');
  const [niche, setNiche] = useState(DEFAULT_NICHES[0]);
  const [country, setCountry] = useState('Brasil');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [googleBusiness, setGoogleBusiness] = useState('');
  const [unitsCount, setUnitsCount] = useState(1);
  const [companyNotes, setCompanyNotes] = useState('');

  // Form States - Contacto
  const [contactId, setContactId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  // Form States - Lead
  const [leadId, setLeadId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [source, setSource] = useState(DEFAULT_SOURCES[0]);
  const [score, setScore] = useState(70);
  const [priority, setPriority] = useState<LeadPriority>('alta');
  const [temperature, setTemperature] = useState<LeadTemperature>('quente');
  const [stage, setStage] = useState<LeadStage>('NOVO');
  const [nextActionTitle, setNextActionTitle] = useState('Primeiro contato via WhatsApp');
  const [nextActionDate, setNextActionDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextActionChannel, setNextActionChannel] = useState<ContactChannel>('whatsapp');
  const [leadNotes, setLeadNotes] = useState('');

  // Anti-duplication state
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);

  // Initialize or reset form data
  useEffect(() => {
    if (!isOpen) {
      setDuplicateMatches([]);
      setIgnoreDuplicates(false);
      return;
    }

    if (editingCompany) {
      // Carregar dados existentes para edição
      setName(editingCompany.name || '');
      setTradeName(editingCompany.tradeName || '');
      setCategory(editingCompany.category || 'Serviços B2B');
      setNiche(editingCompany.niche || DEFAULT_NICHES[0]);
      setCountry(editingCompany.country || 'Brasil');
      setCity(editingCompany.city || '');
      setAddress(editingCompany.address || '');
      setWebsite(editingCompany.website || '');
      setInstagram(editingCompany.instagram || '');
      setFacebook(editingCompany.facebook || '');
      setLinkedin(editingCompany.linkedin || '');
      setGoogleBusiness(editingCompany.googleBusiness || '');
      setUnitsCount(editingCompany.unitsCount || 1);
      setCompanyNotes(editingCompany.notes || '');

      const compContacts = contacts.filter((c) => c.companyId === editingCompany.id);
      const primaryContact = compContacts.find((c) => c.isPrimary) || compContacts[0];
      if (primaryContact) {
        setContactId(primaryContact.id);
        setContactName(primaryContact.name || '');
        setContactRole(primaryContact.role || '');
        setPhone(primaryContact.phone || '');
        setWhatsapp(primaryContact.whatsapp || '');
        setEmail(primaryContact.email || '');
        setContactNotes(primaryContact.notes || '');
      }

      const compLead = leads.find((l) => l.companyId === editingCompany.id);
      if (compLead) {
        setLeadId(compLead.id);
        setSelectedServiceId(compLead.serviceId || '');
        setSource(compLead.source || DEFAULT_SOURCES[0]);
        setScore(compLead.score ?? 70);
        setPriority(compLead.priority || 'alta');
        setTemperature(compLead.temperature || 'quente');
        setStage(compLead.stage || 'NOVO');
        setNextActionTitle(compLead.nextActionTitle || '');
        setNextActionDate(compLead.nextActionDate || new Date().toISOString().slice(0, 10));
        setNextActionChannel(compLead.nextActionChannel || 'whatsapp');
        setLeadNotes(compLead.notes || '');
      }
    } else {
      // Limpar para novo cadastro
      setName('');
      setTradeName('');
      setCategory('Serviços B2B');
      setNiche(DEFAULT_NICHES[0]);
      setCountry('Brasil');
      setCity('');
      setAddress('');
      setWebsite('');
      setInstagram('');
      setFacebook('');
      setLinkedin('');
      setGoogleBusiness('');
      setUnitsCount(1);
      setCompanyNotes('');

      setContactId('');
      setContactName('');
      setContactRole('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setContactNotes('');

      setLeadId('');
      setSelectedServiceId(services[0]?.id || '');
      setSource(DEFAULT_SOURCES[0]);
      setScore(75);
      setPriority('alta');
      setTemperature('quente');
      setStage('NOVO');
      setNextActionTitle('Primeiro contato via WhatsApp');
      setNextActionDate(new Date().toISOString().slice(0, 10));
      setNextActionChannel('whatsapp');
      setLeadNotes('');
    }

    setActiveTab('company');
    setDuplicateMatches([]);
    setIgnoreDuplicates(false);
  }, [isOpen, editingCompany, contacts, leads, services]);

  // Anti-duplication check on change
  useEffect(() => {
    if (!isOpen || ignoreDuplicates || editingCompany) {
      setDuplicateMatches([]);
      return;
    }

    // Apenas dispara se tiver dados mínimos para validação
    if (phone.length >= 8 || whatsapp.length >= 8 || email.includes('@') || (name.length >= 3 && contactName.length >= 3)) {
      const timer = setTimeout(async () => {
        const matches = await validateDuplicates({
          companyName: name,
          tradeName,
          contactName,
          phone,
          whatsapp,
          email,
          excludeCompanyId: editingCompany?.id,
          excludeContactId: contactId || undefined,
        });
        setDuplicateMatches(matches);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setDuplicateMatches([]);
    }
  }, [isOpen, name, tradeName, contactName, phone, whatsapp, email, editingCompany, contactId, ignoreDuplicates, validateDuplicates]);

  // Handler para submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setActiveTab('company');
      return;
    }
    if (!contactName.trim()) {
      setActiveTab('contact');
      return;
    }

    // Se houver duplicados e o usuário ainda não confirmou criar mesmo assim
    if (duplicateMatches.length > 0 && !ignoreDuplicates && !editingCompany) {
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedService = services.find((s) => s.id === selectedServiceId);

      if (editingCompany) {
        // Atualizar Empresa
        await updateCompany({
          ...editingCompany,
          name: name.trim(),
          tradeName: tradeName.trim() || undefined,
          category: category.trim(),
          niche: niche.trim(),
          country: country.trim() || 'Brasil',
          city: city.trim(),
          address: address.trim() || undefined,
          website: website.trim() || undefined,
          instagram: instagram.trim() || undefined,
          facebook: facebook.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          googleBusiness: googleBusiness.trim() || undefined,
          unitsCount: Number(unitsCount) || 1,
          notes: companyNotes.trim() || undefined,
        });

        // Atualizar contacto principal se existir
        if (contactId) {
          await updateContact({
            id: contactId,
            companyId: editingCompany.id,
            name: contactName.trim(),
            role: contactRole.trim() || undefined,
            phone: phone.trim() || undefined,
            whatsapp: whatsapp.trim() || undefined,
            email: email.trim() || undefined,
            notes: contactNotes.trim() || undefined,
            isPrimary: true,
          });
        }
      } else {
        // Criar nova Empresa com Lead e Contacto
        await createCompanyWithLead({
          company: {
            name: name.trim(),
            tradeName: tradeName.trim() || undefined,
            category: category.trim(),
            niche: niche.trim(),
            country: country.trim() || 'Brasil',
            city: city.trim(),
            address: address.trim() || undefined,
            website: website.trim() || undefined,
            instagram: instagram.trim() || undefined,
            facebook: facebook.trim() || undefined,
            linkedin: linkedin.trim() || undefined,
            googleBusiness: googleBusiness.trim() || undefined,
            unitsCount: Number(unitsCount) || 1,
            notes: companyNotes.trim() || undefined,
          },
          contact: {
            name: contactName.trim(),
            role: contactRole.trim() || undefined,
            phone: phone.trim() || undefined,
            whatsapp: whatsapp.trim() || undefined,
            email: email.trim() || undefined,
            notes: contactNotes.trim() || undefined,
          },
          lead: {
            serviceId: selectedServiceId || undefined,
            serviceName: selectedService?.name || undefined,
            source: source.trim(),
            score: Number(score) || 50,
            priority,
            temperature,
            stage,
            nextActionTitle: nextActionTitle.trim() || undefined,
            nextActionDate: nextActionDate || undefined,
            nextActionChannel,
            notes: leadNotes.trim() || undefined,
          },
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenExisting = (compTargetId: string) => {
    onClose();
    if (onOpenExistingCompany) {
      onOpenExistingCompany(compTargetId);
    }
  };

  const handleUpdateExisting = (compTargetId: string) => {
    const existing = companies.find((c) => c.id === compTargetId);
    if (existing) {
      setIgnoreDuplicates(true);
      // Carregar os dados dessa empresa para o form
      setName(existing.name);
      setTradeName(existing.tradeName || '');
      setCategory(existing.category || 'Serviços B2B');
      setNiche(existing.niche || DEFAULT_NICHES[0]);
      setCountry(existing.country || 'Brasil');
      setCity(existing.city || '');
      setAddress(existing.address || '');
      setWebsite(existing.website || '');
      setInstagram(existing.instagram || '');
      setLinkedin(existing.linkedin || '');
      setGoogleBusiness(existing.googleBusiness || '');
      setCompanyNotes(existing.notes || '');

      const compConts = contacts.filter((c) => c.companyId === existing.id);
      if (compConts[0]) {
        setContactId(compConts[0].id);
        setContactName(compConts[0].name);
        setContactRole(compConts[0].role || '');
        setPhone(compConts[0].phone || '');
        setWhatsapp(compConts[0].whatsapp || '');
        setEmail(compConts[0].email || '');
      }
      setDuplicateMatches([]);
    }
  };

  const tabItems = [
    {
      id: 'company',
      label: '1. Empresa & Perfil',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'contact',
      label: '2. Contacto Principal',
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 'lead',
      label: '3. Lead & Estratégia',
      icon: <Target className="w-4 h-4" />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCompany ? `Editar Empresa: ${editingCompany.name}` : 'Cadastrar Nova Empresa & Lead'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Alerta Anti-Duplicação */}
        {duplicateMatches.length > 0 && !ignoreDuplicates && (
          <DuplicateAlert
            matches={duplicateMatches}
            onOpenExisting={handleOpenExisting}
            onUpdateExisting={handleUpdateExisting}
            onProceedAnyway={() => setIgnoreDuplicates(true)}
          />
        )}

        {/* Abas do Formulário */}
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'company' | 'contact' | 'lead')}
        />

        {/* ABA 1: DADOS DA EMPRESA */}
        {activeTab === 'company' && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Razão Social / Nome da Empresa *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Farmácia São Paulo LTDA"
                required
                autoFocus
              />

              <Input
                label="Nome Fantasia"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="Ex: Drogaria Saúde Mais"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Nicho de Mercado"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                options={DEFAULT_NICHES.map((n) => ({ value: n, label: n }))}
              />

              <Input
                label="Categoria do Negócio"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Serviços B2B, Saúde, Varejo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="País"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Brasil"
              />

              <Input
                label="Cidade *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo, SP"
                required
              />

              <Input
                label="Nº de Unidades / Filiais"
                type="number"
                min={1}
                value={unitsCount}
                onChange={(e) => setUnitsCount(parseInt(e.target.value) || 1)}
              />
            </div>

            <Input
              label="Endereço Completo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Av. Paulista, 1000, Sala 501"
              leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            />

            {/* Redes Sociais & Web */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Presença Digital & Redes Sociais
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://empresa.com.br"
                  leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="Instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@perfil_empresa"
                  leftIcon={<Instagram className="w-4 h-4 text-pink-400" />}
                />

                <Input
                  label="LinkedIn da Empresa"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/company/nome"
                  leftIcon={<Linkedin className="w-4 h-4 text-blue-400" />}
                />

                <Input
                  label="Google Business / Maps"
                  value={googleBusiness}
                  onChange={(e) => setGoogleBusiness(e.target.value)}
                  placeholder="Link da ficha no Google Maps"
                  leftIcon={<MapPin className="w-4 h-4 text-emerald-400" />}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Observações da Empresa</label>
              <textarea
                value={companyNotes}
                onChange={(e) => setCompanyNotes(e.target.value)}
                rows={2}
                placeholder="Detalhes operacionais, dores identificadas, tamanho da equipe..."
                className="w-full px-3 py-2 bg-slate-900/70 border border-slate-700/80 rounded-xl text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
        )}

        {/* ABA 2: CONTACTO PRINCIPAL */}
        {activeTab === 'contact' && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome Completo do Contacto *"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Drummond"
                required
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="Cargo / Função"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                placeholder="Ex: Diretor Comercial, CEO, Sócio"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="WhatsApp (com DDD) *"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  if (!phone) setPhone(e.target.value);
                }}
                placeholder="Ex: (11) 98765-4321"
                leftIcon={<MessageSquare className="w-4 h-4 text-emerald-400" />}
              />

              <Input
                label="Telefone Fixo / Celular"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 3344-5566"
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@empresa.com.br"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Observações do Contacto</label>
              <textarea
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                rows={3}
                placeholder="Melhor horário para contato, tom da abordagem, assistente pessoal..."
                className="w-full px-3 py-2 bg-slate-900/70 border border-slate-700/80 rounded-xl text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
        )}

        {/* ABA 3: LEAD & ESTRATÉGIA */}
        {activeTab === 'lead' && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Estágio do Funil (Pipeline)"
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                options={ALL_LEAD_STAGES.map((stg) => ({
                  value: stg,
                  label: `${STAGES_CONFIG[stg].order}. ${STAGES_CONFIG[stg].label}`,
                }))}
              />

              <Select
                label="Serviço de Interesse Principal"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                options={[
                  { value: '', label: 'Nenhum / A definir' },
                  ...services.map((s) => ({ value: s.id, label: s.name })),
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Origem do Lead"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                options={DEFAULT_SOURCES.map((s) => ({ value: s, label: s }))}
              />

              <Select
                label="Prioridade"
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                options={[
                  { value: 'alta', label: 'Alta Prioridade' },
                  { value: 'média', label: 'Média Prioridade' },
                  { value: 'baixa', label: 'Baixa Prioridade' },
                ]}
              />

              <Select
                label="Temperatura"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value as LeadTemperature)}
                options={[
                  { value: 'quente', label: '🔥 Quente (Engajado / Fit alto)' },
                  { value: 'morno', label: '⚡ Morno (Potencial com interesse)' },
                  { value: 'frio', label: '❄️ Frio (Prospecção Inicial)' },
                ]}
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Score do Lead (0 a 100):
                </label>
                <span className="font-mono text-sm font-bold text-amber-300">{score} pts</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full accent-slate-200 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Próxima Ação */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Planejamento da Próxima Ação
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Descrição da Ação"
                    value={nextActionTitle}
                    onChange={(e) => setNextActionTitle(e.target.value)}
                    placeholder="Ex: Enviar proposta comercial ou ligar para confirmação"
                  />
                </div>

                <Input
                  label="Data da Ação"
                  type="date"
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Observações do Lead</label>
              <textarea
                value={leadNotes}
                onChange={(e) => setLeadNotes(e.target.value)}
                rows={2}
                placeholder="Histórico prévio de contato, detalhes da qualificação..."
                className="w-full px-3 py-2 bg-slate-900/70 border border-slate-700/80 rounded-xl text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
        )}

        {/* Rodapé com Navegação e Salvar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {activeTab !== 'company' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (activeTab === 'lead') setActiveTab('contact');
                  if (activeTab === 'contact') setActiveTab('company');
                }}
              >
                Voltar
              </Button>
            )}

            {activeTab !== 'lead' ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  if (activeTab === 'company') {
                    if (!name.trim()) return;
                    setActiveTab('contact');
                  } else if (activeTab === 'contact') {
                    if (!contactName.trim()) return;
                    setActiveTab('lead');
                  }
                }}
              >
                Avançar
              </Button>
            ) : (
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {editingCompany ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

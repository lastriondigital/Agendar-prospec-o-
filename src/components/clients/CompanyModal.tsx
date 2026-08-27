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
import { useToast } from '../../context/ToastContext';
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
  const { warning, success } = useToast();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States - Empresa
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [category, setCategory] = useState('Serviços B2B');
  const [niche, setNiche] = useState(DEFAULT_NICHES[0]);
  const [country, setCountry] = useState('Brasil');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWhatsApp, setCompanyWhatsApp] = useState('');
  const [companyWhatsAppVerified, setCompanyWhatsAppVerified] = useState(false);
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
      setCompanyPhone(editingCompany.companyPhone || '');
      setCompanyWhatsApp(editingCompany.companyWhatsApp || '');
      setCompanyWhatsAppVerified(editingCompany.companyWhatsAppVerified ?? false);
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
        setScore(compLead.score || 70);
        setPriority(compLead.priority || 'alta');
        setTemperature(compLead.temperature || 'quente');
        setStage(compLead.stage || 'NOVO');
        setNextActionTitle(compLead.nextActionTitle || 'Primeiro contato via WhatsApp');
        setNextActionDate(compLead.nextActionDate || new Date().toISOString().slice(0, 10));
        setNextActionChannel(compLead.nextActionChannel || 'whatsapp');
        setLeadNotes(compLead.notes || '');
      }
    } else {
      // Resetar para novo cadastro
      setName('');
      setTradeName('');
      setCategory('Serviços B2B');
      setNiche(DEFAULT_NICHES[0]);
      setCountry('Brasil');
      setCity('');
      setAddress('');
      setCompanyPhone('');
      setCompanyWhatsApp('');
      setCompanyWhatsAppVerified(false);
      setWebsite('');
      setInstagram('');
      setFacebook('');
      setLinkedin('');
      setGoogleBusiness('');
      setUnitsCount(1);
      setCompanyNotes('');

      setContactId('');
      setContactName('');
      setContactRole('Decisor / Proprietário');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setContactNotes('');

      setLeadId('');
      setSelectedServiceId('');
      setSource(DEFAULT_SOURCES[0]);
      setScore(70);
      setPriority('alta');
      setTemperature('quente');
      setStage('NOVO');
      setNextActionTitle('Primeiro contato via WhatsApp');
      setNextActionDate(new Date().toISOString().slice(0, 10));
      setNextActionChannel('whatsapp');
      setLeadNotes('');
      setActiveStep(1);
    }
  }, [isOpen, editingCompany, contacts, leads]);

  // Anti-duplication live check
  useEffect(() => {
    if (!isOpen || editingCompany || ignoreDuplicates) return;

    let isMounted = true;

    if (name.trim().length >= 3 || whatsapp.trim().length >= 8 || companyWhatsApp.trim().length >= 8 || email.trim().length >= 5) {
      validateDuplicates({
        companyName: name,
        contactName: contactName,
        tradeName,
        phone: whatsapp || phone || companyWhatsApp || companyPhone,
        whatsapp: whatsapp || companyWhatsApp,
        email,
        website,
        companyPhone,
        companyWhatsApp,
      }).then((matches) => {
        if (isMounted) {
          setDuplicateMatches(matches);
        }
      });
    } else {
      setDuplicateMatches([]);
    }

    return () => {
      isMounted = false;
    };
  }, [name, contactName, tradeName, whatsapp, phone, companyWhatsApp, companyPhone, email, website, instagram, isOpen, editingCompany, ignoreDuplicates, validateDuplicates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      warning('O nome / razão social da empresa é obrigatório.');
      setActiveStep(1);
      return;
    }

    if (!city.trim()) {
      warning('A cidade da empresa é obrigatória.');
      setActiveStep(1);
      return;
    }

    if (!contactName.trim()) {
      warning('O nome do contacto principal é obrigatório.');
      setActiveStep(2);
      return;
    }

    if (!whatsapp.trim() && !phone.trim() && !companyWhatsApp.trim() && !companyPhone.trim()) {
      warning('Informe ao menos um número de WhatsApp ou telefone.');
      setActiveStep(2);
      return;
    }

    try {
      setIsSubmitting(true);

      const targetServiceName = services.find((s) => s.id === selectedServiceId)?.name;

      if (editingCompany) {
        // Atualizar Empresa
        await updateCompany({
          ...editingCompany,
          name: name.trim(),
          tradeName: tradeName.trim() || undefined,
          category,
          niche,
          country,
          city: city.trim(),
          address: address.trim() || undefined,
          companyPhone: companyPhone.trim() || undefined,
          companyWhatsApp: companyWhatsApp.trim() || undefined,
          companyWhatsAppVerified,
          website: website.trim() || undefined,
          instagram: instagram.trim() || undefined,
          facebook: facebook.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          googleBusiness: googleBusiness.trim() || undefined,
          unitsCount: Number(unitsCount) || 1,
          notes: companyNotes.trim() || undefined,
        });

        // Atualizar Contato Principal
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
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        success('Empresa atualizada com sucesso!');
      } else {
        // Criar Nova Empresa com Lead e Contato Principal
        await createCompanyWithLead({
          company: {
            name: name.trim(),
            tradeName: tradeName.trim() || undefined,
            category,
            niche,
            country,
            city: city.trim(),
            address: address.trim() || undefined,
            companyPhone: companyPhone.trim() || undefined,
            companyWhatsApp: companyWhatsApp.trim() || undefined,
            companyWhatsAppVerified,
            website: website.trim() || undefined,
            instagram: instagram.trim() || undefined,
            facebook: facebook.trim() || undefined,
            linkedin: linkedin.trim() || undefined,
            googleBusiness: googleBusiness.trim() || undefined,
            unitsCount: Number(unitsCount) || 1,
            notes: companyNotes.trim() || undefined,
            status: 'lead',
          },
          contact: {
            name: contactName.trim(),
            role: contactRole.trim() || undefined,
            phone: phone.trim() || undefined,
            whatsapp: whatsapp.trim() || undefined,
            email: email.trim() || undefined,
            notes: contactNotes.trim() || undefined,
            isPrimary: true,
          },
          lead: {
            serviceId: selectedServiceId || undefined,
            serviceName: targetServiceName || undefined,
            source,
            score,
            priority,
            temperature,
            stage,
            nextActionTitle: nextActionTitle.trim() || undefined,
            nextActionDate: nextActionDate || undefined,
            nextActionChannel,
            notes: leadNotes.trim() || undefined,
          },
        });
        success('Nova empresa e lead cadastrados com sucesso!');
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
      setName(existing.name);
      setTradeName(existing.tradeName || '');
      setCategory(existing.category || 'Serviços B2B');
      setNiche(existing.niche || DEFAULT_NICHES[0]);
      setCountry(existing.country || 'Brasil');
      setCity(existing.city || '');
      setAddress(existing.address || '');
      setCompanyPhone(existing.companyPhone || '');
      setCompanyWhatsApp(existing.companyWhatsApp || '');
      setCompanyWhatsAppVerified(existing.companyWhatsAppVerified ?? false);
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

  const stepTabs = [
    {
      step: 1 as const,
      label: '1. Empresa & Perfil',
      shortLabel: '1. Empresa',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      step: 2 as const,
      label: '2. Contacto Principal',
      shortLabel: '2. Contacto',
      icon: <User className="w-4 h-4" />,
    },
    {
      step: 3 as const,
      label: '3. Lead & Estratégia',
      shortLabel: '3. Lead',
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
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
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
        <div
          role="tablist"
          aria-label="Etapas do Cadastro"
          className="grid grid-cols-3 gap-1 p-1 bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl w-full"
        >
          {stepTabs.map((t) => {
            const isActive = activeStep === t.step;
            return (
              <button
                key={t.step}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`step-content-${t.step}`}
                id={`step-tab-${t.step}`}
                onClick={() => setActiveStep(t.step)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap select-none min-h-[44px] touch-manipulation ${
                  isActive
                    ? 'bg-white dark:bg-[#282D36] text-[#3F6FB5] dark:text-blue-300 shadow-xs border border-blue-200 dark:border-blue-800/40'
                    : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-[#3F6FB5] dark:text-blue-300' : 'text-[#80868B]'}`}>
                  {t.icon}
                </span>
                <span className="hidden md:inline">{t.label}</span>
                <span className="md:hidden">{t.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* ABA 1: DADOS DA EMPRESA */}
        {activeStep === 1 && (
          <div
            id="step-content-1"
            role="tabpanel"
            aria-labelledby="step-tab-1"
            className="space-y-4 pt-2 animate-in fade-in duration-150"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Razão Social / Nome da Empresa *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Farmácia São Paulo LTDA"
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
              leftIcon={<MapPin className="w-4 h-4 text-[#80868B]" />}
            />

            {/* Canais Principais da Empresa */}
            <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#3F6FB5]" />
                  Telefones & WhatsApp da Empresa
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Telefone Geral / Recepção"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="Ex: (11) 3344-0000"
                  leftIcon={<Phone className="w-4 h-4 text-[#80868B]" />}
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED]">WhatsApp da Empresa</label>
                    {companyWhatsApp && (
                      <a
                        href={`https://wa.me/${companyWhatsApp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Testar no WhatsApp
                      </a>
                    )}
                  </div>
                  <Input
                    value={companyWhatsApp}
                    onChange={(e) => setCompanyWhatsApp(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    leftIcon={<MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#5F6368] dark:text-[#9AA0A6] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={companyWhatsAppVerified}
                  onChange={(e) => setCompanyWhatsAppVerified(e.target.checked)}
                  className="rounded border-[#DADDE1] dark:border-[#2D3139] text-[#3F6FB5]"
                />
                <span>WhatsApp corporativo verificado e ativo para atendimento comercial</span>
              </label>
            </div>

            {/* Redes Sociais & Web */}
            <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
              <h4 className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
                Presença Digital & Redes Sociais
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://empresa.com.br"
                  leftIcon={<Globe className="w-4 h-4 text-[#80868B]" />}
                />

                <Input
                  label="Instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@perfil_empresa"
                  leftIcon={<Instagram className="w-4 h-4 text-pink-500" />}
                />

                <Input
                  label="LinkedIn da Empresa"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/company/nome"
                  leftIcon={<Linkedin className="w-4 h-4 text-blue-500" />}
                />

                <Input
                  label="Google Business / Maps"
                  value={googleBusiness}
                  onChange={(e) => setGoogleBusiness(e.target.value)}
                  placeholder="Link da ficha no Google Maps"
                  leftIcon={<MapPin className="w-4 h-4 text-emerald-500" />}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED]">Observações da Empresa</label>
              <textarea
                value={companyNotes}
                onChange={(e) => setCompanyNotes(e.target.value)}
                rows={2}
                placeholder="Detalhes operacionais, dores identificadas, tamanho da equipe..."
                className="w-full px-3 py-2 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-[#202124] dark:text-[#E8EAED] text-xs placeholder:text-[#80868B] focus:outline-none focus:border-[#3F6FB5]"
              />
            </div>
          </div>
        )}

        {/* ABA 2: CONTACTO PRINCIPAL */}
        {activeStep === 2 && (
          <div
            id="step-content-2"
            role="tabpanel"
            aria-labelledby="step-tab-2"
            className="space-y-4 pt-2 animate-in fade-in duration-150"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome Completo do Contacto *"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Drummond"
                leftIcon={<User className="w-4 h-4 text-[#80868B]" />}
                autoFocus
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
                leftIcon={<MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              />

              <Input
                label="Telefone Fixo / Celular"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 3344-5566"
                leftIcon={<Phone className="w-4 h-4 text-[#80868B]" />}
              />

              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@empresa.com.br"
                leftIcon={<Mail className="w-4 h-4 text-[#80868B]" />}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED]">Observações do Contacto</label>
              <textarea
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                rows={3}
                placeholder="Melhor horário para contato, tom da abordagem, assistente pessoal..."
                className="w-full px-3 py-2 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-[#202124] dark:text-[#E8EAED] text-xs placeholder:text-[#80868B] focus:outline-none focus:border-[#3F6FB5]"
              />
            </div>
          </div>
        )}

        {/* ABA 3: LEAD & ESTRATÉGIA */}
        {activeStep === 3 && (
          <div
            id="step-content-3"
            role="tabpanel"
            aria-labelledby="step-tab-3"
            className="space-y-4 pt-2 animate-in fade-in duration-150"
          >
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

            <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#202124] dark:text-[#E8EAED] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Score do Lead (0 a 100):
                </label>
                <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400">{score} pts</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full accent-[#3F6FB5] cursor-pointer h-2 bg-[#E6E8EB] dark:bg-[#2D3139] rounded-lg"
              />
            </div>

            {/* Próxima Ação */}
            <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
              <h4 className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
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
              <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED]">Observações do Lead</label>
              <textarea
                value={leadNotes}
                onChange={(e) => setLeadNotes(e.target.value)}
                rows={2}
                placeholder="Histórico prévio de contato, detalhes da qualificação..."
                className="w-full px-3 py-2 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-[#202124] dark:text-[#E8EAED] text-xs placeholder:text-[#80868B] focus:outline-none focus:border-[#3F6FB5]"
              />
            </div>
          </div>
        )}

        {/* Rodapé com Navegação Livre e Conclusão */}
        <div className="flex items-center justify-between pt-4 border-t border-[#ECEEF1] dark:border-[#2D3139] gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveStep((prev) => (prev === 3 ? 2 : 1))}
              >
                Voltar
              </Button>
            )}

            {activeStep < 3 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setActiveStep((prev) => (prev === 1 ? 2 : 3))}
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

import React, { useState, useEffect } from 'react';
import { Instagram, Linkedin, Mail, MessageSquare, Phone, User, Users, Shield, Award } from 'lucide-react';
import { Contact, ContactGender, ContactSalutation, PersonaRole } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  existingContacts?: Contact[];
  editingContact?: Contact | null;
  onSave: (contactData: Omit<Contact, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  existingContacts = [],
  editingContact,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [personaRole, setPersonaRole] = useState<PersonaRole>('proprietario');
  const [gender, setGender] = useState<ContactGender>('nao_informado');
  const [salutation, setSalutation] = useState<ContactSalutation>('nome_proprio');
  const [customSalutation, setCustomSalutation] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [notes, setNotes] = useState('');
  const [referredByName, setReferredByName] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || '');
      setRole(editingContact.role || '');
      setPersonaRole(editingContact.personaRole || 'proprietario');
      setGender(editingContact.gender || 'nao_informado');
      setSalutation(editingContact.salutation || 'nome_proprio');
      setCustomSalutation(editingContact.customSalutation || '');
      setDepartment(editingContact.department || '');
      setPhone(editingContact.phone || '');
      setWhatsapp(editingContact.whatsapp || '');
      setEmail(editingContact.email || '');
      setInstagram(editingContact.instagram || '');
      setLinkedin(editingContact.linkedin || '');
      setNotes(editingContact.notes || '');
      setReferredByName(editingContact.referredByName || '');
      setIsPrimary(!!editingContact.isPrimary);
    } else {
      setName('');
      setRole('');
      setPersonaRole('proprietario');
      setGender('nao_informado');
      setSalutation('nome_proprio');
      setCustomSalutation('');
      setDepartment('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setInstagram('');
      setLinkedin('');
      setNotes('');
      setReferredByName('');
      setIsPrimary(existingContacts.length === 0);
    }
  }, [editingContact, isOpen, existingContacts.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        role: role.trim() || undefined,
        personaRole,
        gender,
        salutation,
        customSalutation: salutation === 'personalizado' ? customSalutation.trim() || undefined : undefined,
        department: department.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim() || undefined,
        instagram: instagram.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        notes: notes.trim() || undefined,
        referredByName: referredByName.trim() || undefined,
        isPrimary,
        status: editingContact?.status || 'active',
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingContact ? `Editar Contacto: ${editingContact.name}` : `Novo Contacto em ${companyName}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nome Completo *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Carlos Mboa"
            required
            autoFocus
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Cargo / Função"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex: Diretor Geral / Sócio"
          />
        </div>

        {/* Gênero e Forma de Tratamento (Ponto 31) */}
        <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-3">
          <div className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            Personalização por Gênero & Tratamento (Sem Presunção Automática)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Gênero
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as ContactGender)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
              >
                <option value="nao_informado">Não informado</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="neutro">Neutro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Forma de Tratamento
              </label>
              <select
                value={salutation}
                onChange={(e) => setSalutation(e.target.value as ContactSalutation)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
              >
                <option value="nome_proprio">Nome próprio (Sem pronome)</option>
                <option value="senhor">Senhor</option>
                <option value="senhora">Senhora</option>
                <option value="doutor">Doutor</option>
                <option value="doutora">Doutora</option>
                <option value="personalizado">Personalizado...</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Papel / Persona
              </label>
              <select
                value={personaRole}
                onChange={(e) => setPersonaRole(e.target.value as PersonaRole)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
              >
                <option value="proprietario">Proprietário / Dono (Decisor)</option>
                <option value="socio">Sócio (Decisor)</option>
                <option value="diretor">Diretor (Decisor)</option>
                <option value="gerente">Gerente (Decisor)</option>
                <option value="marketing">Marketing / Vendas</option>
                <option value="recepcao">Recepção / Atendimento</option>
                <option value="funcionario">Funcionário / Operacional</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          {salutation === 'personalizado' && (
            <div>
              <Input
                label="Tratamento Personalizado"
                value={customSalutation}
                onChange={(e) => setCustomSalutation(e.target.value)}
                placeholder="Ex: Prezado Colega, Ilustre Dr., Eng."
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Departamento"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Ex: Vendas, TI, Diretoria"
            leftIcon={<Users className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Indicado por (Origem de Indicação)"
            value={referredByName}
            onChange={(e) => setReferredByName(e.target.value)}
            placeholder="Ex: João Silva (Gerente TI)"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="WhatsApp"
            value={whatsapp}
            onChange={(e) => {
              setWhatsapp(e.target.value);
              if (!phone) setPhone(e.target.value);
            }}
            placeholder="Ex: +258 84 123 4567 ou (11) 98765-4321"
            leftIcon={<MessageSquare className="w-4 h-4 text-emerald-400" />}
          />

          <Input
            label="Telefone Fixo / Celular"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: 84 123 4567 ou (11) 3344-5566"
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="carlos@empresa.com"
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@perfil"
            leftIcon={<Instagram className="w-4 h-4 text-pink-400" />}
          />

          <Input
            label="LinkedIn"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="linkedin.com/in/perfil"
            leftIcon={<Linkedin className="w-4 h-4 text-blue-400" />}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
            />
            <span>Definir como Contacto Principal / Decisor desta empresa</span>
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Observações do Contacto</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Disponibilidade, preferências de canal, papel na decisão..."
            className="w-full px-3 py-2 bg-slate-900/70 border border-slate-700/80 rounded-xl text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {editingContact ? 'Salvar Alterações' : 'Adicionar Contacto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

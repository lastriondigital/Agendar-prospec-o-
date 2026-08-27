import React, { useState, useEffect } from 'react';
import { Instagram, Linkedin, Mail, MessageSquare, Phone, User, Users } from 'lucide-react';
import { Contact } from '../../types';
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
            placeholder="Ex: Diretor Comercial / Sócio"
          />
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

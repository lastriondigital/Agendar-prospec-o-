import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Phone, User } from 'lucide-react';
import { Contact } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  editingContact?: Contact | null;
  onSave: (contactData: Omit<Contact, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  editingContact,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || '');
      setRole(editingContact.role || '');
      setPhone(editingContact.phone || '');
      setWhatsapp(editingContact.whatsapp || '');
      setEmail(editingContact.email || '');
      setNotes(editingContact.notes || '');
    } else {
      setName('');
      setRole('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setNotes('');
    }
  }, [editingContact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        role: role.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        isPrimary: editingContact ? editingContact.isPrimary : false,
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
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome Completo *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Amanda Vasconcelos"
          required
          autoFocus
          leftIcon={<User className="w-4 h-4 text-slate-400" />}
        />

        <Input
          label="Cargo / Função"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Ex: Gerente de Compras / Decisor Técnico"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="WhatsApp"
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
        </div>

        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="amanda@empresa.com.br"
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Observações do Contacto</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
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

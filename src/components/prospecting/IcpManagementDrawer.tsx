import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Edit2,
  Globe,
  MapPin,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  X,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { IdealCustomerProfile, Service } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { IcpFormModal } from '../qualification/IcpFormModal';

interface IcpManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  icps: IdealCustomerProfile[];
  services: Service[];
  onSaveIcp: (icp: IdealCustomerProfile) => Promise<void>;
  onDeleteIcp: (id: string) => Promise<void>;
}

export const IcpManagementDrawer: React.FC<IcpManagementDrawerProps> = ({
  isOpen,
  onClose,
  icps,
  services,
  onSaveIcp,
  onDeleteIcp,
}) => {
  const [editingIcp, setEditingIcp] = useState<IdealCustomerProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateNew = () => {
    setEditingIcp(null);
    setIsFormOpen(true);
  };

  const handleEdit = (icp: IdealCustomerProfile) => {
    setEditingIcp(icp);
    setIsFormOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Perfis de Cliente Ideal (ICP)"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {icps.length} perfil(is) configurado(s)
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Fechar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateNew}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Novo Perfil ICP
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            Os Perfis de Cliente Ideal definem nichos prioritários, localização, faixas de porte e sinais procurados. O motor de scoring utiliza esses critérios para priorizar automaticamente seus leads.
          </p>

          {icps.length === 0 ? (
            <div className="p-8 text-center bg-[#FAFBFD] dark:bg-[#16191F] rounded-xl border border-[#E2E6EC] dark:border-[#272B33] space-y-3">
              <Target className="w-8 h-8 text-[#2563EB] mx-auto" />
              <h4 className="text-sm font-bold text-[#1E293B] dark:text-white">
                Nenhum perfil ICP configurado
              </h4>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                Crie um perfil para que os leads sejam pontuados com precisão matemática.
              </p>
              <Button variant="primary" size="sm" onClick={handleCreateNew}>
                Criar Primeiro ICP
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {icps.map((icp) => {
                return (
                  <div
                    key={icp.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#1E222A] border border-[#E2E6EC] dark:border-[#272B33] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1E293B] dark:text-white">
                          {icp.name}
                        </h4>
                        {icp.prospectingMode && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            {icp.prospectingMode === 'AMBOS' ? 'Ambos Modos' : icp.prospectingMode}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(icp)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteIcp(icp.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {icp.description && (
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        {icp.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] dark:text-[#94A3B8] pt-1 border-t border-[#E2E6EC] dark:border-[#272B33]">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Nichos: {icp.niches?.join(', ') || 'Todos'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {icp.country || icp.countries?.join(', ') || 'Brasil'}
                        {icp.regionOrCity ? ` (${icp.regionOrCity})` : ''}
                      </span>
                      {icp.employeeCountRange && (
                        <span>Porte: {icp.employeeCountRange} funcionários</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {isFormOpen && (
        <IcpFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          icp={editingIcp}
          availableServices={services}
          onSave={async (savedIcp) => {
            await onSaveIcp(savedIcp);
            setIsFormOpen(false);
          }}
        />
      )}
    </>
  );
};

import React, { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Cloud,
  RefreshCw,
  LogOut,
  Trash2,
  Lock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Zap,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { useConfirm } from '../../context/ConfirmDialogContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const AccountPanel: React.FC = () => {
  const {
    user,
    userProfile,
    isAnonymous,
    authState,
    authStateLabel,
    openAuthModal,
    logout,
    deleteAccount,
    updateUserProfile,
  } = useAuth();
  const { syncState, syncNow } = useSync();
  const confirm = useConfirm();
  const { success, error, info } = useToast();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile?.nome || user?.displayName || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Modal de Exclusão de Conta em 2 Etapas
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteLocalDataToo, setDeleteLocalDataToo] = useState(false);

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      error('Nome inválido', 'O nome não pode ficar em branco.');
      return;
    }
    setIsSavingName(true);
    try {
      await updateUserProfile({ nome: nameInput.trim() });
      setIsEditingName(false);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleLogoutConfirm = () => {
    confirm({
      title: 'Encerrar Sessão',
      message:
        'Deseja sair da sua conta? Todos os seus dados locais (prospects, mensagens, campanhas) continuarão salvos com segurança neste navegador.',
      confirmText: 'Sair da Conta',
      isDestructive: false,
      onConfirm: async () => {
        await logout();
      },
    });
  };

  const handleExecuteDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'EXCLUIR') {
      error('Confirmação necessária', 'Digite a palavra EXCLUIR para confirmar a exclusão.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        setIsDeleteModalOpen(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // 1. Visão de Usuário no MODO SEM CONTA / LOCAL (Anônimo ou não autenticado)
  if (!user || isAnonymous) {
    return (
      <Card padding="md" className="space-y-4 border-[#3F6FB5]/30 dark:border-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                  Conta & Acesso
                </h3>
                <Badge variant="blue" size="sm">
                  Modo Sem Conta (Local)
                </Badge>
              </div>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
                Você está utilizando o aplicativo livremente. Seus dados estão salvos localmente no navegador (IndexedDB).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openAuthModal('login')}
              leftIcon={<User className="w-3.5 h-3.5" />}
            >
              Já tenho Conta
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openAuthModal('register')}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Vincular / Criar Conta
            </Button>
          </div>
        </div>

        {/* Upgrade / Account Linking Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F6FB5] dark:text-blue-300">
            <ShieldCheck className="w-4 h-4 text-[#3F6FB5]" />
            <span>Sincronização em Nuvem Gratuita</span>
          </div>
          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
            Ao vincular uma conta de e-mail/senha ou Google, todas as empresas, prospects e modelos que você já criou serão transferidos automaticamente para a sua conta na nuvem, garantindo backup contínuo e acesso em outros dispositivos.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#5F6368] dark:text-[#9AA0A6] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#202124] dark:text-[#E8EAED]">Privacidade & Operação 100% Funcional:</strong> O aplicativo está completamente habilitado e desbloqueado para uso imediato em modo offline.
          </div>
        </div>
      </Card>
    );
  }

  // 2. Visão de Usuário AUTENTICADO
  const providerDisplay =
    userProfile?.provider === 'google'
      ? 'Google Authentication (OAuth)'
      : userProfile?.provider === 'password'
      ? 'E-mail e Senha'
      : 'Autenticação Anônima';

  return (
    <Card padding="md" className="space-y-5">
      {/* Header com Avatar e Identificação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ECEEF1] dark:border-[#2D3139]">
        <div className="flex items-center gap-3.5">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Avatar'}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover border border-[#E6E8EB] dark:border-[#2D3139] shadow-xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-[#3F6FB5] text-white text-lg font-bold flex items-center justify-center shadow-xs">
              {(userProfile?.nome || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#202124] dark:text-[#E8EAED]">
                {userProfile?.nome || user.displayName || 'Minha Conta'}
              </h3>
              <Badge variant="emerald" size="sm">
                Autenticado
              </Badge>
            </div>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={syncNow}
            disabled={syncState.status === 'syncing' || !syncState.isOnline}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${syncState.status === 'syncing' ? 'animate-spin' : ''}`} />}
          >
            Sincronizar Agora
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleLogoutConfirm}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sair da Conta
          </Button>
        </div>
      </div>

      {/* Grid de Metadados da Conta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139]">
          <span className="text-[#80868B] block mb-1">Método de Login:</span>
          <div className="flex items-center gap-1.5 font-semibold text-[#202124] dark:text-[#E8EAED]">
            <ShieldCheck className="w-4 h-4 text-[#3F6FB5]" />
            <span className="truncate">{providerDisplay}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139]">
          <span className="text-[#80868B] block mb-1">Status da Nuvem:</span>
          <div className="flex items-center gap-1.5 font-semibold text-[#202124] dark:text-[#E8EAED]">
            {syncState.isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Online & Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139]">
          <span className="text-[#80868B] block mb-1">Última Sincronização:</span>
          <p className="font-semibold text-[#202124] dark:text-[#E8EAED]">
            {syncState.lastSyncedAt
              ? new Date(syncState.lastSyncedAt).toLocaleString('pt-BR')
              : 'Pendente'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139]">
          <span className="text-[#80868B] block mb-1">Identificador de Usuário (UID):</span>
          <p className="font-mono text-[11px] text-[#5F6368] dark:text-[#9AA0A6] truncate" title={user.uid}>
            {user.uid}
          </p>
        </div>
      </div>

      {/* Edição de Nome do Usuário */}
      <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6]">
            Informações do Perfil
          </h4>
          {!isEditingName && (
            <button
              onClick={() => {
                setNameInput(userProfile?.nome || user.displayName || '');
                setIsEditingName(true);
              }}
              className="text-xs text-[#3F6FB5] dark:text-blue-400 hover:underline font-medium cursor-pointer"
            >
              Editar Nome
            </button>
          )}
        </div>

        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Digite seu nome completo"
              className="max-w-md"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveName}
              disabled={isSavingName}
            >
              Salvar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingName(false)}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="text-xs text-[#202124] dark:text-[#E8EAED]">
            Nome Cadastrado: <strong>{userProfile?.nome || user.displayName || 'Não definido'}</strong>
          </div>
        )}
      </div>

      {/* Zona de Perigo / Exclusão de Conta */}
      <div className="pt-4 border-t border-[#ECEEF1] dark:border-[#2D3139] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">
            Zona de Segurança & Exclusão de Conta
          </h4>
          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
            Exclui permanentemente sua conta no Supabase Auth e seu perfil na nuvem.
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            setDeleteConfirmationText('');
            setIsDeleteModalOpen(true);
          }}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Excluir Minha Conta
        </Button>
      </div>

      {/* Modal de Exclusão de Conta com Confirmação Explícita */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Conta de Acesso"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-rose-800 dark:text-rose-300 space-y-1">
              <strong className="block font-bold">Atenção: Ação Irreversível!</strong>
              <p>
                Ao excluir sua conta, suas credenciais de acesso e perfil serão permanentemente removidos do Supabase Auth.
              </p>
            </div>
          </div>

          <div className="space-y-2 p-3 bg-[#F7F8FA] dark:bg-[#1E2228] rounded-xl border border-[#E6E8EB] dark:border-[#2D3139]">
            <h5 className="font-bold text-[#202124] dark:text-[#E8EAED]">
              O que acontecerá com meus dados?
            </h5>
            <ul className="list-disc pl-4 space-y-1 text-[#5F6368] dark:text-[#9AA0A6]">
              <li><strong>Conta na Nuvem:</strong> Será excluída imediatamente do servidor de autenticação.</li>
              <li><strong>Dados Locais (Neste Navegador):</strong> Suas empresas, prospects e mensagens salvas continuarão acessíveis localmente através do modo offline.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-[#202124] dark:text-[#E8EAED]">
              Para confirmar, digite exatamente a palavra <span className="font-mono text-rose-600 font-bold">EXCLUIR</span> abaixo:
            </label>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Digite EXCLUIR para confirmar"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECEEF1] dark:border-[#2D3139]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleExecuteDeleteAccount}
              disabled={deleteConfirmationText.trim().toUpperCase() !== 'EXCLUIR' || isDeleting}
              leftIcon={isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            >
              {isDeleting ? 'Excluindo Conta...' : 'Confirmar Exclusão Definitiva'}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

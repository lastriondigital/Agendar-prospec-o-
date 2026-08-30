import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Download,
  FileSpreadsheet,
  HardDrive,
  Moon,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  User,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { usePWA } from '../hooks/usePWA';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { ImportBackupModal } from '../components/settings/ImportBackupModal';
import { ProductionAuditModal } from '../components/audit/ProductionAuditModal';
import { AccountPanel } from '../components/account/AccountPanel';
import { CommercialPersonalizationPanel } from '../components/settings/CommercialPersonalizationPanel';
import {
  exportCompaniesCSV,
  exportActionsCSV,
  exportHistoryCSV,
} from '../services/backupService';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    campaigns,
    actions,
    companies,
    contacts,
    leads,
    history,
    loadDemoData,
    clearAllData,
    exportJSON,
    importJSON,
    openTutorial,
  } = useApp();
  const { user, openAuthModal, logout } = useAuth();
  const { syncState, conflicts, openConflictModal, syncNow } = useSync();
  const { theme, setTheme } = useTheme();
  const confirm = useConfirm();
  const { success, error } = useToast();
  const { isInstallable, isInstalled, hasUpdate, isOffline, promptInstall, applyUpdate } = usePWA();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal || 15);
  const [estMinutes, setEstMinutes] = useState(settings.estMinutesPerAction || 2);

  const handleSavePreferences = async () => {
    await updateSettings({
      dailyGoal: Number(dailyGoal),
      estMinutesPerAction: Number(estMinutes),
    });
    success('Preferências salvas com sucesso!');
  };

  const handleExportBackupJSON = async () => {
    try {
      const jsonStr = await exportJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prospect-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      success('Backup JSON completo baixado com sucesso!');
    } catch (err) {
      error('Falha ao exportar backup', (err as Error).message);
    }
  };

  const handleExportCompaniesCSV = () => {
    try {
      exportCompaniesCSV(companies, contacts, leads);
      success('Planilha CSV de Empresas e Leads exportada com sucesso!');
    } catch (err) {
      error('Erro ao exportar CSV', (err as Error).message);
    }
  };

  const handleExportActionsCSV = () => {
    try {
      exportActionsCSV(actions, companies, contacts);
      success('Planilha CSV da Fila de Ações exportada com sucesso!');
    } catch (err) {
      error('Erro ao exportar CSV', (err as Error).message);
    }
  };

  const handleExportHistoryCSV = () => {
    try {
      exportHistoryCSV(history, companies, contacts);
      success('Planilha CSV do Histórico exportada com sucesso!');
    } catch (err) {
      error('Erro ao exportar CSV', (err as Error).message);
    }
  };

  const handleConfirmImport = async (
    jsonStr: string,
    mode: 'overwrite' | 'merge'
  ): Promise<boolean> => {
    const res = await importJSON(jsonStr, { mode });
    return res.success;
  };

  const handleLoadDemo = () => {
    confirm({
      title: 'Carregar Dados de Demonstração',
      message:
        'Isso irá carregar uma base de demonstração (empresas, leads, serviços, scripts e ações) para você testar todas as funcionalidades do LEADION.',
      isDestructive: false,
      confirmText: 'Carregar Demonstração',
      onConfirm: async () => {
        await loadDemoData(true);
      },
    });
  };

  const handleClearAll = () => {
    confirm({
      title: 'Limpar Todos os Dados Locais',
      message:
        'Atenção: Esta ação apagará todas as empresas, leads, campanhas e ações salvas localmente no navegador. Deseja prosseguir?',
      isDestructive: true,
      confirmText: 'Sim, Apagar Tudo',
      onConfirm: async () => {
        await clearAllData();
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#202124] dark:text-[#E8EAED]">
          Configurações & Hardening de Produção
        </h2>
        <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
          Gerencie PWA, backups em múltiplos formatos, persistência IndexedDB, Cloud Sync e segurança.
        </p>
      </div>

      {/* PWA & Offline Readiness Card */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
                <span>Progressive Web App (PWA) & Offline Shell</span>
                {isInstalled ? (
                  <Badge variant="emerald" size="sm">App Instalado</Badge>
                ) : (
                  <Badge variant="blue" size="sm">Pronto para Instalação</Badge>
                )}
              </h3>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                Service Worker ativo com cache de ativos estáticos, navegação rápida e operação offline resiliente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasUpdate && (
              <Button
                variant="primary"
                size="sm"
                onClick={applyUpdate}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Atualizar App
              </Button>
            )}

            {isInstallable && (
              <Button
                variant="primary"
                size="sm"
                onClick={promptInstall}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Instalar no Dispositivo
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] text-xs">
          <div>
            <span className="text-[#80868B]">Service Worker:</span>
            <div className="flex items-center gap-1.5 font-semibold text-[#202124] dark:text-[#E8EAED] mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ativo (Cache v5.0.0)</span>
            </div>
          </div>

          <div>
            <span className="text-[#80868B]">Modo de Operação:</span>
            <div className="flex items-center gap-1.5 font-semibold text-[#202124] dark:text-[#E8EAED] mt-1">
              {isOffline ? (
                <>
                  <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Offline (Dados locais seguros)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Online & Conectado</span>
                </>
              )}
            </div>
          </div>

          <div>
            <span className="text-[#80868B]">Modo de Exibição:</span>
            <p className="font-semibold text-[#202124] dark:text-[#E8EAED] mt-1">
              {isInstalled ? 'Standalone (Janela Nativa)' : 'Navegador Web / PWA Host'}
            </p>
          </div>
        </div>
      </Card>

      {/* Account, Authentication & Cloud Sync Panel */}
      <AccountPanel />

      {/* Personalização Comercial & Mercados */}
      <Card padding="md">
        <CommercialPersonalizationPanel />
      </Card>

      {/* Conflict Alert Banner if any */}
      {conflicts.length > 0 && (
        <Card padding="md" className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>{conflicts.length} conflito(s)</strong> precisam da sua revisão para consolidar as versões local e nuvem.
              </span>
            </div>
            <Button variant="secondary" size="xs" onClick={openConflictModal}>
              Revisar Conflitos
            </Button>
          </div>
        </Card>
      )}

      {/* Backup, Validation & Multi-Format Exports */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                Central de Backup & Exportações
              </h3>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                Exporte relatórios CSV para planilhas ou faça backup integral com validação de esquema.
              </p>
            </div>
          </div>
          <Badge variant="purple" size="sm">
            Integridade Protegida
          </Badge>
        </div>

        {/* DB Volume Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] text-center text-xs">
          <div>
            <span className="text-[#80868B]">Empresas:</span>
            <p className="font-mono font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5">{companies.length}</p>
          </div>
          <div>
            <span className="text-[#80868B]">Contatos:</span>
            <p className="font-mono font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5">{contacts.length}</p>
          </div>
          <div>
            <span className="text-[#80868B]">Leads:</span>
            <p className="font-mono font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5">{leads.length}</p>
          </div>
          <div>
            <span className="text-[#80868B]">Ações:</span>
            <p className="font-mono font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5">{actions.length}</p>
          </div>
          <div>
            <span className="text-[#80868B]">Campanhas:</span>
            <p className="font-mono font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5">{campaigns.length}</p>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
            Exportações em CSV (Compatível com Excel & Google Sheets)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCompaniesCSV}
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            >
              CSV Empresas & Leads
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportActionsCSV}
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            >
              CSV Fila de Ações
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportHistoryCSV}
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            >
              CSV Histórico Interações
            </Button>
          </div>

          <div className="text-xs font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider pt-3 border-t border-[#ECEEF1] dark:border-[#2D3139]">
            Backup Estruturado JSON & Restauração
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportBackupJSON}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Baixar Backup JSON Completo
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Restaurar com Validação
            </Button>
          </div>
        </div>
      </Card>

      {/* Theme and Preferences */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">Aparência & Metas de Execução</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Claro (Light)', icon: <Sun className="w-4 h-4" /> },
            { id: 'dark', label: 'Escuro (Dark)', icon: <Moon className="w-4 h-4" /> },
            { id: 'system', label: 'Automático (Sistema)', icon: <RefreshCw className="w-4 h-4" /> },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id as any)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                theme === opt.id
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-[#3F6FB5] dark:border-blue-500 text-[#3F6FB5] dark:text-blue-300 font-bold shadow-xs'
                  : 'bg-white dark:bg-[#1E2228] border-[#E6E8EB] dark:border-[#2D3139] text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-[#ECEEF1] dark:border-[#2D3139] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Meta Diária de Prospecções Padrão"
            type="number"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
          />
          <Input
            label="Tempo Estimado por Ação (minutos)"
            type="number"
            value={estMinutes}
            onChange={(e) => setEstMinutes(Number(e.target.value))}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="sm" onClick={handleSavePreferences}>
            Salvar Preferências
          </Button>
        </div>
      </Card>

      {/* Demo Data Management */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Gerenciamento de Base de Dados & Onboarding
        </h3>
        <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
          O LEADION mantém sua base real limpa. Dados de demonstração servem apenas para testes, estudos de recursos e exploração temporária.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={openTutorial}
            leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
          >
            Reabrir Guia do Leadion (8 Etapas)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadDemo}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Carregar Dados de Demonstração
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleClearAll}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Limpar Base Local
          </Button>
        </div>
      </Card>

      {/* Production Audit & Diagnostics Card */}
      <Card padding="md" className="space-y-4 border-[#3F6FB5]/40 dark:border-blue-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
                <span>Auditoria Completa de Produção & Verificação de 24 Passos</span>
                <Badge variant="emerald" size="sm">
                  READY
                </Badge>
              </h3>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
                Executa a suíte de testes de ponta a ponta: 24 passos operacionais, resiliência offline, anti-duplicação, segurança do Gemini e integridade de dados.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAuditModalOpen(true)}
            leftIcon={<Zap className="w-4 h-4 fill-white" />}
          >
            Ver Relatório de Auditoria
          </Button>
        </div>
      </Card>

      {/* Import Modal */}
      <ImportBackupModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirmImport={handleConfirmImport}
      />

      {/* Production Audit Modal */}
      <ProductionAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};

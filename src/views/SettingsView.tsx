import React, { useRef, useState } from 'react';
import {
  Cloud,
  Database,
  Download,
  Flame,
  HardDrive,
  Moon,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    clients,
    campaigns,
    services,
    templates,
    actions,
    loadDemoData,
    clearAllData,
    exportJSON,
    importJSON,
    isDemoMode,
  } = useApp();
  const { theme, setTheme } = useTheme();
  const confirm = useConfirm();
  const { success, error } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal || 15);
  const [estMinutes, setEstMinutes] = useState(settings.estMinutesPerAction || 2);

  const handleSavePreferences = async () => {
    await updateSettings({
      dailyGoal: Number(dailyGoal),
      estMinutesPerAction: Number(estMinutes),
    });
  };

  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prospect-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      success('Backup JSON baixado com sucesso!');
    } catch (err) {
      error('Falha ao exportar backup', (err as Error).message);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        confirm({
          title: 'Restaurar Backup JSON',
          message: 'Deseja sobrescrever os dados locais pelos dados contidos neste arquivo de backup?',
          isDestructive: false,
          confirmText: 'Restaurar Dados',
          onConfirm: async () => {
            await importJSON(content);
          },
        });
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    confirm({
      title: 'Carregar Dados de Demonstração',
      message: 'Isso irá carregar uma base de demonstração (clientes, serviços, scripts e ações) para você testar todas as funcionalidades do PROSPECT OS.',
      isDestructive: false,
      confirmText: 'Carregar Demonstração',
      onConfirm: async () => {
        await loadDemoData(true);
      },
    });
  };

  const handleClearAll = () => {
    confirm({
      title: 'Limpar Todos os Dados',
      message: 'Atenção: Esta ação apagará todos os clientes, campanhas, mensagens e ações salvas localmente no seu navegador para você começar do zero absoluto. Deseja prosseguir?',
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
        <h2 className="text-xl font-bold text-neutral-100">Configurações & Banco Local</h2>
        <p className="text-xs text-neutral-400">
          Gerencie persistência IndexedDB, backup de dados, preferências de foco e arquitetura offline.
        </p>
      </div>

      {/* Theme and Execution Preferences */}
      <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-neutral-100">Aparência & Tema</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'dark', label: 'Escuro (Pro Focus)', icon: <Moon className="w-4 h-4" /> },
            { id: 'light', label: 'Claro (Light)', icon: <Sun className="w-4 h-4" /> },
            { id: 'system', label: 'Automático (Sistema)', icon: <RefreshCw className="w-4 h-4" /> },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id as any)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                theme === opt.id
                  ? 'bg-neutral-800 border-emerald-500 text-emerald-400 font-bold'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Database & Persistence Status */}
      <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">Armazenamento Local (IndexedDB)</h3>
              <p className="text-xs text-neutral-400">
                Os dados residem 100% no seu dispositivo com suporte total offline e PWA.
              </p>
            </div>
          </div>
          <Badge variant="emerald" size="sm">
            Ativo & Seguro
          </Badge>
        </div>

        {/* DB Volume Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-center text-xs">
          <div>
            <span className="text-neutral-500">Clientes:</span>
            <p className="font-mono font-bold text-neutral-200 mt-0.5">{clients.length}</p>
          </div>
          <div>
            <span className="text-neutral-500">Ações na Fila:</span>
            <p className="font-mono font-bold text-neutral-200 mt-0.5">{actions.length}</p>
          </div>
          <div>
            <span className="text-neutral-500">Scripts:</span>
            <p className="font-mono font-bold text-neutral-200 mt-0.5">{templates.length}</p>
          </div>
          <div>
            <span className="text-neutral-500">Campanhas:</span>
            <p className="font-mono font-bold text-neutral-200 mt-0.5">{campaigns.length}</p>
          </div>
          <div>
            <span className="text-neutral-500">Serviços:</span>
            <p className="font-mono font-bold text-neutral-200 mt-0.5">{services.length}</p>
          </div>
        </div>

        {/* Backup Export / Import */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBackup}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar Backup JSON
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Restaurar Backup JSON
          </Button>
        </div>
      </Card>

      {/* Demo Data Management */}
      <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Gerenciamento de Base de Dados
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          O PROSPECT OS separa claramente dados de demonstração para exploração de novos usuários e a base de dados real.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadDemo}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Recarregar Dados de Demonstração
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleClearAll}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Limpar Base para Iniciar em Branco
          </Button>
        </div>
      </Card>

      {/* Future Roadmap / Architecture Readiness Badge */}
      <Card padding="md" className="bg-neutral-900/60 border-neutral-800/80 space-y-3">
        <h3 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-indigo-400" />
          Prontidão de Arquitetura para Futuras Fases
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-400">
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-neutral-200">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Firebase / Cloud Sync</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Camada de abstração <code className="text-neutral-300">IStorageAdapter</code> pronta para acoplar sincronização em nuvem e autenticação sem reescrever telas.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-neutral-200">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Gemini AI Copilot</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Modelos de dados preparados com campos semânticos para geração de scripts personalizados e qualificação inteligente de leads.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

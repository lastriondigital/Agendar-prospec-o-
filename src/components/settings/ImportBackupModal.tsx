import React, { useState, useRef } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileCheck2,
  FileCode,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Layers,
  MessageSquare,
  ShieldCheck,
  Target,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  BackupValidationResult,
  validateBackupJSON,
} from '../../services/backupService';
import { useToast } from '../../context/ToastContext';

interface ImportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (
    jsonStr: string,
    mode: 'overwrite' | 'merge'
  ) => Promise<boolean>;
}

export const ImportBackupModal: React.FC<ImportBackupModalProps> = ({
  isOpen,
  onClose,
  onConfirmImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawContent, setRawContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validation, setValidation] = useState<BackupValidationResult | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [isProcessing, setIsProcessing] = useState(false);
  const { error } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      error('Formato inválido', 'Selecione um arquivo de backup com extensão .json');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawContent(content);
      const result = validateBackupJSON(content);
      setValidation(result);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleReset = () => {
    setRawContent('');
    setFileName('');
    setValidation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = async () => {
    if (!rawContent || !validation?.valid) return;
    setIsProcessing(true);
    try {
      const ok = await onConfirmImport(rawContent, importMode);
      if (ok) {
        handleReset();
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isProcessing) {
          handleReset();
          onClose();
        }
      }}
      title="Restaurar e Validar Backup JSON"
      size="lg"
    >
      <div className="space-y-5">
        {!validation ? (
          /* File Upload Dropzone */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 dark:border-neutral-800 dark:hover:border-emerald-500/60 light:border-slate-300 light:hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/80 dark:bg-neutral-950/50 light:bg-slate-50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-100 dark:text-neutral-100 light:text-slate-900 mb-1">
              Selecione ou arraste o arquivo .json de backup
            </h4>
            <p className="text-xs text-slate-400 dark:text-neutral-400 light:text-slate-500 max-w-sm mx-auto">
              O LEADION validará a integridade do arquivo e sanitizará todos os dados antes de gravar no banco local.
            </p>
          </div>
        ) : (
          /* Validation & Preview Summary */
          <div className="space-y-4">
            {/* File Info Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 dark:bg-neutral-950 dark:border-neutral-800 light:bg-slate-100 light:border-slate-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCode className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-200 dark:text-neutral-200 light:text-slate-800 truncate">
                  {fileName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleReset}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Trocar arquivo
              </Button>
            </div>

            {/* Validation Errors if any */}
            {!validation.valid ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Arquivo Inválido ou Incompatível</span>
                </div>
                <ul className="text-xs space-y-1 list-disc pl-5 text-rose-300/90">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                {/* Clean Status Badge */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Arquivo validado com sucesso. Pronto para restauração segura.</span>
                </div>

                {/* Entity Summary Grid */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Registros identificados no backup:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 dark:bg-neutral-950 dark:border-neutral-800 light:bg-slate-50 light:border-slate-200 text-center">
                      <Building2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-slate-100 dark:text-neutral-100 light:text-slate-900">
                        {validation.summary.companiesCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Empresas</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 dark:bg-neutral-950 dark:border-neutral-800 light:bg-slate-50 light:border-slate-200 text-center">
                      <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-slate-100 dark:text-neutral-100 light:text-slate-900">
                        {validation.summary.contactsCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Contatos</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 dark:bg-neutral-950 dark:border-neutral-800 light:bg-slate-50 light:border-slate-200 text-center">
                      <Layers className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-slate-100 dark:text-neutral-100 light:text-slate-900">
                        {validation.summary.leadsCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Leads no Funil</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 dark:bg-neutral-950 dark:border-neutral-800 light:bg-slate-50 light:border-slate-200 text-center">
                      <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-slate-100 dark:text-neutral-100 light:text-slate-900">
                        {validation.summary.actionsCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Ações na Fila</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 dark:bg-neutral-950 dark:border-neutral-800 light:bg-slate-50 light:border-slate-200 text-center">
                      <MessageSquare className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-slate-100 dark:text-neutral-100 light:text-slate-900">
                        {validation.summary.templatesCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Scripts & Msg</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 dark:bg-neutral-950 dark:border-neutral-800 light:bg-slate-50 light:border-slate-200 text-center">
                      <Target className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-slate-100 dark:text-neutral-100 light:text-slate-900">
                        {validation.summary.campaignsCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Campanhas</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 dark:bg-neutral-950 dark:border-neutral-800 light:bg-slate-50 light:border-slate-200 text-center col-span-2">
                      <HelpCircle className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-slate-100 dark:text-neutral-100 light:text-slate-900">
                        {validation.summary.servicesCount + validation.summary.objectionsCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Serviços & Objeções</div>
                    </div>
                  </div>
                </div>

                {/* Warnings if any */}
                {validation.warnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs max-h-24 overflow-y-auto">
                    <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{validation.warnings.length} ajustes automáticos aplicados:</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-amber-300/80">
                      {validation.warnings.slice(0, 4).map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                      {validation.warnings.length > 4 && (
                        <li>e mais {validation.warnings.length - 4} avisos...</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Import Mode Selector */}
                <div className="pt-2 border-t border-slate-800 dark:border-neutral-800 light:border-slate-200">
                  <div className="text-xs font-bold text-slate-300 dark:text-neutral-300 light:text-slate-700 mb-2">
                    Modo de Restauração:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setImportMode('overwrite')}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        importMode === 'overwrite'
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-100 ring-1 ring-emerald-500/30'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'overwrite'}
                        onChange={() => setImportMode('overwrite')}
                        className="mt-1 accent-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-100 dark:text-neutral-100 light:text-slate-900">
                          Substituir Tudo (Recomendado)
                        </div>
                        <div className="text-[11px] text-slate-400 leading-relaxed">
                          Limpa o banco local antes de restaurar o snapshot completo exato.
                        </div>
                      </div>
                    </label>

                    <label
                      onClick={() => setImportMode('merge')}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        importMode === 'merge'
                          ? 'bg-blue-500/10 border-blue-500/50 text-slate-100 ring-1 ring-blue-500/30'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="mt-1 accent-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-100 dark:text-neutral-100 light:text-slate-900">
                          Mesclar Dados (Merge)
                        </div>
                        <div className="text-[11px] text-slate-400 leading-relaxed">
                          Adiciona novos registros sem apagar os dados existentes neste navegador.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800 dark:border-neutral-800 light:border-slate-200">
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              handleReset();
              onClose();
            }}
            disabled={isProcessing}
          >
            Cancelar
          </Button>

          {validation?.valid && (
            <Button
              variant="primary"
              size="md"
              onClick={handleExecuteImport}
              isLoading={isProcessing}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {importMode === 'overwrite' ? 'Confirmar e Substituir Tudo' : 'Confirmar e Mesclar'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

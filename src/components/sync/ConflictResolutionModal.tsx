import React, { useState } from 'react';
import { useSync } from '../../context/SyncContext';
import { SyncConflict } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Cloud,
  X,
  ChevronRight,
  ArrowRightLeft,
  Copy,
  Layers,
} from 'lucide-react';

export const ConflictResolutionModal: React.FC = () => {
  const { conflicts, isConflictModalOpen, closeConflictModal, resolveConflict } = useSync();
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  if (!isConflictModalOpen || conflicts.length === 0) return null;

  const currentConflict: SyncConflict =
    conflicts.find((c) => c.id === selectedConflictId) || conflicts[0];

  const handleResolve = async (resolution: 'keep_local' | 'keep_remote' | 'keep_both') => {
    if (!currentConflict) return;
    setIsResolving(true);
    try {
      await resolveConflict(currentConflict.id, resolution);
      // Select next conflict if available
      const remaining = conflicts.filter((c) => c.id !== currentConflict.id);
      if (remaining.length > 0) {
        setSelectedConflictId(remaining[0].id);
      } else {
        closeConflictModal();
      }
    } finally {
      setIsResolving(false);
    }
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return 'Data não informada';
    return new Date(ts).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getEntityLabel = (entity: string) => {
    const map: Record<string, string> = {
      companies: 'Empresa',
      contacts: 'Contacto',
      leads: 'Lead / Oportunidade',
      campaigns: 'Campanha',
      services: 'Serviço',
      templates: 'Modelo de Mensagem',
      actions: 'Ação / Tarefa',
      history: 'Evento de Histórico',
      abTests: 'Teste A/B',
    };
    return map[entity] || entity;
  };

  return (
    <div
      id="conflict-resolution-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeConflictModal();
      }}
    >
      <div
        id="conflict-modal-card"
        className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-900/50 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Resolução de Conflitos de Sincronização
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                  {conflicts.length} {conflicts.length === 1 ? 'pendente' : 'pendentes'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Alterações simultâneas foram detectadas. Escolha como deseja consolidar seus dados.
              </p>
            </div>
          </div>
          <button
            id="close-conflict-modal-btn"
            onClick={closeConflictModal}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content with Split View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Conflict Selector if multiple */}
          {conflicts.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-400 shrink-0">Itens em conflito:</span>
              {conflicts.map((c, index) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConflictId(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition flex items-center gap-1.5 ${
                    (selectedConflictId || conflicts[0].id) === c.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{getEntityLabel(c.entityType)}</span>
                  <span className="opacity-70 text-[10px]">#{index + 1}</span>
                </button>
              ))}
            </div>
          )}

          {/* Current Conflict Details */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {getEntityLabel(currentConflict.entityType)}
                </p>
                <p className="text-xs text-slate-400 font-mono">ID: {currentConflict.entityId}</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              <span>Detectado em: </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatTimestamp(currentConflict.detectedAt)}
              </span>
            </div>
          </div>

          {/* Side by Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local Version */}
            <div className="rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  <Database className="w-4 h-4" />
                  <span>Versão Local (Dispositivo)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimestamp(currentConflict.localData?.updatedAt)}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-56 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(currentConflict.localData, null, 2)}
                </pre>
              </div>

              <button
                id="keep-local-btn"
                disabled={isResolving}
                onClick={() => handleResolve('keep_local')}
                className="mt-4 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Manter Versão Local (Substituir Nuvem)
              </button>
            </div>

            {/* Remote Version */}
            <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  <Cloud className="w-4 h-4" />
                  <span>Versão Nuvem (Firestore)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimestamp(currentConflict.remoteData?.updatedAt)}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-56 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(currentConflict.remoteData, null, 2)}
                </pre>
              </div>

              <button
                id="keep-remote-btn"
                disabled={isResolving}
                onClick={() => handleResolve('keep_remote')}
                className="mt-4 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Manter Versão Nuvem (Substituir Local)
              </button>
            </div>
          </div>

          {/* Third option: Keep Both */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Copy className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Não tem certeza? Mantenha ambos os registros
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cria uma cópia do registro local com identificador único para que nenhum dado se perca.
                </p>
              </div>
            </div>
            <button
              id="keep-both-btn"
              disabled={isResolving}
              onClick={() => handleResolve('keep_both')}
              className="py-2 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-lg transition shrink-0"
            >
              Duplicar e Manter Ambos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

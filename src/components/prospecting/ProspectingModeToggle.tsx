import React from 'react';
import { Target, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { ProspectingMode } from '../../types';

interface ProspectingModeToggleProps {
  currentMode: ProspectingMode;
  onChangeMode: (mode: ProspectingMode) => void;
  demandaCount: number;
  latenteCount: number;
}

export const ProspectingModeToggle: React.FC<ProspectingModeToggleProps> = ({
  currentMode,
  onChangeMode,
  demandaCount,
  latenteCount,
}) => {
  return (
    <div className="w-full bg-[#F4F6F9] dark:bg-[#15181E] p-1.5 rounded-2xl border border-[#E2E6EC] dark:border-[#272B33]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {/* MODO 1: DEMANDA IDENTIFICADA */}
        <button
          type="button"
          onClick={() => onChangeMode('DEMANDA_IDENTIFICADA')}
          className={`flex items-center justify-between p-3.5 rounded-xl transition-all text-left ${
            currentMode === 'DEMANDA_IDENTIFICADA'
              ? 'bg-white dark:bg-[#1E222A] text-[#1E293B] dark:text-white shadow-xs border border-[#CBD5E1] dark:border-[#334155]'
              : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-white/60 dark:hover:bg-[#1E222A]/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                currentMode === 'DEMANDA_IDENTIFICADA'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
                  : 'bg-slate-100 dark:bg-[#252B35] text-slate-500'
              }`}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight">DEMANDA IDENTIFICADA</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    currentMode === 'DEMANDA_IDENTIFICADA'
                      ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {demandaCount}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 line-clamp-1">
                Sites, Design & GMB com sinais claros de problema
              </p>
            </div>
          </div>
        </button>

        {/* MODO 2: OPORTUNIDADE LATENTE */}
        <button
          type="button"
          onClick={() => onChangeMode('OPORTUNIDADE_LATENTE')}
          className={`flex items-center justify-between p-3.5 rounded-xl transition-all text-left ${
            currentMode === 'OPORTUNIDADE_LATENTE'
              ? 'bg-white dark:bg-[#1E222A] text-[#1E293B] dark:text-white shadow-xs border border-[#CBD5E1] dark:border-[#334155]'
              : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-white/60 dark:hover:bg-[#1E222A]/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                currentMode === 'OPORTUNIDADE_LATENTE'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                  : 'bg-slate-100 dark:bg-[#252B35] text-slate-500'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight">OPORTUNIDADE LATENTE</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    currentMode === 'OPORTUNIDADE_LATENTE'
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {latenteCount}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 line-clamp-1">
                Hipóteses de APP & SaaS a investigar
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

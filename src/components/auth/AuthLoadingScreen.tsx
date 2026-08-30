import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { LeadionLogo } from '../common/LeadionLogo';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 px-4 select-none">
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* App Logo */}
        <div className="mb-4">
          <LeadionLogo size="xl" showText={false} />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
          LEADION
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium">
          Prospecção Comercial & Automação de Agendamentos
        </p>

        {/* Loading Spinner */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-medium text-slate-600 dark:text-slate-300">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Verificando sessão segura...</span>
        </div>

        {/* Security badge footer */}
        <div className="mt-12 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Ambiente com autenticação criptografada</span>
        </div>
      </div>
    </div>
  );
};

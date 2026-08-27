import React from 'react';
import { Zap, ShieldCheck, RefreshCw } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F7F8FA] dark:bg-[#121417] text-[#202124] dark:text-[#E8EAED] px-4 select-none">
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* App Logo */}
        <div className="w-14 h-14 rounded-2xl bg-[#3F6FB5] flex items-center justify-center text-white shadow-lg mb-6 ring-4 ring-blue-500/10">
          <Zap className="w-7 h-7 fill-white" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold tracking-tight text-[#202124] dark:text-[#E8EAED] mb-1">
          Agendador de Mensagens
        </h1>
        <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mb-8 font-medium">
          PROSPECT OS • Prospecção & Automação Comercial
        </p>

        {/* Loading Spinner */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-[#1C2026] border border-[#E6E8EB] dark:border-[#2D3139] shadow-xs text-xs font-medium text-[#5F6368] dark:text-[#9AA0A6]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3F6FB5]" />
          <span>Verificando sessão segura...</span>
        </div>

        {/* Security badge footer */}
        <div className="mt-12 flex items-center gap-1.5 text-[11px] text-[#80868B]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Ambiente com autenticação criptografada</span>
        </div>
      </div>
    </div>
  );
};

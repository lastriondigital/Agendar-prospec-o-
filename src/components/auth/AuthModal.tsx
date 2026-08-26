import React, { useState } from 'react';
import { useAuth, AuthModalMode } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import {
  Lock,
  Mail,
  User,
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    resetPassword,
  } = useAuth();
  const { syncNow } = useSync();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (authModalMode === 'login') {
        if (!email.trim() || !password.trim()) {
          setFormError('Preencha seu e-mail e senha.');
          setIsSubmitting(false);
          return;
        }
        const res = await login(email, password);
        if (!res.success) {
          setFormError(res.error || 'Erro ao realizar login.');
        } else {
          // Trigger sync immediately upon login
          setTimeout(() => syncNow(), 500);
        }
      } else if (authModalMode === 'register') {
        if (!email.trim() || !password.trim()) {
          setFormError('Preencha seu e-mail e senha.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setFormError('A senha deve ter no mínimo 6 caracteres.');
          setIsSubmitting(false);
          return;
        }
        const res = await register(email, password, displayName);
        if (!res.success) {
          setFormError(res.error || 'Erro ao criar conta.');
        } else {
          setTimeout(() => syncNow(), 500);
        }
      } else if (authModalMode === 'forgot_password') {
        if (!email.trim()) {
          setFormError('Informe o e-mail cadastrado para recuperação.');
          setIsSubmitting(false);
          return;
        }
        const res = await resetPassword(email);
        if (!res.success) {
          setFormError(res.error || 'Erro ao solicitar recuperação.');
        } else {
          setResetSent(true);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="relative p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {authModalMode === 'login' && 'Entrar na Nuvem'}
                {authModalMode === 'register' && 'Criar Conta Cloud'}
                {authModalMode === 'forgot_password' && 'Recuperar Acesso'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sincronize seus prospects com segurança no Firestore
              </p>
            </div>
          </div>
          <button
            id="close-auth-modal-button"
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Mode Switcher Tabs */}
          {authModalMode !== 'forgot_password' && (
            <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                id="tab-login-btn"
                onClick={() => {
                  setFormError(null);
                  openAuthModal('login');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  authModalMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Acessar Conta
              </button>
              <button
                type="button"
                id="tab-register-btn"
                onClick={() => {
                  setFormError(null);
                  openAuthModal('register');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  authModalMode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>
          )}

          {/* Form Alerts */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {resetSent && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>E-mail de recuperação enviado com sucesso. Verifique sua caixa de entrada.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Seu Nome ou Empresa
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-display-name-input"
                    type="text"
                    required
                    placeholder="Ex: Ana Silva / Agência Digital"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="seu-email@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {authModalMode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Senha
                  </label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      id="forgot-password-link"
                      onClick={() => {
                        setFormError(null);
                        setResetSent(false);
                        openAuthModal('forgot_password');
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {authModalMode === 'login' && 'Entrar e Sincronizar'}
                  {authModalMode === 'register' && 'Cadastrar e Conectar'}
                  {authModalMode === 'forgot_password' && 'Enviar link de recuperação'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          {authModalMode === 'forgot_password' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  openAuthModal('login');
                }}
                className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
              >
                ← Voltar para o Login
              </button>
            </div>
          )}

          {/* Offline Protection Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Arquitetura Offline-first: seus dados continuam salvos no dispositivo mesmo sem internet.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

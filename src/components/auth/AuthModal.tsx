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
  KeyRound,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    loginWithGoogle,
    register,
    resetPassword,
  } = useAuth();
  const { syncNow } = useSync();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setFormError(null);
    setIsGoogleSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setFormError(res.error || 'Não foi possível autenticar com o Google.');
      } else {
        setTimeout(() => syncNow(), 500);
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

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
          setTimeout(() => syncNow(), 500);
        }
      } else if (authModalMode === 'register') {
        if (!displayName.trim()) {
          setFormError('Informe o seu nome.');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !password.trim()) {
          setFormError('Preencha todos os campos obrigatórios.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setFormError('A senha deve ter no mínimo 6 caracteres.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setFormError('As senhas digitadas não coincidem.');
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
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="relative p-5 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {authModalMode === 'login' && 'Entrar no PROSPECT OS'}
                {authModalMode === 'register' && 'Criar Conta no PROSPECT OS'}
                {authModalMode === 'forgot_password' && 'Recuperar Senha'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acesse sua conta ou sincronize seus prospects na nuvem
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
        <div className="p-6 overflow-y-auto">
          {/* Mode Switcher Tabs */}
          {authModalMode !== 'forgot_password' && (
            <div className="grid grid-cols-2 p-1 mb-5 bg-slate-100 dark:bg-slate-800 rounded-xl">
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
                Entrar
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
                Criar Conta
              </button>
            </div>
          )}

          {/* Google Sign-In Button */}
          {authModalMode !== 'forgot_password' && (
            <div className="mb-4">
              <button
                id="auth-google-btn"
                type="button"
                disabled={isGoogleSubmitting || isSubmitting}
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-xl transition flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
              >
                {isGoogleSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continuar com Google</span>
              </button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink mx-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ou com e-mail
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>
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
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-display-name-input"
                    type="text"
                    required
                    placeholder="Ex: João Silva"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="seu-email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {authModalMode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
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
                      Esqueci minha senha
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
                    className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-confirm-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full mt-3 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {authModalMode === 'login' && 'Entrar'}
                  {authModalMode === 'register' && 'Criar conta'}
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
          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Offline-first: seus dados funcionam 100% no seu dispositivo mesmo sem conexão.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

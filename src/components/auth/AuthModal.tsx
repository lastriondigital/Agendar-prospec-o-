import React, { useState } from 'react';
import { useAuth, AuthModalMode } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import {
  Lock,
  Mail,
  User,
  X,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAnonymous,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSubmit = async () => {
    setIsGoogleSubmitting(true);
    setFormError(null);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setFormError(res.error || 'Erro ao autenticar com o Google.');
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

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Preencha seu endereço de e-mail.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Insira um e-mail com formato válido (ex: nome@empresa.com).');
      return;
    }

    setIsSubmitting(true);

    try {
      if (authModalMode === 'login') {
        if (!password) {
          setFormError('Insira sua senha de acesso.');
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
          setFormError('Informe o seu nome completo.');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-md bg-white dark:bg-[#181B20] rounded-2xl shadow-2xl border border-[#E6E8EB] dark:border-[#2D3139] overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="relative p-5 pb-4 border-b border-[#ECEEF1] dark:border-[#2D3139] bg-[#F7F8FA] dark:bg-[#14161A] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3F6FB5] text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124] dark:text-[#E8EAED]">
                {isAnonymous && authModalMode === 'register' && 'Vincular Conta & Sincronizar'}
                {(!isAnonymous || authModalMode === 'login') && authModalMode === 'login' && 'Entrar na Conta'}
                {!isAnonymous && authModalMode === 'register' && 'Criar Conta de Acesso'}
                {authModalMode === 'forgot_password' && 'Recuperar Senha'}
              </h3>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                {isAnonymous
                  ? 'Seus dados atuais serão mantidos e salvos na nuvem'
                  : 'LEADION • Prospecção Comercial'}
              </p>
            </div>
          </div>
          <button
            id="close-auth-modal-button"
            onClick={closeAuthModal}
            className="text-[#80868B] hover:text-[#202124] dark:hover:text-[#E8EAED] p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#252A32] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Mode Switcher Tabs */}
          {authModalMode !== 'forgot_password' && (
            <div className="grid grid-cols-2 p-1 bg-[#F1F3F4] dark:bg-[#121417] rounded-xl border border-[#E6E8EB] dark:border-[#2D3139]">
              <button
                type="button"
                id="modal-tab-register-btn"
                onClick={() => {
                  setFormError(null);
                  openAuthModal('register');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'register'
                    ? 'bg-white dark:bg-[#1E2228] text-[#3F6FB5] dark:text-blue-300 shadow-xs'
                    : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                }`}
              >
                {isAnonymous ? 'Criar / Vincular' : 'Criar Conta'}
              </button>
              <button
                type="button"
                id="modal-tab-login-btn"
                onClick={() => {
                  setFormError(null);
                  openAuthModal('login');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'login'
                    ? 'bg-white dark:bg-[#1E2228] text-[#3F6FB5] dark:text-blue-300 shadow-xs'
                    : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                }`}
              >
                Entrar
              </button>
            </div>
          )}

          {/* GOOGLE SIGN IN BUTTON */}
          {authModalMode !== 'forgot_password' && (
            <div className="space-y-3">
              <button
                id="modal-auth-google-btn"
                type="button"
                onClick={handleGoogleSubmit}
                disabled={isGoogleSubmitting || isSubmitting}
                className="w-full py-2.5 px-4 bg-white dark:bg-[#1C2026] hover:bg-[#F8F9FA] dark:hover:bg-[#252A32] text-[#202124] dark:text-[#E8EAED] border border-[#D1D5DB] dark:border-[#374151] font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isGoogleSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#3F6FB5]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>
                  {isAnonymous
                    ? 'Vincular com o Google'
                    : authModalMode === 'register'
                    ? 'Criar conta com o Google'
                    : 'Entrar com o Google'}
                </span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#ECEEF1] dark:bg-[#2D3139]"></div>
                <span className="text-[11px] font-medium text-[#80868B] uppercase tracking-wider">
                  ou com e-mail
                </span>
                <div className="flex-1 h-px bg-[#ECEEF1] dark:bg-[#2D3139]"></div>
              </div>
            </div>
          )}

          {/* Form Alerts */}
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {resetSent && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>E-mail de recuperação enviado com sucesso. Verifique sua caixa de entrada.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#202124] dark:text-[#E8EAED] mb-1">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#80868B] absolute left-3.5 top-3" />
                  <input
                    id="modal-auth-display-name-input"
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-[#D1D5DB] dark:border-[#374151] bg-white dark:bg-[#1E2228] text-[#202124] dark:text-[#E8EAED] placeholder:text-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3F6FB5]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#202124] dark:text-[#E8EAED] mb-1">
                E-mail <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#80868B] absolute left-3.5 top-3" />
                <input
                  id="modal-auth-email-input"
                  type="email"
                  required
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-[#D1D5DB] dark:border-[#374151] bg-white dark:bg-[#1E2228] text-[#202124] dark:text-[#E8EAED] placeholder:text-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3F6FB5]"
                />
              </div>
            </div>

            {authModalMode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#202124] dark:text-[#E8EAED]">
                    Senha <span className="text-rose-500">*</span>
                  </label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      id="modal-forgot-password-link"
                      onClick={() => {
                        setFormError(null);
                        setResetSent(false);
                        openAuthModal('forgot_password');
                      }}
                      className="text-xs text-[#3F6FB5] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#80868B] absolute left-3.5 top-3" />
                  <input
                    id="modal-auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 text-xs rounded-xl border border-[#D1D5DB] dark:border-[#374151] bg-white dark:bg-[#1E2228] text-[#202124] dark:text-[#E8EAED] placeholder:text-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3F6FB5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#80868B] hover:text-[#202124] dark:hover:text-[#E8EAED] cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#202124] dark:text-[#E8EAED] mb-1">
                  Confirmar Senha <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#80868B] absolute left-3.5 top-3" />
                  <input
                    id="modal-auth-confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 text-xs rounded-xl border border-[#D1D5DB] dark:border-[#374151] bg-white dark:bg-[#1E2228] text-[#202124] dark:text-[#E8EAED] placeholder:text-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3F6FB5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-[#80868B] hover:text-[#202124] dark:hover:text-[#E8EAED] cursor-pointer"
                    title={showConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              id="modal-auth-submit-btn"
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full mt-3 py-2.5 px-4 bg-[#3F6FB5] hover:bg-[#335A94] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>
                    {authModalMode === 'login' && 'Entrar na Conta'}
                    {authModalMode === 'register' && (isAnonymous ? 'Vincular Conta & Salvar na Nuvem' : 'Criar Conta de Acesso')}
                    {authModalMode === 'forgot_password' && 'Enviar Link de Recuperação'}
                  </span>
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
                className="text-xs text-[#5F6368] hover:text-[#3F6FB5] dark:hover:text-blue-400 cursor-pointer"
              >
                ← Voltar para o Login
              </button>
            </div>
          )}

          {/* Offline Protection Notice */}
          <div className="mt-5 pt-3.5 border-t border-[#ECEEF1] dark:border-[#2D3139] flex items-center gap-2 text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {isAnonymous
                ? 'Ao vincular sua conta, todos os dados já cadastrados serão transferidos automaticamente.'
                : 'Isolamento seguro por usuário e persistência com nuvem Supabase.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

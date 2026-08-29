import React, { useState } from 'react';
import { useAuth, AuthModalMode } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Lock,
  Mail,
  User,
  Zap,
  Eye,
  EyeOff,
  Sun,
  Moon,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  Sparkles,
  HardDrive,
  Wifi,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { startWithoutAccount, login, loginWithGoogle, register, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<AuthModalMode>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestStarting, setIsGuestStarting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const switchMode = (newMode: AuthModalMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleStartWithoutAccount = async () => {
    setIsGuestStarting(true);
    setErrorMessage(null);
    try {
      await startWithoutAccount();
    } catch (err: any) {
      setErrorMessage('Não foi possível iniciar o modo local. Tente novamente.');
    } finally {
      setIsGuestStarting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Por favor, informe seu endereço de e-mail.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Por favor, insira um formato de e-mail válido (ex: nome@empresa.com).');
      return false;
    }

    if (mode === 'forgot_password') {
      return true;
    }

    if (!password) {
      setErrorMessage('Por favor, insira sua senha.');
      return false;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Por favor, informe seu nome completo.');
        return false;
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMessage('A confirmação da senha não confere com a senha digitada.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success && res.error) {
          setErrorMessage(res.error);
        }
      } else if (mode === 'register') {
        const res = await register(email, password, name);
        if (!res.success && res.error) {
          setErrorMessage(res.error);
        }
      } else if (mode === 'forgot_password') {
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMessage(
            'Enviamos as instruções para redefinição de senha para o seu e-mail. Verifique sua caixa de entrada e a pasta de spam.'
          );
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F7F8FA] dark:bg-[#121417] text-[#202124] dark:text-[#E8EAED] transition-colors duration-150">
      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3F6FB5] flex items-center justify-center text-white shadow-xs">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold leading-tight text-[#202124] dark:text-[#E8EAED]">
              Prospect OS
            </h1>
            <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium hidden sm:block">
              Prospecção Comercial & Automação de Agendamentos
            </p>
          </div>
        </div>

        {/* Status Indicator & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Pronto para uso offline e online</span>
          </div>

          <button
            id="auth-theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-white dark:hover:bg-[#1C2026] border border-[#E6E8EB] dark:border-[#2D3139] shadow-xs transition-colors cursor-pointer"
            title={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Authentication & Welcome Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-lg bg-white dark:bg-[#181B20] rounded-2xl border border-[#E6E8EB] dark:border-[#2D3139] shadow-xl overflow-hidden">
          {/* Welcome Header */}
          <div className="p-6 sm:p-8 pb-5 border-b border-[#ECEEF1] dark:border-[#2D3139] text-center">
            <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 mb-3">
              <Zap className="w-7 h-7 fill-current" />
            </div>
            <h2 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED] tracking-tight">
              Bem-vindo ao Prospect OS
            </h2>
            <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6] mt-1.5 max-w-sm mx-auto">
              Plataforma profissional de prospecção comercial, qualificação de clientes e agendamento de mensagens.
            </p>

            {/* FAST ACCESS / COMEÇAR SEM CONTA BUTTON */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/50 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#3F6FB5] dark:text-blue-300">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Acesso Imediato & Sem Barreiras</span>
                  </div>
                  <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
                    Experimente todas as ferramentas agora mesmo. Seus dados são salvos com segurança no seu navegador.
                  </p>
                </div>
                <button
                  id="btn-start-without-account"
                  type="button"
                  onClick={handleStartWithoutAccount}
                  disabled={isGuestStarting}
                  className="shrink-0 px-4 py-2.5 bg-[#3F6FB5] hover:bg-[#335A94] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isGuestStarting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Iniciando...</span>
                    </>
                  ) : (
                    <>
                      <span>Começar sem Conta</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            {mode !== 'forgot_password' && (
              <div className="grid grid-cols-2 p-1 mt-6 bg-[#F1F3F4] dark:bg-[#121417] rounded-xl border border-[#E6E8EB] dark:border-[#2D3139]">
                <button
                  type="button"
                  id="tab-register-btn"
                  onClick={() => switchMode('register')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white dark:bg-[#1E2228] text-[#3F6FB5] dark:text-blue-300 shadow-xs border border-[#E6E8EB] dark:border-[#2D3139]'
                      : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                  }`}
                >
                  Criar Conta
                </button>
                <button
                  type="button"
                  id="tab-login-btn"
                  onClick={() => switchMode('login')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white dark:bg-[#1E2228] text-[#3F6FB5] dark:text-blue-300 shadow-xs border border-[#E6E8EB] dark:border-[#2D3139]'
                      : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                  }`}
                >
                  Entrar
                </button>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-4">
            {/* GOOGLE SIGN IN BUTTON */}
            {mode !== 'forgot_password' && (
              <div className="space-y-3">
                <button
                  id="auth-google-btn"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleSubmitting || isSubmitting || isGuestStarting}
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
                    {mode === 'register' ? 'Criar conta com o Google' : 'Entrar com o Google'}
                  </span>
                </button>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-[#ECEEF1] dark:bg-[#2D3139]"></div>
                  <span className="text-[11px] font-medium text-[#80868B] uppercase tracking-wider">
                    ou com e-mail e senha
                  </span>
                  <div className="flex-1 h-px bg-[#ECEEF1] dark:bg-[#2D3139]"></div>
                </div>
              </div>
            )}

            {/* Error Notification Banner */}
            {errorMessage && (
              <div
                id="auth-error-banner"
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Notification Banner */}
            {successMessage && (
              <div
                id="auth-success-banner"
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name (Only for Register) */}
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="register-name-input"
                    className="block text-xs font-semibold text-[#202124] dark:text-[#E8EAED] mb-1"
                  >
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#80868B] absolute left-3.5 top-3" />
                    <input
                      id="register-name-input"
                      type="text"
                      required
                      placeholder="Ex: Carlos Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-[#D1D5DB] dark:border-[#374151] bg-white dark:bg-[#1E2228] text-[#202124] dark:text-[#E8EAED] placeholder:text-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3F6FB5]"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label
                  htmlFor="auth-email-input"
                  className="block text-xs font-semibold text-[#202124] dark:text-[#E8EAED] mb-1"
                >
                  Endereço de E-mail <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#80868B] absolute left-3.5 top-3" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-[#D1D5DB] dark:border-[#374151] bg-white dark:bg-[#1E2228] text-[#202124] dark:text-[#E8EAED] placeholder:text-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3F6FB5]"
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== 'forgot_password' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="auth-password-input"
                      className="block text-xs font-semibold text-[#202124] dark:text-[#E8EAED]"
                    >
                      Senha <span className="text-rose-500">*</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        id="auth-forgot-password-link"
                        onClick={() => switchMode('forgot_password')}
                        className="text-xs text-[#3F6FB5] dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#80868B] absolute left-3.5 top-3" />
                    <input
                      id="auth-password-input"
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
                      aria-label="Alternar exibição de senha"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password (Only for Register) */}
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="register-confirm-password-input"
                    className="block text-xs font-semibold text-[#202124] dark:text-[#E8EAED] mb-1"
                  >
                    Confirmar Senha <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#80868B] absolute left-3.5 top-3" />
                    <input
                      id="register-confirm-password-input"
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
                      aria-label="Alternar exibição da confirmação de senha"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="auth-submit-button"
                type="submit"
                disabled={isSubmitting || isGuestStarting || isGoogleSubmitting}
                className="w-full mt-2 py-2.5 px-4 bg-[#3F6FB5] hover:bg-[#335A94] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Entrar na Minha Conta'}
                      {mode === 'register' && 'Criar Conta de Acesso'}
                      {mode === 'forgot_password' && 'Enviar Instruções'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Mode Switch Link */}
            <div className="pt-2 text-center text-xs text-[#5F6368] dark:text-[#9AA0A6]">
              {mode === 'login' && (
                <p>
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-[#3F6FB5] dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    Criar conta
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p>
                  Já possui uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-[#3F6FB5] dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    Entrar
                  </button>
                </p>
              )}
              {mode === 'forgot_password' && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#3F6FB5] dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  ← Voltar para a tela de login
                </button>
              )}
            </div>
          </div>

          {/* Card Footer Security Guarantee */}
          <div className="px-6 py-3.5 bg-[#F7F8FA] dark:bg-[#14161A] border-t border-[#ECEEF1] dark:border-[#2D3139] flex items-center justify-center gap-2 text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
            <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Banco de Dados Firestore • 100% Gratuito (Spark) & Seguro</span>
          </div>
        </div>
      </main>

      {/* App Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-[#80868B] dark:text-[#9AA0A6]">
        Prospect OS © {new Date().getFullYear()} — Prospecção Comercial, Qualificação & Automação.
      </footer>
    </div>
  );
};



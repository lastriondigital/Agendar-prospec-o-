import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthUser, UserProfile } from '../types';
import { syncEngine } from '../services/syncEngine';
import { useToast } from './ToastContext';

export type AuthModalMode = 'login' | 'register' | 'forgot_password';

export type AuthState =
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'anonymous'
  | 'auth_error'
  | 'offline';

export function getAuthStateLabel(state: AuthState): string {
  switch (state) {
    case 'authenticated':
      return 'Conta Conectada';
    case 'anonymous':
      return 'Modo Local';
    case 'authenticating':
      return 'Autenticando...';
    case 'unauthenticated':
      return 'Não autenticado';
    case 'auth_error':
      return 'Erro de autenticação';
    case 'offline':
      return 'Offline — Modo Local';
    default:
      return 'Não autenticado';
  }
}

export function mapSupabaseAuthError(err: any): string {
  const message = (err?.message || '').toLowerCase();
  const code = (err?.code || '').toLowerCase();

  if (message.includes('invalid login credentials') || message.includes('invalid_grant')) {
    return 'E-mail ou senha incorretos. Verifique suas credenciais.';
  }
  if (message.includes('user already registered') || message.includes('already exists') || code.includes('user_already_exists')) {
    return 'Este endereço de e-mail já está cadastrado em outra conta. Faça login para acessar seus dados.';
  }
  if (message.includes('password should be at least') || message.includes('weak_password')) {
    return 'A senha é muito fraca. Ela deve conter pelo menos 6 caracteres.';
  }
  if (message.includes('invalid email') || message.includes('validation_failed')) {
    return 'O formato do e-mail inserido é inválido. Exemplo: nome@empresa.com.';
  }
  if (message.includes('rate limit') || message.includes('too many requests') || message.includes('over_email_send_rate_limit')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.';
  }
  if (message.includes('email not confirmed')) {
    return 'E-mail de confirmação pendente. Verifique sua caixa de entrada ou faça login.';
  }
  if (message.includes('popup') || message.includes('window')) {
    return 'A janela de autenticação foi fechada antes de concluir o login com o Google.';
  }
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Sem conexão com a internet ou servidor indisponível. O modo local continua funcionando normalmente.';
  }

  return err?.message || 'Ocorreu um erro ao processar sua solicitação no Supabase. Tente novamente.';
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  isLoadingAuth: boolean;
  isAnonymous: boolean;
  authState: AuthState;
  authStateLabel: string;
  authError: string | null;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  startWithoutAccount: () => Promise<void>;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_PROFILE_KEY = 'leadion_user_profile';
const LOCAL_ENTERED_KEY = 'leadion_has_entered';
const LOCAL_GUEST_UID_KEY = 'leadion_local_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_PROFILE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const { success, error, info } = useToast();

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const isAnonymous = Boolean(user?.isAnonymous);

  // Deriva o estado semântico de autenticação
  const authState: AuthState = (() => {
    if (!isOnline && !user) return 'offline';
    if (isLoadingAuth) return 'authenticating';
    if (authError) return 'auth_error';
    if (user?.isAnonymous) return 'anonymous';
    if (user) return 'authenticated';
    return 'unauthenticated';
  })();

  const authStateLabel = getAuthStateLabel(authState);

  const getOrCreateLocalGuestUid = (): string => {
    let localUid = localStorage.getItem(LOCAL_GUEST_UID_KEY);
    if (!localUid) {
      localUid = 'local_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(LOCAL_GUEST_UID_KEY, localUid);
    }
    return localUid;
  };

  const syncOrCreateUserProfile = async (supabaseUser: any, explicitName?: string): Promise<UserProfile> => {
    const providerType =
      supabaseUser.app_metadata?.provider === 'google'
        ? 'google'
        : supabaseUser.is_anonymous
        ? 'anonymous'
        : 'password';

    const displayName =
      explicitName ||
      supabaseUser.user_metadata?.name ||
      supabaseUser.user_metadata?.full_name ||
      (supabaseUser.email ? supabaseUser.email.split('@')[0] : 'Usuário Leadion');

    const photoURL =
      supabaseUser.user_metadata?.avatar_url ||
      supabaseUser.user_metadata?.picture ||
      null;

    const now = new Date().toISOString();
    let currentProfile: UserProfile = {
      uid: supabaseUser.id,
      nome: displayName,
      email: supabaseUser.email || '',
      foto: photoURL,
      provider: providerType,
      createdAt: supabaseUser.created_at || now,
      updatedAt: now,
      onboardingCompleted: true,
    };

    // Cache local imediato para resiliência offline
    try {
      const localCached = localStorage.getItem(LOCAL_USER_PROFILE_KEY);
      if (localCached) {
        const parsed = JSON.parse(localCached);
        if (parsed.uid === supabaseUser.id) {
          currentProfile = {
            ...currentProfile,
            ...parsed,
            nome: explicitName || parsed.nome || currentProfile.nome,
            updatedAt: now,
          };
        }
      }
      localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(currentProfile));
      setUserProfile(currentProfile);
    } catch (e) {
      console.warn('Aviso de armazenamento local de perfil:', e);
    }

    // Persistência e sincronização com Supabase (tabela public.profiles)
    if (isOnline && supabaseUser.id && !supabaseUser.id.startsWith('local_')) {
      try {
        const { data: remoteProfile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .maybeSingle();

        if (remoteProfile && !profileErr) {
          currentProfile = {
            ...currentProfile,
            nome: explicitName || remoteProfile.name || currentProfile.nome,
            foto: remoteProfile.avatar_url || currentProfile.foto,
            updatedAt: remoteProfile.updated_at || now,
          };
        } else {
          // Inserir ou atualizar na tabela profiles
          await supabase.from('profiles').upsert({
            id: supabaseUser.id,
            name: currentProfile.nome,
            email: currentProfile.email,
            avatar_url: currentProfile.foto,
            updated_at: now,
          });
        }
        localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(currentProfile));
        setUserProfile(currentProfile);
      } catch (e) {
        console.info('Perfil mantido em cache local / Supabase:', e);
      }
    }

    return currentProfile;
  };

  useEffect(() => {
    // 1. Carrega a sessão inicial do Supabase
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        console.warn('Erro ao obter sessão inicial do Supabase:', sessionError);
      }
      if (session?.user) {
        const suUser = session.user;
        const mappedUser: AuthUser = {
          uid: suUser.id,
          email: suUser.email || null,
          displayName:
            suUser.user_metadata?.name ||
            suUser.user_metadata?.full_name ||
            suUser.email?.split('@')[0] ||
            'Usuário Leadion',
          photoURL: suUser.user_metadata?.avatar_url || suUser.user_metadata?.picture || null,
          isAnonymous: false,
        };
        setUser(mappedUser);
        setAuthError(null);
        syncEngine.setUserId(suUser.id);
        localStorage.setItem(LOCAL_ENTERED_KEY, 'true');
        syncOrCreateUserProfile(suUser);
      } else {
        const hasEntered = localStorage.getItem(LOCAL_ENTERED_KEY) === 'true';
        if (hasEntered) {
          // Modo local offline persistente
          const localUid = getOrCreateLocalGuestUid();
          const localUser: AuthUser = {
            uid: localUid,
            email: null,
            displayName: 'Modo Local',
            isAnonymous: true,
          };
          setUser(localUser);
          syncEngine.setUserId(localUid);
        } else {
          setUser(null);
          setUserProfile(null);
          syncEngine.setUserId(null);
        }
      }
      setIsLoadingAuth(false);
    });

    // 2. Escuta mudanças em tempo real na autenticação do Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const suUser = session.user;
          const mappedUser: AuthUser = {
            uid: suUser.id,
            email: suUser.email || null,
            displayName:
              suUser.user_metadata?.name ||
              suUser.user_metadata?.full_name ||
              suUser.email?.split('@')[0] ||
              'Usuário Leadion',
            photoURL: suUser.user_metadata?.avatar_url || suUser.user_metadata?.picture || null,
            isAnonymous: false,
          };
          setUser(mappedUser);
          setAuthError(null);
          syncEngine.setUserId(suUser.id);
          localStorage.setItem(LOCAL_ENTERED_KEY, 'true');
          await syncOrCreateUserProfile(suUser);
        } else if (event === 'SIGNED_OUT') {
          const hasEntered = localStorage.getItem(LOCAL_ENTERED_KEY) === 'true';
          if (hasEntered) {
            const localUid = getOrCreateLocalGuestUid();
            setUser({
              uid: localUid,
              email: null,
              displayName: 'Modo Local',
              isAnonymous: true,
            });
            syncEngine.setUserId(localUid);
          } else {
            setUser(null);
            setUserProfile(null);
            syncEngine.setUserId(null);
          }
        }
      } catch (err) {
        console.warn('Processamento de estado de autenticação Supabase:', err);
      } finally {
        setIsLoadingAuth(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  /**
   * MODO 1 — Começar Sem Conta / Modo Local
   */
  const startWithoutAccount = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    localStorage.setItem(LOCAL_ENTERED_KEY, 'true');

    const localUid = getOrCreateLocalGuestUid();
    const guestUser: AuthUser = {
      uid: localUid,
      email: null,
      displayName: 'Modo Local',
      isAnonymous: true,
    };
    setUser(guestUser);
    syncEngine.setUserId(localUid);

    const guestProfile: UserProfile = {
      uid: localUid,
      nome: 'Visitante (Modo Local)',
      email: '',
      foto: null,
      provider: 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      onboardingCompleted: true,
    };
    setUserProfile(guestProfile);
    localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(guestProfile));

    setIsLoadingAuth(false);
    info('Modo Local Ativado', 'Bem-vindo ao LEADION! Todas as suas alterações são salvas localmente no navegador.');
  };

  /**
   * Login com E-mail e Senha no Supabase
   */
  const login = async (emailStr: string, pass: string) => {
    setAuthError(null);
    try {
      localStorage.setItem(LOCAL_ENTERED_KEY, 'true');
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email: emailStr.trim(),
        password: pass,
      });

      if (loginErr) throw loginErr;
      if (!data.user) throw new Error('Falha ao autenticar usuário.');

      await syncOrCreateUserProfile(data.user);
      success(
        'Sessão iniciada com sucesso!',
        `Bem-vindo de volta ao LEADION, ${data.user.user_metadata?.name || data.user.email}!`
      );
      setIsAuthModalOpen(false);
      setTimeout(() => syncEngine.triggerSync(), 500);
      return { success: true };
    } catch (err: any) {
      const message = mapSupabaseAuthError(err);
      setAuthError(message);
      error('Erro ao entrar', message);
      return { success: false, error: message };
    }
  };

  /**
   * Login com Google OAuth no Supabase
   */
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      localStorage.setItem(LOCAL_ENTERED_KEY, 'true');
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (oauthErr) throw oauthErr;
      return { success: true };
    } catch (err: any) {
      const message = mapSupabaseAuthError(err);
      setAuthError(message);
      error('Login com Google', message);
      return { success: false, error: message };
    }
  };

  /**
   * Registro com E-mail e Senha no Supabase
   */
  const register = async (emailStr: string, pass: string, displayName: string) => {
    setAuthError(null);
    try {
      const trimmedEmail = emailStr.trim();
      const trimmedName = displayName.trim();
      localStorage.setItem(LOCAL_ENTERED_KEY, 'true');

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: pass,
        options: {
          data: {
            name: trimmedName,
            full_name: trimmedName,
          },
        },
      });

      if (signUpErr) throw signUpErr;
      if (!data.user) throw new Error('Erro ao criar conta no Supabase.');

      await syncOrCreateUserProfile(data.user, trimmedName);
      success('Conta criada com sucesso!', 'Seu acesso ao LEADION foi configurado no Supabase.');
      setIsAuthModalOpen(false);
      setTimeout(() => syncEngine.triggerSync(), 500);
      return { success: true };
    } catch (err: any) {
      const message = mapSupabaseAuthError(err);
      setAuthError(message);
      error('Erro no cadastro', message);
      return { success: false, error: message };
    }
  };

  /**
   * Redefinição de Senha no Supabase
   */
  const resetPassword = async (emailStr: string) => {
    setAuthError(null);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(emailStr.trim(), {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      });

      if (resetErr) throw resetErr;

      info(
        'E-mail de recuperação enviado',
        `Instruções para redefinir sua senha foram enviadas para ${emailStr.trim()}.`
      );
      return { success: true };
    } catch (err: any) {
      const message = mapSupabaseAuthError(err);
      setAuthError(message);
      error('Recuperação de senha', message);
      return { success: false, error: message };
    }
  };

  /**
   * Logout no Supabase
   */
  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_ENTERED_KEY);
      localStorage.removeItem(LOCAL_GUEST_UID_KEY);
      localStorage.removeItem(LOCAL_USER_PROFILE_KEY);
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      syncEngine.setUserId(null);
      info('Sessão encerrada', 'Você saiu com segurança. Seus dados locais continuam salvos no navegador.');
    } catch (err: any) {
      const message = mapSupabaseAuthError(err);
      setAuthError(message);
      error('Erro ao sair', message);
    }
  };

  /**
   * Exclusão de Conta / Reset
   */
  const deleteAccount = async () => {
    if (!user) {
      return { success: false, error: 'Nenhum usuário autenticado para exclusão.' };
    }

    try {
      const uid = user.uid;
      // Remove perfil da tabela profiles no Supabase
      if (!uid.startsWith('local_')) {
        try {
          await supabase.from('profiles').delete().eq('id', uid);
        } catch (delErr) {
          console.warn('Aviso ao excluir perfil no Supabase:', delErr);
        }
      }

      // Desconecta sessão
      await supabase.auth.signOut();

      // Limpa dados locais
      localStorage.removeItem(LOCAL_ENTERED_KEY);
      localStorage.removeItem(LOCAL_GUEST_UID_KEY);
      localStorage.removeItem(LOCAL_USER_PROFILE_KEY);
      setUser(null);
      setUserProfile(null);
      syncEngine.setUserId(null);

      success('Conta desvinculada com sucesso', 'Suas credenciais e perfil foram limpos.');
      return { success: true };
    } catch (err: any) {
      const message = mapSupabaseAuthError(err);
      setAuthError(message);
      error('Falha ao excluir conta', message);
      return { success: false, error: message };
    }
  };

  /**
   * Atualização de Perfil
   */
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const current = userProfile || {
      uid: user.uid,
      nome: user.displayName || 'Usuário',
      email: user.email || '',
      foto: user.photoURL || null,
      provider: (user.isAnonymous ? 'anonymous' : 'password') as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      onboardingCompleted: true,
    };

    const updated: UserProfile = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updated);
    localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(updated));

    if (isOnline && !user.uid.startsWith('local_')) {
      try {
        await supabase.from('profiles').upsert({
          id: user.uid,
          name: updated.nome,
          email: updated.email,
          avatar_url: updated.foto,
          updated_at: updated.updatedAt,
        });
        success('Perfil atualizado', 'Suas informações foram salvas com sucesso no Supabase.');
      } catch (e) {
        console.warn('Erro ao atualizar perfil no Supabase:', e);
      }
    } else {
      success('Perfil atualizado localmente', 'Suas informações foram salvas neste dispositivo.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoadingAuth,
        isAnonymous,
        authState,
        authStateLabel,
        authError,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        startWithoutAccount,
        login,
        loginWithGoogle,
        register,
        resetPassword,
        logout,
        deleteAccount,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};

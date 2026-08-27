import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  db,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from '../lib/firebase';
import { AuthUser, UserProfile } from '../types';
import { syncEngine } from '../services/syncEngine';
import { useToast } from './ToastContext';

export type AuthModalMode = 'login' | 'register' | 'forgot_password';

export type AuthState =
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'auth_error'
  | 'offline';

export function getAuthStateLabel(state: AuthState): string {
  switch (state) {
    case 'authenticated':
      return 'Autenticado';
    case 'authenticating':
      return 'Autenticando...';
    case 'unauthenticated':
      return 'Não autenticado';
    case 'auth_error':
      return 'Erro de autenticação';
    case 'offline':
      return 'Offline';
    default:
      return 'Não autenticado';
  }
}

export function mapFirebaseAuthError(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/invalid-login-credentials':
      return 'E-mail ou senha incorretos. Verifique suas credenciais.';
    case 'auth/user-not-found':
      return 'Nenhuma conta encontrada com este endereço de e-mail.';
    case 'auth/email-already-in-use':
      return 'Este endereço de e-mail já está cadastrado em outra conta.';
    case 'auth/invalid-email':
      return 'O formato do e-mail inserido é inválido. Exemplo: nome@empresa.com.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Ela deve conter pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Aguarde alguns minutos ou redefina sua senha.';
    case 'auth/user-disabled':
      return 'Esta conta de usuário foi desativada pelo administrador.';
    case 'auth/popup-closed-by-user':
      return 'A janela de autenticação com o Google foi fechada antes de concluir o login.';
    case 'auth/cancelled-popup-request':
      return 'Abertura da janela Google cancelada.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela pop-up do Google. Permita pop-ups neste site para continuar.';
    case 'auth/unauthorized-domain':
      return 'Domínio atual não autorizado no Firebase Authentication. Adicione aos Domínios Autorizados no Firebase Console.';
    case 'auth/operation-not-allowed':
      return 'Este método de autenticação não está ativado no Firebase Console.';
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta associada a este e-mail através de outro método de login.';
    case 'auth/network-request-failed':
      return 'Falha de conexão com a rede. Verifique sua conexão com a internet.';
    case 'auth/requires-recent-login':
      return 'Esta operação é sensível e requer login recente. Saia e entre novamente antes de prosseguir.';
    default:
      return err?.message || 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
  }
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  isLoadingAuth: boolean;
  authState: AuthState;
  authStateLabel: string;
  authError: string | null;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_PROFILE_KEY = 'prospect_os_user_profile';

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

  // Deriva o estado semântico de autenticação
  const authState: AuthState = (() => {
    if (!isOnline && !user) return 'offline';
    if (isLoadingAuth) return 'authenticating';
    if (authError) return 'auth_error';
    if (user) return 'authenticated';
    return 'unauthenticated';
  })();

  const authStateLabel = getAuthStateLabel(authState);

  const syncOrCreateUserProfile = async (firebaseUser: any, explicitName?: string): Promise<UserProfile> => {
    const providerType =
      firebaseUser.providerData?.[0]?.providerId === 'google.com'
        ? 'google'
        : firebaseUser.isAnonymous
        ? 'anonymous'
        : 'password';

    const now = new Date().toISOString();
    let currentProfile: UserProfile = {
      uid: firebaseUser.uid,
      nome: explicitName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
      email: firebaseUser.email || '',
      foto: firebaseUser.photoURL || null,
      provider: providerType,
      createdAt: now,
      updatedAt: now,
      onboardingCompleted: true,
    };

    // Cache local imediato para resiliência
    try {
      const localCached = localStorage.getItem(LOCAL_USER_PROFILE_KEY);
      if (localCached) {
        const parsed = JSON.parse(localCached);
        if (parsed.uid === firebaseUser.uid) {
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

    // Persistência e sincronização com Firestore (sem senhas, apenas perfil público)
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const remoteData = userDocSnap.data() as Partial<UserProfile>;
        currentProfile = {
          ...currentProfile,
          ...remoteData,
          nome: explicitName || remoteData.nome || currentProfile.nome,
          updatedAt: now,
        };
        await setDoc(userDocRef, currentProfile, { merge: true });
      } else {
        await setDoc(userDocRef, currentProfile);
      }
      localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(currentProfile));
      setUserProfile(currentProfile);
    } catch (e) {
      console.info('Perfil mantido em cache local / Firestore:', e);
    }

    return currentProfile;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const mappedUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            photoURL: firebaseUser.photoURL,
            isAnonymous: firebaseUser.isAnonymous,
          };
          setUser(mappedUser);
          setAuthError(null);
          syncEngine.setUserId(firebaseUser.uid);

          // Sincronizar o UserProfile no Firestore
          await syncOrCreateUserProfile(firebaseUser);
        } else {
          setUser(null);
          setUserProfile(null);
          syncEngine.setUserId(null);
          localStorage.removeItem(LOCAL_USER_PROFILE_KEY);
        }
      } catch (err) {
        console.warn('Erro ao processar estado de autenticação:', err);
      } finally {
        setIsLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (emailStr: string, pass: string) => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, emailStr.trim(), pass);
      await syncOrCreateUserProfile(cred.user);
      success('Sessão iniciada com sucesso!', `Bem-vindo de volta, ${cred.user.displayName || cred.user.email}!`);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      const message = mapFirebaseAuthError(err);
      setAuthError(message);
      error('Erro ao entrar', message);
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await syncOrCreateUserProfile(cred.user);
      success('Autenticado com o Google!', `Bem-vindo, ${cred.user.displayName || cred.user.email}!`);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      const message = mapFirebaseAuthError(err);
      setAuthError(message);
      error('Login Google', message);
      return { success: false, error: message };
    }
  };

  const register = async (emailStr: string, pass: string, displayName: string) => {
    setAuthError(null);
    try {
      const trimmedEmail = emailStr.trim();
      const trimmedName = displayName.trim();
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      if (trimmedName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmedName });
      }
      await syncOrCreateUserProfile(cred.user, trimmedName);
      success('Conta criada com sucesso!', 'Seu acesso ao sistema foi configurado.');
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      const message = mapFirebaseAuthError(err);
      setAuthError(message);
      error('Erro no cadastro', message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (emailStr: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, emailStr.trim());
      info(
        'E-mail de recuperação enviado',
        `Instruções para redefinir sua senha foram enviadas para ${emailStr.trim()}.`
      );
      return { success: true };
    } catch (err: any) {
      const message = mapFirebaseAuthError(err);
      setAuthError(message);
      error('Recuperação de senha', message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      syncEngine.setUserId(null);
      localStorage.removeItem(LOCAL_USER_PROFILE_KEY);
      info('Sessão encerrada', 'Você saiu com segurança. Seus dados locais continuam preservados neste navegador.');
    } catch (err: any) {
      const message = mapFirebaseAuthError(err);
      setAuthError(message);
      error('Erro ao sair', message);
    }
  };

  const deleteAccount = async () => {
    if (!auth.currentUser || !user) {
      return { success: false, error: 'Nenhum usuário autenticado para exclusão.' };
    }

    try {
      const uid = user.uid;
      // 1. Tenta deletar o documento do usuário no Firestore
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (firestoreErr) {
        console.warn('Aviso ao excluir documento Firestore de perfil:', firestoreErr);
      }

      // 2. Exclui a conta no Firebase Authentication
      await deleteUser(auth.currentUser);

      // 3. Limpa referências locais de sessão
      setUser(null);
      setUserProfile(null);
      syncEngine.setUserId(null);
      localStorage.removeItem(LOCAL_USER_PROFILE_KEY);

      success('Conta excluída com sucesso', 'Sua conta de autenticação em nuvem foi removida.');
      return { success: true };
    } catch (err: any) {
      const message = mapFirebaseAuthError(err);
      setAuthError(message);
      error('Falha ao excluir conta', message);
      return { success: false, error: message };
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const current = userProfile || {
      uid: user.uid,
      nome: user.displayName || 'Usuário',
      email: user.email || '',
      foto: user.photoURL || null,
      provider: 'password' as const,
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

    if (data.nome && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: data.nome });
      } catch (e) {
        console.warn('Erro ao atualizar displayName no auth:', e);
      }
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, updated, { merge: true });
      success('Perfil atualizado', 'Suas informações foram salvas com sucesso.');
    } catch (e) {
      console.warn('Erro ao atualizar perfil no Firestore:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoadingAuth,
        authState,
        authStateLabel,
        authError,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
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

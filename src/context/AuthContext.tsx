import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  linkWithCredential,
  linkWithPopup,
  EmailAuthProvider,
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
    case 'auth/credential-already-in-use':
      return 'Este endereço de e-mail já está cadastrado em outra conta. Faça login para acessar seus dados.';
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
      return 'Domínio atual em autorização. Você pode usar e-mail/senha ou o modo local.';
    case 'auth/operation-not-allowed':
      return 'Este método de autenticação não está ativado no Firebase Console.';
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta associada a este e-mail através de outro método de login.';
    case 'auth/network-request-failed':
      return 'Você está sem conexão com a internet. O modo local continua funcionando normalmente.';
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

const LOCAL_USER_PROFILE_KEY = 'prospect_os_user_profile';
const LOCAL_ENTERED_KEY = 'prospect_os_has_entered';
const LOCAL_GUEST_UID_KEY = 'prospect_os_local_uid';

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
      nome: explicitName || firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Visitante (Modo Local)' : firebaseUser.email?.split('@')[0]) || 'Usuário',
      email: firebaseUser.email || '',
      foto: firebaseUser.photoURL || null,
      provider: providerType,
      createdAt: now,
      updatedAt: now,
      onboardingCompleted: true,
    };

    // Cache local imediato para resiliência offline
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

    // Persistência e sincronização com Firestore (sempre protegida por uid)
    if (isOnline && firebaseUser.uid && !firebaseUser.uid.startsWith('local_')) {
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
            displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Modo Local' : firebaseUser.email?.split('@')[0]) || 'Usuário',
            photoURL: firebaseUser.photoURL,
            isAnonymous: firebaseUser.isAnonymous,
          };
          setUser(mappedUser);
          setAuthError(null);
          syncEngine.setUserId(firebaseUser.uid);
          localStorage.setItem(LOCAL_ENTERED_KEY, 'true');

          // Sincronizar o UserProfile no Firestore
          await syncOrCreateUserProfile(firebaseUser);
        } else {
          const hasEntered = localStorage.getItem(LOCAL_ENTERED_KEY) === 'true';
          if (hasEntered) {
            // Se o usuário já tinha entrado no app anteriormente, restaura a sessão local para não bloquear no refresh ou offline
            if (isOnline) {
              try {
                const anonCred = await signInAnonymously(auth);
                // onAuthStateChanged irá disparar novamente com anonCred.user
                return;
              } catch (anonErr) {
                console.info('Entrando em modo local offline resiliente:', anonErr);
              }
            }

            // Modo local offline
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
      } catch (err) {
        console.warn('Processamento de estado de autenticação:', err);
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

  /**
   * MODO 1 — Começar Sem Conta / Modo Local
   */
  const startWithoutAccount = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    localStorage.setItem(LOCAL_ENTERED_KEY, 'true');

    if (isOnline) {
      try {
        const cred = await signInAnonymously(auth);
        await syncOrCreateUserProfile(cred.user, 'Visitante (Modo Local)');
        info('Modo Local Ativado', 'Você pode começar a usar o Prospect OS imediatamente. Todas as alterações são salvas localmente.');
        setIsLoadingAuth(false);
        return;
      } catch (err) {
        console.info('Fallback para sessão local puramente offline:', err);
      }
    }

    // Sessão offline caso não haja conexão com Firebase
    const localUid = getOrCreateLocalGuestUid();
    const guestUser: AuthUser = {
      uid: localUid,
      email: null,
      displayName: 'Modo Local',
      isAnonymous: true,
    };
    setUser(guestUser);
    syncEngine.setUserId(localUid);
    setIsLoadingAuth(false);
    info('Modo Local Offline', 'Bem-vindo ao Prospect OS! Trabalhando localmente no navegador.');
  };

  /**
   * Login com E-mail e Senha
   */
  const login = async (emailStr: string, pass: string) => {
    setAuthError(null);
    try {
      localStorage.setItem(LOCAL_ENTERED_KEY, 'true');
      const cred = await signInWithEmailAndPassword(auth, emailStr.trim(), pass);
      await syncOrCreateUserProfile(cred.user);
      success('Sessão iniciada com sucesso!', `Bem-vindo de volta, ${cred.user.displayName || cred.user.email}!`);
      setIsAuthModalOpen(false);
      setTimeout(() => syncEngine.triggerSync(), 500);
      return { success: true };
    } catch (err: any) {
      const message = mapFirebaseAuthError(err);
      setAuthError(message);
      error('Erro ao entrar', message);
      return { success: false, error: message };
    }
  };

  /**
   * Login ou Vinculação com Google
   */
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      localStorage.setItem(LOCAL_ENTERED_KEY, 'true');

      // Se o usuário atual estiver em uma sessão anônima, vinculamos para MANTER O MESMO UID e todos os dados criados!
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        try {
          const cred = await linkWithPopup(auth.currentUser, googleProvider);
          await syncOrCreateUserProfile(cred.user);
          success('Conta Vinculada com Sucesso!', 'Sua conta Google foi vinculada. Todos os seus dados foram preservados e agora estão salvos na nuvem.');
          setIsAuthModalOpen(false);
          setTimeout(() => syncEngine.triggerSync(), 500);
          return { success: true };
        } catch (linkErr: any) {
          if (
            linkErr?.code === 'auth/credential-already-in-use' ||
            linkErr?.code === 'auth/account-exists-with-different-credential' ||
            linkErr?.code === 'auth/email-already-in-use'
          ) {
            // A conta Google já existe separadamente -> Realiza o login direto na conta existente
            const cred = await signInWithPopup(auth, googleProvider);
            await syncOrCreateUserProfile(cred.user);
            success('Autenticado com o Google!', `Bem-vindo de volta, ${cred.user.displayName || cred.user.email}!`);
            setIsAuthModalOpen(false);
            setTimeout(() => syncEngine.triggerSync(), 500);
            return { success: true };
          }
          throw linkErr;
        }
      }

      // Login Google padrão
      const cred = await signInWithPopup(auth, googleProvider);
      await syncOrCreateUserProfile(cred.user);
      success('Autenticado com o Google!', `Bem-vindo, ${cred.user.displayName || cred.user.email}!`);
      setIsAuthModalOpen(false);
      setTimeout(() => syncEngine.triggerSync(), 500);
      return { success: true };
    } catch (err: any) {
      const message = mapFirebaseAuthError(err);
      setAuthError(message);
      error('Login Google', message);
      return { success: false, error: message };
    }
  };

  /**
   * Registro com E-mail e Senha (com suporte a linkWithCredential para usuários anônimos)
   */
  const register = async (emailStr: string, pass: string, displayName: string) => {
    setAuthError(null);
    try {
      const trimmedEmail = emailStr.trim();
      const trimmedName = displayName.trim();
      localStorage.setItem(LOCAL_ENTERED_KEY, 'true');

      // Se o usuário já estiver em sessão anônima, vinculamos a credencial para preservar 100% dos dados no mesmo UID
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        try {
          const credential = EmailAuthProvider.credential(trimmedEmail, pass);
          const cred = await linkWithCredential(auth.currentUser, credential);
          if (trimmedName && auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: trimmedName });
          }
          await syncOrCreateUserProfile(cred.user, trimmedName);
          success('Conta criada e vinculada!', 'Seus dados locais foram mantidos e sincronizados com a nuvem.');
          setIsAuthModalOpen(false);
          setTimeout(() => syncEngine.triggerSync(), 500);
          return { success: true };
        } catch (linkErr: any) {
          if (
            linkErr?.code === 'auth/credential-already-in-use' ||
            linkErr?.code === 'auth/email-already-in-use'
          ) {
            const message = 'Este e-mail já possui uma conta no sistema. Faça login para acessar seus dados na nuvem.';
            setAuthError(message);
            error('E-mail em uso', message);
            return { success: false, error: message };
          }
          throw linkErr;
        }
      }

      // Registro padrão de novo usuário
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      if (trimmedName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmedName });
      }
      await syncOrCreateUserProfile(cred.user, trimmedName);
      success('Conta criada com sucesso!', 'Seu acesso ao sistema foi configurado.');
      setIsAuthModalOpen(false);
      setTimeout(() => syncEngine.triggerSync(), 500);
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
      localStorage.removeItem(LOCAL_ENTERED_KEY);
      localStorage.removeItem(LOCAL_GUEST_UID_KEY);
      localStorage.removeItem(LOCAL_USER_PROFILE_KEY);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      syncEngine.setUserId(null);
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
      localStorage.removeItem(LOCAL_ENTERED_KEY);
      localStorage.removeItem(LOCAL_GUEST_UID_KEY);
      localStorage.removeItem(LOCAL_USER_PROFILE_KEY);
      setUser(null);
      setUserProfile(null);
      syncEngine.setUserId(null);

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

    if (data.nome && auth.currentUser && !auth.currentUser.isAnonymous) {
      try {
        await updateProfile(auth.currentUser, { displayName: data.nome });
      } catch (e) {
        console.warn('Erro ao atualizar displayName no auth:', e);
      }
    }

    if (isOnline && !user.uid.startsWith('local_')) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, updated, { merge: true });
        success('Perfil atualizado', 'Suas informações foram salvas com sucesso.');
      } catch (e) {
        console.warn('Erro ao atualizar perfil no Firestore:', e);
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

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
  testFirestoreConnection,
  db,
  doc,
  getDoc,
  setDoc,
} from '../lib/firebase';
import { AuthUser, UserProfile } from '../types';
import { syncEngine } from '../services/syncEngine';
import { useToast } from './ToastContext';

export type AuthModalMode = 'login' | 'register' | 'forgot_password';

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  isLoadingAuth: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const { success, error, info } = useToast();

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

    // Salvar localmente primeiro (resiliência offline)
    try {
      const localCached = localStorage.getItem(LOCAL_USER_PROFILE_KEY);
      if (localCached) {
        const parsed = JSON.parse(localCached);
        if (parsed.uid === firebaseUser.uid) {
          currentProfile = {
            ...currentProfile,
            ...parsed,
            updatedAt: now,
          };
        }
      }
      localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(currentProfile));
      setUserProfile(currentProfile);
    } catch (e) {
      console.warn('Erro ao salvar perfil localmente:', e);
    }

    // Sincronizar com Firestore se online
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const remoteData = userDocSnap.data() as Partial<UserProfile>;
        currentProfile = {
          ...currentProfile,
          ...remoteData,
          updatedAt: now,
        };
        await setDoc(userDocRef, currentProfile, { merge: true });
      } else {
        await setDoc(userDocRef, currentProfile);
      }
      localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(currentProfile));
      setUserProfile(currentProfile);
    } catch (e) {
      console.info('Perfil de usuário mantido em modo offline/local:', e);
    }

    return currentProfile;
  };

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const mappedUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        };
        setUser(mappedUser);
        syncEngine.setUserId(firebaseUser.uid);

        // Criar ou sincronizar o UserProfile
        await syncOrCreateUserProfile(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
        syncEngine.setUserId(null);
        localStorage.removeItem(LOCAL_USER_PROFILE_KEY);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (emailStr: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, emailStr.trim(), pass);
      await syncOrCreateUserProfile(cred.user);
      success('Sessão iniciada', `Bem-vindo de volta, ${cred.user.displayName || cred.user.email}!`);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      let message = 'Falha ao autenticar. Verifique seus dados.';
      if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-login-credentials'
      ) {
        message = 'E-mail ou senha incorretos.';
      } else if (err?.code === 'auth/user-not-found') {
        message = 'Nenhuma conta encontrada com este e-mail.';
      } else if (err?.code === 'auth/invalid-email') {
        message = 'Formato de e-mail inválido.';
      } else if (err?.code === 'auth/too-many-requests') {
        message = 'Muitas tentativas sem sucesso. Aguarde alguns minutos e tente novamente.';
      } else if (err?.code === 'auth/network-request-failed') {
        message = 'Falha de conexão com os servidores do Firebase. Verifique sua rede.';
      }
      error('Erro ao entrar', message);
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await syncOrCreateUserProfile(cred.user);
      success('Autenticado com Google', `Bem-vindo, ${cred.user.displayName || cred.user.email}!`);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      let message = 'Não foi possível autenticar com o Google.';
      if (err?.code === 'auth/popup-closed-by-user') {
        message = 'Login com Google cancelado pelo usuário.';
      } else if (err?.code === 'auth/cancelled-popup-request') {
        message = 'Abertura da janela Google cancelada.';
      } else if (err?.code === 'auth/popup-blocked') {
        message = 'O navegador bloqueou a janela pop-up do Google. Permita pop-ups para continuar.';
      } else if (err?.code === 'auth/account-exists-with-different-credential') {
        message = 'Já existe uma conta associada a este e-mail com outro método de login.';
      }
      error('Login Google', message);
      return { success: false, error: message };
    }
  };

  const register = async (emailStr: string, pass: string, displayName: string) => {
    try {
      const trimmedEmail = emailStr.trim();
      const trimmedName = displayName.trim();
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      if (trimmedName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmedName });
      }
      await syncOrCreateUserProfile(cred.user, trimmedName);
      success('Conta criada com sucesso!', 'Sua conta no Prospect OS Cloud foi criada.');
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      let message = 'Falha ao criar conta.';
      if (err?.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está registrado em outra conta.';
      } else if (err?.code === 'auth/weak-password') {
        message = 'A senha deve conter no mínimo 6 caracteres.';
      } else if (err?.code === 'auth/invalid-email') {
        message = 'Formato de e-mail inválido.';
      } else if (err?.code === 'auth/network-request-failed') {
        message = 'Falha de rede. Verifique sua conexão com a internet.';
      }
      error('Erro no cadastro', message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (emailStr: string) => {
    try {
      await sendPasswordResetEmail(auth, emailStr.trim());
      info(
        'E-mail de recuperação enviado',
        `Instruções para redefinir a senha foram enviadas para ${emailStr.trim()}.`
      );
      setAuthModalMode('login');
      return { success: true };
    } catch (err: any) {
      let message = 'Falha ao enviar e-mail de recuperação.';
      if (err?.code === 'auth/user-not-found') {
        message = 'Nenhuma conta encontrada com este endereço de e-mail.';
      } else if (err?.code === 'auth/invalid-email') {
        message = 'Formato de e-mail inválido.';
      }
      error('Recuperação de senha', message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      localStorage.removeItem(LOCAL_USER_PROFILE_KEY);
      info('Sessão encerrada', 'Seus dados continuam seguros e acessíveis localmente.');
    } catch (err: any) {
      error('Erro ao sair', err?.message || 'Não foi possível encerrar a sessão.');
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile || !user) return;
    const updated: UserProfile = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updated);
    localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(updated));

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, updated, { merge: true });
      success('Perfil atualizado', 'As alterações do seu perfil foram salvas.');
    } catch (e) {
      console.warn('Erro ao atualizar perfil na nuvem:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoadingAuth,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        loginWithGoogle,
        register,
        resetPassword,
        logout,
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

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  testFirestoreConnection,
} from '../lib/firebase';
import { AuthUser } from '../types';
import { syncEngine } from '../services/syncEngine';
import { useToast } from './ToastContext';

export type AuthModalMode = 'login' | 'register' | 'forgot_password';

interface AuthContextType {
  user: AuthUser | null;
  isLoadingAuth: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const { success, error, info } = useToast();

  useEffect(() => {
    // Check initial connection to firestore (prerequisite validation)
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
      } else {
        setUser(null);
        syncEngine.setUserId(null);
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
      success('Sessão iniciada', `Bem-vindo de volta, ${cred.user.displayName || cred.user.email}!`);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      let message = 'Falha ao autenticar. Verifique seus dados.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        message = 'E-mail ou senha incorretos.';
      } else if (err?.code === 'auth/user-not-found') {
        message = 'Usuário não encontrado.';
      } else if (err?.code === 'auth/too-many-requests') {
        message = 'Muitas tentativas sem sucesso. Tente novamente mais tarde.';
      }
      error('Erro ao entrar', message);
      return { success: false, error: message };
    }
  };

  const register = async (emailStr: string, pass: string, displayName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailStr.trim(), pass);
      if (displayName.trim() && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      }
      success('Conta criada!', 'Sua conta no Prospect OS Cloud foi criada com sucesso.');
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      let message = 'Falha ao criar conta.';
      if (err?.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está em uso por outra conta.';
      } else if (err?.code === 'auth/weak-password') {
        message = 'A senha deve conter no mínimo 6 caracteres.';
      } else if (err?.code === 'auth/invalid-email') {
        message = 'Formato de e-mail inválido.';
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
      info('Sessão encerrada', 'Seus dados continuam seguros e acessíveis localmente.');
    } catch (err: any) {
      error('Erro ao sair', err?.message || 'Não foi possível encerrar a sessão.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingAuth,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        resetPassword,
        logout,
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

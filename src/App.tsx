import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfirmDialogProvider } from './context/ConfirmDialogContext';
import { SyncProvider } from './context/SyncContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { CardSkeleton } from './components/ui/LoadingSkeleton';
import { AuthLoadingScreen } from './components/auth/AuthLoadingScreen';
import { AuthView } from './views/AuthView';

// Unified synchronous view imports — eliminates chunk mismatches and React dispatcher null errors
import { DashboardView } from './views/DashboardView';
import { ProspectingView } from './views/ProspectingView';
import { ClientsView } from './views/ClientsView';
import { PipelineView } from './views/PipelineView';
import { PlannerView } from './views/PlannerView';
import { MessagesView } from './views/MessagesView';
import { CampaignsView } from './views/CampaignsView';
import { ServicesView } from './views/ServicesView';
import { SalesEngineView } from './views/SalesEngineView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

const ViewLoadingFallback: React.FC = () => (
  <div className="space-y-6 max-w-5xl mx-auto py-8 animate-pulse">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <CardSkeleton />
  </div>
);

const MainContent: React.FC = () => {
  const { activeRoute, isLoading } = useApp();

  if (isLoading) {
    return <ViewLoadingFallback />;
  }

  switch (activeRoute) {
    case 'dashboard':
      return <DashboardView />;
    case 'prospecting':
      return <ProspectingView />;
    case 'clients':
      return <ClientsView />;
    case 'pipeline':
      return <PipelineView />;
    case 'sales-engine':
      return <SalesEngineView />;
    case 'planner':
      return <PlannerView />;
    case 'messages':
      return <MessagesView />;
    case 'campaigns':
      return <CampaignsView />;
    case 'services':
      return <ServicesView />;
    case 'analytics':
      return <AnalyticsView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
};

/**
 * Root Application Router & Authentication Guard
 */
const AppRouter: React.FC = () => {
  const { isLoadingAuth, user } = useAuth();

  // Initial authentication verification splash
  if (isLoadingAuth) {
    return <AuthLoadingScreen />;
  }

  // Se não estiver autenticado, exibe a tela de login e criação de conta por email e senha
  if (!user) {
    return <AuthView />;
  }

  return (
    <SyncProvider>
      <ConfirmDialogProvider>
        <AppProvider>
          <AppLayout>
            <MainContent />
          </AppLayout>
        </AppProvider>
      </ConfirmDialogProvider>
    </SyncProvider>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

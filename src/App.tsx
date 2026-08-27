import React, { Suspense, lazy } from 'react';
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

// Lazy Loaded Views for High Performance & Low Initial Payload
const DashboardView = lazy(() =>
  import('./views/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const ProspectingView = lazy(() =>
  import('./views/ProspectingView').then((m) => ({ default: m.ProspectingView }))
);
const ClientsView = lazy(() =>
  import('./views/ClientsView').then((m) => ({ default: m.ClientsView }))
);
const PipelineView = lazy(() =>
  import('./views/PipelineView').then((m) => ({ default: m.PipelineView }))
);
const PlannerView = lazy(() =>
  import('./views/PlannerView').then((m) => ({ default: m.PlannerView }))
);
const MessagesView = lazy(() =>
  import('./views/MessagesView').then((m) => ({ default: m.MessagesView }))
);
const CampaignsView = lazy(() =>
  import('./views/CampaignsView').then((m) => ({ default: m.CampaignsView }))
);
const ServicesView = lazy(() =>
  import('./views/ServicesView').then((m) => ({ default: m.ServicesView }))
);
const SalesEngineView = lazy(() =>
  import('./views/SalesEngineView').then((m) => ({ default: m.SalesEngineView }))
);
const AnalyticsView = lazy(() =>
  import('./views/AnalyticsView').then((m) => ({ default: m.AnalyticsView }))
);
const SettingsView = lazy(() =>
  import('./views/SettingsView').then((m) => ({ default: m.SettingsView }))
);

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

  return (
    <Suspense fallback={<ViewLoadingFallback />}>
      {(() => {
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
      })()}
    </Suspense>
  );
};

/**
 * Root Application Router & Authentication Guard
 */
const AppRouter: React.FC = () => {
  const { isLoadingAuth } = useAuth();

  // Initial authentication verification splash
  if (isLoadingAuth) {
    return <AuthLoadingScreen />;
  }

  // Resilient Offline-First Architecture:
  // App is fully usable locally and offline without authentication.
  // Private cloud sync activates automatically when authenticated.
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

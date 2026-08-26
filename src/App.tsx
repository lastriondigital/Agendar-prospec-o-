import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ConfirmDialogProvider } from './context/ConfirmDialogContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { CardSkeleton } from './components/ui/LoadingSkeleton';

// Views
import { DashboardView } from './views/DashboardView';
import { ProspectingView } from './views/ProspectingView';
import { ClientsView } from './views/ClientsView';
import { PipelineView } from './views/PipelineView';
import { PlannerView } from './views/PlannerView';
import { MessagesView } from './views/MessagesView';
import { CampaignsView } from './views/CampaignsView';
import { ServicesView } from './views/ServicesView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

const MainContent: React.FC = () => {
  const { activeRoute, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
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

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <ConfirmDialogProvider>
            <AppProvider>
              <AppLayout>
                <MainContent />
              </AppLayout>
            </AppProvider>
          </ConfirmDialogProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

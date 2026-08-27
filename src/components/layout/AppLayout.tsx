import React from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ToastContainer } from '../ui/ToastContainer';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AuthModal } from '../auth/AuthModal';
import { ConflictResolutionModal } from '../sync/ConflictResolutionModal';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#202124] dark:bg-[#121417] dark:text-[#E8EAED] flex flex-row overflow-x-hidden antialiased font-sans transition-colors duration-150">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Sticky Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Global Overlays */}
      <ToastContainer />
      <ConfirmDialog />
      <AuthModal />
      <ConflictResolutionModal />
    </div>
  );
};

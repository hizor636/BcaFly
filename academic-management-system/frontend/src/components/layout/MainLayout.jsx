import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { SemesterBar } from '../ui/SemesterBar';

export const MainLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--parchment)] text-[var(--ink)] font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="animate-spin text-lg">⏳</span> Loading BcaFly Workspaces...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[var(--parchment)] font-sans text-[var(--ink)]">
      {/* Dynamic Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--parchment)] overflow-y-auto max-h-screen">
        {/* Semester 1-6 Workspace Switcher Bar */}
        <SemesterBar />

        {/* Dynamic Nested Page Content */}
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

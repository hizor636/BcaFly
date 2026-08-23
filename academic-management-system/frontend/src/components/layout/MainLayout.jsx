import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { SemesterBar } from '../ui/SemesterBar';

export const MainLayout = () => {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--parchment)] text-[var(--ink)] font-mono text-sm p-4">
        <div className="flex items-center gap-3">
          <span className="animate-spin text-lg">⏳</span> Loading BcaFly Workspaces...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const role = user?.role?.toUpperCase() || 'ADMIN';
  const roleLabel = role === 'ADMIN' ? 'Admin' : role === 'HOD' ? 'HOD' : role === 'FACULTY' ? 'Faculty' : 'Student';

  return (
    <div className="flex min-h-screen bg-[var(--parchment)] font-sans text-[var(--ink)] overflow-x-hidden">
      {/* Dynamic Sidebar (Desktop fixed / Mobile off-canvas) */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--parchment)] overflow-y-auto max-h-screen">
        {/* Mobile Top App Header (visible only on screens < 1024px) */}
        <header className="lg:hidden px-4 py-3 bg-[var(--ink-dark)] text-[var(--parchment)] flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 text-white/90 hover:text-white rounded-md hover:bg-white/10 flex items-center justify-center cursor-pointer min-h-[40px] min-w-[40px]"
              aria-label="Open Navigation Menu"
            >
              <span className="text-xl leading-none">☰</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#F5E8C9] text-[#B8892D] flex items-center justify-center font-brand font-bold text-base shadow-xs shrink-0">
                B
              </div>
              <div>
                <span className="font-brand font-bold text-base text-white leading-none">BcaFly</span>
                <span className="text-[10px] font-mono text-[var(--brass)] ml-2 uppercase font-semibold">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="ws-tag text-[9px] hidden sm:inline-flex">SEM {user?.semester || 'ACTIVE'}</span>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-xs font-mono bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded border border-white/15 cursor-pointer min-h-[36px]"
            >
              Menu
            </button>
          </div>
        </header>

        {/* Semester 1-6 Workspace Switcher Bar */}
        <SemesterBar />

        {/* Dynamic Nested Page Content with Responsive Padding */}
        <div className="p-3 sm:p-5 lg:p-8 flex-1 min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

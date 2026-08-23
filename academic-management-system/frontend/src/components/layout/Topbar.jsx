import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../hooks/useAuth';

export const Topbar = ({ title, badge = 'YOUR ASSIGNED SEMESTER WORKSPACE' }) => {
  const { activeSemester } = useAcademic();
  const { user } = useAuth();

  return (
    <header className="h-16 px-8 bg-white border-b border-[var(--rule)] flex items-center justify-between shrink-0 shadow-2xs">
      <div className="flex items-center gap-3">
        <h2 className="font-display font-bold text-xl text-[var(--ink)]">
          {title || `Semester ${activeSemester} Workspace`}
        </h2>
        {badge && <span className="ws-tag">{badge}</span>}
      </div>

      <div className="flex items-center gap-4">
        {/* Academic Term Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--parchment-2)] border border-[var(--rule)] text-xs font-mono text-[var(--ink)]">
          <span className="text-[var(--brass-2)] font-bold">ACADEMIC YEAR:</span> 2025–26
        </div>

        <button
          className="w-8 h-8 rounded-full border border-[var(--rule)] bg-white flex items-center justify-center text-xs hover:bg-[var(--parchment-2)] cursor-pointer"
          title="Workspace Verification: Isolated Semester State Active"
          onClick={() => alert(`Semester ${activeSemester} Workspace active with complete data isolation.`)}
        >
          🛡️
        </button>
      </div>
    </header>
  );
};

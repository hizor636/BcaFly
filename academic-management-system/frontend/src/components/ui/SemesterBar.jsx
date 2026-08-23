import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../hooks/useAuth';

export const SemesterBar = () => {
  const { activeSemester, setActiveSemester, activeWorkspace } = useAcademic();
  const { user } = useAuth();

  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-[var(--parchment-2)] border-b border-[var(--rule)] flex items-center justify-between flex-wrap gap-2 sm:gap-3">
      <div className="flex items-center flex-wrap gap-2 sm:gap-3">
        <span className="text-[11px] sm:text-xs font-mono font-bold text-[var(--ink)]">
          {isStudent ? 'ENROLLED SEMESTER:' : 'SELECT SEMESTER:'}
        </span>

        {isStudent ? (
          <div className="font-mono text-xs font-bold text-[var(--brass-2)] bg-white px-3 py-1.5 rounded border border-[var(--rule)] flex items-center gap-1.5 shadow-xs">
            🔒 Verified: Sem {user?.semester || activeSemester}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {[1, 2, 3, 4, 5, 6].map(sem => (
              <button
                key={sem}
                onClick={() => setActiveSemester(sem)}
                className={`sem-tab text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[36px] ${
                  activeSemester === sem ? 'active' : ''
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono">
        <span className="text-[var(--slate)] hidden sm:inline">ACTIVE WORKSPACE:</span>
        <span className="font-bold text-[var(--ink)] bg-white px-2 sm:px-2.5 py-1 rounded border border-[var(--rule)] text-[11px] sm:text-xs truncate max-w-[200px] sm:max-w-none">
          {activeWorkspace?.name || `BCA SEMESTER ${activeSemester}`} ({activeWorkspace?.term || 'ODD TERM'})
        </span>
      </div>
    </div>
  );
};

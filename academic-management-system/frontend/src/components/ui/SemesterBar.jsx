import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../hooks/useAuth';

export const SemesterBar = () => {
  const { activeSemester, setActiveSemester, activeWorkspace } = useAcademic();
  const { user } = useAuth();

  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="px-6 py-3 bg-[var(--parchment-2)] border-b border-[var(--rule)] flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono font-bold text-[var(--ink)]">
          {isStudent ? 'ENROLLED SEMESTER:' : 'SELECT SEMESTER:'}
        </span>

        {isStudent ? (
          <div className="font-mono text-xs font-bold text-[var(--brass-2)] bg-white px-3 py-1.5 rounded border border-[var(--rule)] flex items-center gap-1.5 shadow-xs">
            🔒 Verified Semester: Semester {user?.semester || activeSemester}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6].map(sem => (
              <button
                key={sem}
                onClick={() => setActiveSemester(sem)}
                className={`sem-tab ${activeSemester === sem ? 'active' : ''}`}
              >
                [ Semester {sem} ]
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-[var(--slate)]">ACTIVE WORKSPACE:</span>
        <span className="font-bold text-[var(--ink)] bg-white px-2.5 py-1 rounded border border-[var(--rule)]">
          {activeWorkspace?.name || `BCA SEMESTER ${activeSemester}`} ({activeWorkspace?.term || 'ODD TERM'})
        </span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { calculateInternalTotal, getGradeInfo } from '../../../utils/academicCalculations';

export const AdminMarksPage = () => {
  const { activeSemester, activeWorkspace, logAction } = useAcademic();
  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code || 'BCA301');
  const [isLocked, setIsLocked] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [search, setSearch] = useState('');

  const marksData = students.map((s, idx) => {
    const cia1 = Math.min(50, Math.round(30 + (s.sgpa * 1.8)));
    const cia2 = Math.min(50, Math.round(32 + (s.sgpa * 1.7)));
    const model = Math.min(100, Math.round(60 + (s.sgpa * 3.8)));
    const assignment = 9;
    const internalTotal = calculateInternalTotal(cia1, cia2, model, assignment);
    const grade = getGradeInfo(internalTotal * 2);

    return {
      ...s,
      cia1,
      cia2,
      model,
      assignment,
      internalTotal,
      grade: grade.grade
    };
  });

  const toggleLock = () => {
    const next = !isLocked;
    setIsLocked(next);
    logAction(
      next ? 'Assessment Locked' : 'Assessment Unlocked',
      `Assessment marks for ${selectedCourse} (Sem ${activeSemester}) were ${next ? 'LOCKED' : 'UNLOCKED'}.`
    );
  };

  const togglePublish = () => {
    const next = !isPublished;
    setIsPublished(next);
    logAction(
      next ? 'Marks Published' : 'Marks Reverted to Draft',
      `Internal marks for ${selectedCourse} were ${next ? 'PUBLISHED to students' : 'REVERTED to draft'}.`
    );
  };

  const headers = ['Register No', 'Student Name', 'CIA 1 (50)', 'CIA 2 (50)', 'Model (100)', 'Assignment (10)', 'Internal Total (50)', 'Grade'];
  const rows = marksData.map(m => [
    m.reg || m.usn,
    m.name,
    m.cia1,
    m.cia2,
    m.model,
    m.assignment,
    m.internalTotal,
    m.grade
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Assessment Governance
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Continuous Internal Assessment (CIA 1 &amp; 2, Model, Assignments) validation &amp; locking.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportToolbar
            filename={`bca_sem${activeSemester}_internal_marks`}
            title={`Semester ${activeSemester} Assessment Score Sheet`}
            subtitle={`Course: ${selectedCourse}`}
            headers={headers}
            rows={rows}
            extraButtons={
              <>
                <button
                  onClick={toggleLock}
                  className="btn-ghost border border-[var(--rule)] px-3 py-1.5 rounded text-xs font-mono font-bold hover:border-[var(--brass)]"
                >
                  {isLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
                </button>
                <button
                  onClick={togglePublish}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold ${
                    isPublished ? 'bg-emerald-800 text-white' : 'btn-brass'
                  }`}
                >
                  {isPublished ? '✓ PUBLISHED' : 'PUBLISH MARKS'}
                </button>
              </>
            }
          />
        </div>
      </div>

      <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono font-bold text-[var(--ink)]">SELECT COURSE ASSESSMENT:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="field-input text-xs py-1.5 min-w-[260px]"
          >
            {courses.map(c => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name || c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[var(--slate)]">GOVERNANCE STATUS:</span>
          <Badge variant={isLocked ? 'lock' : 'amber'}>{isLocked ? 'LOCKED' : 'EDITABLE'}</Badge>
          <Badge variant={isPublished ? 'pub' : 'ink'}>{isPublished ? 'PUBLISHED' : 'DRAFT'}</Badge>
        </div>
      </div>

      <LedgerTable
        searchPlaceholder="Search assessment scores..."
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: 'Reg No',
            accessor: 'reg',
            render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
          },
          { header: 'Student Name', accessor: 'name' },
          { header: 'CIA 1 (50)', accessor: 'cia1', render: (s) => <span className="font-mono">{s.cia1}</span> },
          { header: 'CIA 2 (50)', accessor: 'cia2', render: (s) => <span className="font-mono">{s.cia2}</span> },
          { header: 'Model (100)', accessor: 'model', render: (s) => <span className="font-mono">{s.model}</span> },
          { header: 'Assignment (10)', accessor: 'assignment', render: (s) => <span className="font-mono">{s.assignment}</span> },
          {
            header: 'Internal Total (50)',
            accessor: 'internalTotal',
            render: (s) => <span className="font-mono font-bold text-sm text-[var(--brass-2)]">{s.internalTotal} / 50</span>
          },
          {
            header: 'Grade Standing',
            accessor: 'grade',
            render: (s) => (
              <Badge variant={s.grade === 'RA' ? 'fail' : 'pass'}>
                {s.grade}
              </Badge>
            )
          }
        ]}
        data={marksData}
      />
    </div>
  );
};

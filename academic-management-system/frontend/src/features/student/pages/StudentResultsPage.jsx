import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const StudentResultsPage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const { user } = useAuth();
  const courses = activeWorkspace?.courses || [];

  const gradeCard = courses.map((c, i) => {
    const internal = 45;
    const external = 46 + (i % 4);
    const total = internal + external;
    const grade = total >= 90 ? 'O' : total >= 80 ? 'A+' : 'A';
    const point = total >= 90 ? 10 : total >= 80 ? 9 : 8;

    return {
      code: c.code,
      name: c.name || c.title,
      credits: c.credits,
      internal,
      external,
      total,
      grade,
      point,
      status: 'PASS'
    };
  });

  const headers = ['Course Code', 'Course Title', 'Credits', 'Internal (50)', 'External (50)', 'Total (100)', 'Letter Grade', 'Grade Point'];
  const rows = gradeCard.map(g => [g.code, g.name, g.credits, g.internal, g.external, g.total, g.grade, g.point]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            My Examination Results — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Official semester grade sheet, credits earned, and SGPA calculation.
          </p>
        </div>
        <ExportToolbar
          filename={`my_grade_sheet_sem${activeSemester}`}
          title={`Semester ${activeSemester} Grade Sheet`}
          subtitle={`Student: ${user?.name || 'Rahul Kumar'} — SGPA: 8.85 (Distinction)`}
          headers={headers}
          rows={rows}
        />
      </div>

      <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[var(--slate)]">SEMESTER SGPA:</span>{' '}
            <span className="font-bold text-base text-[var(--ink)]">8.85</span>
          </div>
          <div>
            <span className="text-[var(--slate)]">CUMULATIVE CGPA:</span>{' '}
            <span className="font-bold text-base text-[var(--brass-2)]">8.92</span>
          </div>
          <div>
            <span className="text-[var(--slate)]">TOTAL CREDITS:</span>{' '}
            <span className="font-bold text-base">22 Credits</span>
          </div>
        </div>

        <Badge variant="pass">FIRST CLASS WITH DISTINCTION</Badge>
      </div>

      <LedgerTable
        columns={[
          {
            header: 'Course Code',
            accessor: 'code',
            render: (g) => <span className="font-mono font-bold text-[var(--ink)]">{g.code}</span>
          },
          { header: 'Course Title', accessor: 'name' },
          { header: 'Credits', accessor: 'credits', render: (g) => `${g.credits}` },
          { header: 'Internal (50)', accessor: 'internal', render: (g) => <span className="font-mono">{g.internal}</span> },
          { header: 'External (50)', accessor: 'external', render: (g) => <span className="font-mono">{g.external}</span> },
          { header: 'Total (100)', accessor: 'total', render: (g) => <span className="font-mono font-bold">{g.total}</span> },
          {
            header: 'Letter Grade',
            accessor: 'grade',
            render: (g) => <Badge variant="pass">{g.grade}</Badge>
          },
          {
            header: 'Grade Point',
            accessor: 'point',
            render: (g) => <span className="font-mono font-bold text-[var(--brass-2)]">{g.point}</span>
          }
        ]}
        data={gradeCard}
      />
    </div>
  );
};

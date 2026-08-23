import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { calculateInternalTotal, getGradeInfo } from '../../../utils/academicCalculations';

export const StudentMarksPage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const { user } = useAuth();
  const courses = activeWorkspace?.courses || [];

  const marksList = courses.map((c, i) => {
    const cia1 = 42 + (i % 5);
    const cia2 = 44 + (i % 4);
    const model = 86 + (i % 8);
    const assignment = 9;
    const internalTotal = calculateInternalTotal(cia1, cia2, model, assignment);
    const grade = getGradeInfo(internalTotal * 2);

    return {
      code: c.code,
      name: c.name || c.title,
      credits: c.credits,
      cia1,
      cia2,
      model,
      assignment,
      internalTotal,
      grade: grade.grade
    };
  });

  const headers = ['Course Code', 'Course Title', 'CIA 1 (50)', 'CIA 2 (50)', 'Model (100)', 'Assignment (10)', 'Internal Total (50)', 'Grade'];
  const rows = marksList.map(m => [m.code, m.name, m.cia1, m.cia2, m.model, m.assignment, m.internalTotal, m.grade]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            My Assessment Scores — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Continuous Internal Assessment (CIA 1, CIA 2, Model, Assignments) published scores.
          </p>
        </div>
        <ExportToolbar
          filename={`my_marks_sem${activeSemester}`}
          title={`Student Internal Assessment Statement — Semester ${activeSemester}`}
          subtitle={`Student: ${user?.name || 'Rahul Kumar'}`}
          headers={headers}
          rows={rows}
        />
      </div>

      <LedgerTable
        columns={[
          {
            header: 'Course Code',
            accessor: 'code',
            render: (m) => <span className="font-mono font-bold text-[var(--ink)]">{m.code}</span>
          },
          { header: 'Course Title', accessor: 'name' },
          { header: 'CIA 1 (50)', accessor: 'cia1', render: (m) => <span className="font-mono">{m.cia1}</span> },
          { header: 'CIA 2 (50)', accessor: 'cia2', render: (m) => <span className="font-mono">{m.cia2}</span> },
          { header: 'Model (100)', accessor: 'model', render: (m) => <span className="font-mono">{m.model}</span> },
          { header: 'Assignment (10)', accessor: 'assignment', render: (m) => <span className="font-mono">{m.assignment}</span> },
          {
            header: 'Internal Total (50)',
            accessor: 'internalTotal',
            render: (m) => <span className="font-mono font-bold text-sm text-[var(--brass-2)]">{m.internalTotal} / 50</span>
          },
          {
            header: 'Grade',
            accessor: 'grade',
            render: (m) => <Badge variant="pass">{m.grade}</Badge>
          }
        ]}
        data={marksList}
      />
    </div>
  );
};

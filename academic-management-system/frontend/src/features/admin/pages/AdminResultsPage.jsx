import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const AdminResultsPage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const students = activeWorkspace?.students || [];
  const [search, setSearch] = useState('');

  const headers = ['Register No', 'Student Name', 'Section', 'Total Credits', 'SGPA', 'CGPA', 'Arrears / Backlogs', 'Result Status'];
  const rows = students.map(s => [
    s.reg || s.usn,
    s.name,
    `Sec ${s.section}`,
    '22 Credits',
    s.sgpa?.toFixed(2),
    s.cgpa?.toFixed(2),
    s.backlogCount || 0,
    s.resultStatus || 'PASS'
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Examination Results
          </h3>
          <p className="text-xs text-[var(--slate)]">
            End-semester performance ledger, SGPA, cumulative CGPA, and backlog tracking.
          </p>
        </div>
        <ExportToolbar
          filename={`bca_sem${activeSemester}_exam_results`}
          title={`Semester ${activeSemester} Examination Results Ledger`}
          subtitle={`Batch: ${activeWorkspace?.batch} — Term: ${activeWorkspace?.term}`}
          headers={headers}
          rows={rows}
        />
      </div>

      <LedgerTable
        searchPlaceholder="Search results by student name or register number..."
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: 'Reg No',
            accessor: 'reg',
            render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
          },
          { header: 'Student Name', accessor: 'name' },
          { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
          {
            header: 'Semester SGPA',
            accessor: 'sgpa',
            render: (s) => <span className="font-mono font-bold text-sm text-[var(--brass-2)]">{s.sgpa?.toFixed(2)}</span>
          },
          {
            header: 'Cumulative CGPA',
            accessor: 'cgpa',
            render: (s) => <span className="font-mono font-bold text-sm">{s.cgpa?.toFixed(2)}</span>
          },
          {
            header: 'Backlog Count',
            accessor: 'backlogCount',
            render: (s) => (
              <span className={`font-mono font-bold ${s.backlogCount > 0 ? 'text-red-700' : 'text-[var(--slate)]'}`}>
                {s.backlogCount || 0}
              </span>
            )
          },
          {
            header: 'Result Status',
            accessor: 'resultStatus',
            render: (s) => (
              <Badge variant={s.resultStatus === 'PASS' ? 'pass' : 'fail'}>
                {s.resultStatus === 'PASS' ? 'PASS (All Clear)' : 'FAIL (Arrears Pending)'}
              </Badge>
            )
          }
        ]}
        data={students}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const AdminActivitiesPage = () => {
  const { activeSemester, activities, verifyActivity } = useAcademic();
  const [search, setSearch] = useState('');

  const semActivities = activities.filter(a => Number(a.sem) === Number(activeSemester) || !a.sem);

  const headers = ['Activity ID', 'Student Name', 'Event Title', 'Organizer', 'Date', 'Category', 'On-Duty (OD)', 'Status'];
  const rows = semActivities.map(a => [
    a.id,
    a.studentName,
    a.title,
    a.org,
    a.date,
    a.category,
    a.od ? 'Requested' : 'No',
    a.status
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Activity Portfolios &amp; OD
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Student co-curricular submissions, hackathon certs, and On-Duty attendance requests.
          </p>
        </div>
        <ExportToolbar
          filename={`bca_sem${activeSemester}_activities`}
          title={`Semester ${activeSemester} Student Activity Submissions`}
          subtitle="Portfolio & On-Duty Validation Ledger"
          headers={headers}
          rows={rows}
        />
      </div>

      <LedgerTable
        searchPlaceholder="Search by student name, event title, or organization..."
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: 'Activity ID',
            accessor: 'id',
            render: (a) => <span className="font-mono font-bold text-[var(--brass-2)]">{a.id}</span>
          },
          {
            header: 'Student',
            accessor: 'studentName',
            render: (a) => (
              <div className="font-mono text-xs">
                <div className="font-bold text-[var(--ink)]">{a.studentName}</div>
                <div className="text-[10px] text-[var(--slate)]">{a.reg}</div>
              </div>
            )
          },
          {
            header: 'Event & Organization',
            accessor: 'title',
            render: (a) => (
              <div>
                <div className="font-bold text-[var(--ink)]">{a.title}</div>
                <div className="text-[10px] font-mono text-[var(--slate)]">{a.org} • {a.date}</div>
              </div>
            )
          },
          {
            header: 'Category',
            accessor: 'category',
            render: (a) => <Badge variant="ink">{a.category}</Badge>
          },
          {
            header: 'On-Duty (OD)',
            accessor: 'od',
            render: (a) => (
              <span className={`font-mono text-xs font-bold ${a.od ? 'text-amber-700' : 'text-[var(--slate)]'}`}>
                {a.od ? '⚡ OD Requested' : '—'}
              </span>
            )
          },
          {
            header: 'Skills / Tech',
            accessor: 'skills',
            render: (a) => <span className="font-mono text-[11px] text-[var(--slate)]">{a.skills || 'N/A'}</span>
          },
          {
            header: 'Status & Action',
            accessor: 'status',
            render: (a) => (
              <div className="flex items-center gap-2">
                <Badge variant={a.status === 'VERIFIED' ? 'pass' : a.status === 'REJECTED' ? 'fail' : 'amber'}>
                  {a.status}
                </Badge>
                {a.status === 'PENDING' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => verifyActivity(a.id, 'VERIFIED', 'Verified by Administrator.')}
                      className="px-2 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-mono font-bold hover:bg-emerald-800"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => verifyActivity(a.id, 'REJECTED', 'Rejected by Administrator.')}
                      className="px-2 py-0.5 bg-red-700 text-white rounded text-[10px] font-mono font-bold hover:bg-red-800"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            )
          }
        ]}
        data={semActivities}
      />
    </div>
  );
};

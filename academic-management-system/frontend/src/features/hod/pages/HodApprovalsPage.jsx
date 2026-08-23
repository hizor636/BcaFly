import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const HodApprovalsPage = () => {
  const { activities, verifyActivity } = useAcademic();
  const [search, setSearch] = useState('');

  const headers = ['ID', 'Student Name', 'Event', 'Organizer', 'Date', 'OD Request', 'Status'];
  const rows = activities.map(a => [a.id, a.studentName, a.title, a.org, a.date, a.od ? 'Yes' : 'No', a.status]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            HOD Approvals Centre
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Review and sanction student event participations, certifications, and On-Duty (OD) claims.
          </p>
        </div>
        <ExportToolbar
          filename="hod_approvals_ledger"
          title="HOD Activity & OD Approval Ledger"
          subtitle="Department of Computer Applications"
          headers={headers}
          rows={rows}
        />
      </div>

      <LedgerTable
        searchPlaceholder="Search approval requests..."
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: 'Request ID',
            accessor: 'id',
            render: (a) => <span className="font-mono font-bold text-[var(--brass-2)]">{a.id}</span>
          },
          {
            header: 'Student Info',
            accessor: 'studentName',
            render: (a) => (
              <div className="font-mono text-xs">
                <div className="font-bold text-[var(--ink)]">{a.studentName}</div>
                <div className="text-[10px] text-[var(--slate)]">Sem {a.sem} • {a.reg}</div>
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
            header: 'Type',
            accessor: 'category',
            render: (a) => <Badge variant="ink">{a.category}</Badge>
          },
          {
            header: 'OD Claim',
            accessor: 'od',
            render: (a) => (
              <span className={`font-mono text-xs font-bold ${a.od ? 'text-amber-700' : 'text-[var(--slate)]'}`}>
                {a.od ? '⚡ On-Duty' : 'No OD'}
              </span>
            )
          },
          {
            header: 'Status & Decision',
            accessor: 'status',
            render: (a) => (
              <div className="flex items-center gap-2">
                <Badge variant={a.status === 'VERIFIED' ? 'pass' : a.status === 'REJECTED' ? 'fail' : 'amber'}>
                  {a.status}
                </Badge>
                {a.status === 'PENDING' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => verifyActivity(a.id, 'VERIFIED', 'Approved by Head of Department.')}
                      className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-mono font-bold hover:bg-emerald-800"
                    >
                      ✓ Approve OD
                    </button>
                    <button
                      onClick={() => verifyActivity(a.id, 'REJECTED', 'Declined by HOD.')}
                      className="px-2.5 py-1 bg-red-700 text-white rounded text-[10px] font-mono font-bold hover:bg-red-800"
                    >
                      ✕ Decline
                    </button>
                  </div>
                )}
              </div>
            )
          }
        ]}
        data={activities}
      />
    </div>
  );
};

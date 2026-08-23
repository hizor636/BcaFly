import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const AdminAuditPage = () => {
  const { auditLogs } = useAcademic();
  const [search, setSearch] = useState('');

  const headers = ['Log ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Details'];
  const rows = auditLogs.map(a => [a.id, a.time, a.actor, a.role, a.action, a.details]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Immutable Audit Trail
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Cryptographically structured, append-only governance log of all academic platform mutations.
          </p>
        </div>
        <ExportToolbar
          filename="bcafly_audit_logs"
          title="BcaFly Immutable Audit Trail"
          subtitle="All-Time Platform Mutation Register"
          headers={headers}
          rows={rows}
        />
      </div>

      <LedgerTable
        searchPlaceholder="Search audit events by action, actor, or details..."
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: 'Log ID',
            accessor: 'id',
            render: (a) => <span className="font-mono font-bold text-[var(--brass-2)]">{a.id}</span>
          },
          { header: 'Timestamp', accessor: 'time', render: (a) => <span className="font-mono text-xs">{a.time}</span> },
          { header: 'Actor', accessor: 'actor', render: (a) => <span className="font-mono font-bold">{a.actor}</span> },
          {
            header: 'Role',
            accessor: 'role',
            render: (a) => (
              <Badge variant={a.role === 'ADMIN' ? 'ink' : a.role === 'FACULTY' ? 'amber' : 'pass'}>
                {a.role}
              </Badge>
            )
          },
          {
            header: 'Action',
            accessor: 'action',
            render: (a) => <span className="font-mono font-semibold text-[var(--ink)]">{a.action}</span>
          },
          { header: 'Event Details', accessor: 'details', render: (a) => <span className="text-xs text-[var(--slate)]">{a.details}</span> }
        ]}
        data={auditLogs}
      />
    </div>
  );
};

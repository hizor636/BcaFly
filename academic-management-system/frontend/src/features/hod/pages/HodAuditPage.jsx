import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const HodAuditPage = () => {
  const { auditLogs } = useAcademic();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    if (roleFilter !== 'ALL' && log.role !== roleFilter) return false;
    if (search && !log.action.toLowerCase().includes(search.toLowerCase()) && !log.details.toLowerCase().includes(search.toLowerCase()) && !log.actor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const headers = ['Log ID', 'Time', 'Actor', 'Role', 'Action', 'Details'];
  const rows = filteredLogs.map(l => [l.id, l.time, l.actor, l.role, l.action, l.details]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🔒</span> DEPARTMENT GOVERNANCE &amp; AUDIT TRAIL
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Departmental Audit Trail &amp; Decision Logs
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Read-only verified log of all approvals, marks changes, attendance modifications, and faculty teaching allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename="hod_department_audit_log"
            title="Departmental Audit Log"
            subtitle="Department of Computer Applications"
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="card p-4 bg-white flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--slate)]">FILTER ROLE:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="field-input text-xs py-1 min-w-[140px]"
          >
            <option value="ALL">All Roles</option>
            <option value="HOD">HOD Actions</option>
            <option value="FACULTY">Faculty Actions</option>
            <option value="ADMIN">Admin Actions</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search action or actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input text-xs py-1 min-w-[220px]"
          />
        </div>
      </div>

      {/* Audit Log Ledger */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Institutional Audit Records ({filteredLogs.length})
          </h4>
          <span className="font-mono text-xs text-[var(--slate)]">Immutable Ledger</span>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Log ID',
              accessor: 'id',
              render: (l) => <span className="font-mono font-bold text-[var(--brass-2)]">#{l.id}</span>
            },
            {
              header: 'Timestamp',
              accessor: 'time',
              render: (l) => <span className="font-mono text-xs text-[var(--slate)]">{l.time}</span>
            },
            {
              header: 'Actor & Role',
              accessor: 'actor',
              render: (l) => (
                <div className="font-mono text-xs">
                  <strong className="text-[var(--ink)]">{l.actor}</strong>
                  <div className="mt-0.5">
                    <Badge variant={l.role === 'HOD' ? 'ink' : l.role === 'FACULTY' ? 'amber' : 'pass'}>{l.role}</Badge>
                  </div>
                </div>
              )
            },
            {
              header: 'Action Taken',
              accessor: 'action',
              render: (l) => <strong className="text-xs text-[var(--ink)]">{l.action}</strong>
            },
            {
              header: 'Audit Event Details',
              accessor: 'details',
              render: (l) => <p className="text-xs text-[var(--slate)] font-sans leading-relaxed">{l.details}</p>
            }
          ]}
          data={filteredLogs}
        />
      </div>
    </div>
  );
};

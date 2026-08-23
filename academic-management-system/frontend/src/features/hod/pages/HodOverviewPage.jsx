import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { MetricCard } from '../../../components/ui/MetricCard';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export const HodOverviewPage = () => {
  const { activeSemester, activeWorkspace, faculty, activities } = useAcademic();
  const navigate = useNavigate();

  const students = activeWorkspace?.students || [];
  const courses = activeWorkspace?.courses || [];
  const pendingApprovals = activities.filter(a => a.status === 'PENDING').length;
  const backlogs = students.filter(s => s.backlogCount > 0).length;

  const avgAttendance = students.length > 0
    ? Math.round(students.reduce((a, s) => a + (Number(s.attendance) || 0), 0) / students.length)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            HOD Department Oversight — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Department of Computer Applications • Academic monitoring and approvals oversight.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="ACTIVE ENROLMENT"
          value={students.length}
          subtitle={`● Semester ${activeSemester} Students`}
        />
        <MetricCard
          title="PENDING APPROVALS"
          value={pendingApprovals}
          subtitle="● Requires HOD Review"
          valueColor="text-amber-700"
          onClick={() => navigate('/hod/approvals')}
        />
        <MetricCard
          title="ARREARS / BACKLOGS"
          value={backlogs}
          subtitle="● Remedial Action Needed"
          valueColor={backlogs > 0 ? 'text-red-700' : 'text-emerald-700'}
          onClick={() => navigate('/hod/backlogs')}
        />
        <MetricCard
          title="AVERAGE ATTENDANCE"
          value={`${avgAttendance}%`}
          subtitle="● Department Standard: 75%"
          valueColor="text-emerald-700"
        />
      </div>

      {/* Faculty Workload Table */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3 border-b border-[var(--rule)] pb-2">
          <div className="font-display font-bold text-sm text-[var(--ink)]">
            Department Faculty Teaching Allocation
          </div>
        </div>

        <LedgerTable
          columns={[
            { header: 'Faculty Name', accessor: 'name', render: (f) => <span className="font-mono font-bold">{f.name}</span> },
            { header: 'Designation', accessor: 'role' },
            {
              header: 'Assigned in Sem ' + activeSemester,
              accessor: 'id',
              render: (f) => {
                const assigned = courses.filter(c => c.facultyId === f.id);
                return (
                  <div className="flex flex-wrap gap-1">
                    {assigned.length > 0 ? (
                      assigned.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[var(--parchment-2)] border border-[var(--rule)] rounded text-xs font-mono font-bold">
                          {c.code}
                        </span>
                      ))
                    ) : (
                      <span className="text-[var(--slate)] text-[10px] italic">No active course</span>
                    )}
                  </div>
                );
              }
            },
            {
              header: 'Status',
              accessor: 'id',
              render: () => <Badge variant="pass">ACTIVE</Badge>
            }
          ]}
          data={faculty}
        />
      </div>
    </div>
  );
};

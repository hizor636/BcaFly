import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export const HodOverviewPage = () => {
  const {
    activeSemester,
    activeWorkspace,
    faculty,
    activities,
    studentRiskCases,
    facultyAllocations,
    backlogRecords,
    detailedAttendance
  } = useAcademic();
  const navigate = useNavigate();

  const students = activeWorkspace?.students || [];
  const courses = activeWorkspace?.courses || [];

  const pendingApprovals = activities.filter(
    a => a.status === 'SUBMITTED' || a.status === 'FACULTY_RECOMMENDED' || a.status === 'PENDING'
  );

  const activeBacklogs = backlogRecords.filter(b => b.status !== 'CLEARED');
  const highRiskStudents = studentRiskCases.filter(c => c.riskLevel === 'HIGH');
  const unassignedFaculty = facultyAllocations.filter(a => a.status === 'UNASSIGNED');

  const avgAttendance = students.length > 0
    ? Math.round(students.reduce((a, s) => a + (Number(s.attendance) || 0), 0) / students.length)
    : 83;

  return (
    <div className="space-y-6">
      {/* HOD Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-lg border border-[var(--rule)] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-2 font-bold">
            <span>🏛️</span> HEAD OF DEPARTMENT GOVERNANCE CONSOLE
          </div>
          <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
            Department of Computer Applications
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-[var(--slate)] mt-1.5">
            <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--ink)]">
              HOD: <strong>Dr. A. Sharma (Professor &amp; Head)</strong>
            </span>
            <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)]">
              Active Workspace: <strong className="text-[var(--ink)]">BCA Semester {activeSemester} (2025–26 ODD)</strong>
            </span>
            <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)]">
              Accreditation: <strong className="text-emerald-800">NAAC A++ / NBA Compliant</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/hod/approvals')}
            className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>⚡</span> Approvals Centre ({pendingApprovals.length})
          </button>
          <button
            onClick={() => navigate('/hod/academic-monitoring')}
            className="btn-ink px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>📊</span> Academic Monitor
          </button>
        </div>
      </div>

      {/* Quick Action Launcher Bar */}
      <div className="bg-[var(--parchment-2)] p-3 rounded-lg border border-[var(--rule)] flex items-center justify-between overflow-x-auto gap-2 text-xs font-mono">
        <span className="text-[var(--slate)] font-bold uppercase tracking-wider shrink-0 pl-1">HOD GOVERNANCE:</span>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => navigate('/hod/approvals')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            ⚡ Approvals ({pendingApprovals.length})
          </button>
          <button onClick={() => navigate('/hod/students-at-risk')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            🚨 At-Risk Intervention ({studentRiskCases.length})
          </button>
          <button onClick={() => navigate('/hod/backlogs')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            ⚠️ Backlog Remedial ({activeBacklogs.length})
          </button>
          <button onClick={() => navigate('/hod/faculty-allocations')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            👨‍🏫 Faculty Workload
          </button>
          <button onClick={() => navigate('/hod/timetable')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            🗓️ Timetable Governance
          </button>
          <button onClick={() => navigate('/hod/reports')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            📈 Department Reports
          </button>
          <button onClick={() => navigate('/hod/audit')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            🔒 Audit Trail
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="ACTIVE ENROLMENT"
          value={`${students.length} Students`}
          subtitle={`Semester ${activeSemester} Active Roster`}
          onClick={() => navigate('/hod/academic-records')}
        />
        <MetricCard
          title="PENDING APPROVALS"
          value={`${pendingApprovals.length} Requests`}
          subtitle="Activity/OD & Attendance Appeals"
          valueColor={pendingApprovals.length > 0 ? 'text-amber-700' : 'text-emerald-800'}
          onClick={() => navigate('/hod/approvals')}
        />
        <MetricCard
          title="ARREARS & BACKLOGS"
          value={`${activeBacklogs.length} Cases`}
          subtitle="Remedial coaching in progress"
          valueColor={activeBacklogs.length > 0 ? 'text-red-700' : 'text-emerald-800'}
          onClick={() => navigate('/hod/backlogs')}
        />
        <MetricCard
          title="AVERAGE ATTENDANCE"
          value={`${avgAttendance}%`}
          subtitle="Department Standard: ≥75%"
          valueColor={avgAttendance >= 75 ? 'text-emerald-800' : 'text-red-700'}
          onClick={() => navigate('/hod/academic-monitoring')}
        />
      </div>

      {/* Priority Alerts Strip */}
      <div className="grid md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-300 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <strong className="text-amber-900 block font-bold">Attendance Shortage Alert</strong>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Course <strong>BCA304</strong> (Operating Systems) has 1 student below 75% threshold.
            </p>
            <button
              onClick={() => navigate('/hod/students-at-risk')}
              className="text-[10px] text-amber-900 font-bold underline mt-1 cursor-pointer"
            >
              Review Intervention Plan →
            </button>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-blue-50/80 border border-blue-300 flex items-start gap-3">
          <span className="text-xl">👨‍🏫</span>
          <div>
            <strong className="text-blue-900 block font-bold">Faculty Workload Alert</strong>
            <p className="text-[11px] text-blue-800 mt-0.5">
              Prof. R. Deshmukh has 0 active teaching hours assigned in Semester {activeSemester}.
            </p>
            <button
              onClick={() => navigate('/hod/faculty-allocations')}
              className="text-[10px] text-blue-900 font-bold underline mt-1 cursor-pointer"
            >
              Allocate Elective / Tutorial →
            </button>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-purple-50/80 border border-purple-300 flex items-start gap-3">
          <span className="text-xl">⚡</span>
          <div>
            <strong className="text-purple-900 block font-bold">CIA 2 Entry Window Open</strong>
            <p className="text-[11px] text-purple-800 mt-0.5">
              Continuous Internal Assessment 2 marks entry window closing in 4 days.
            </p>
            <button
              onClick={() => navigate('/hod/academic-monitoring')}
              className="text-[10px] text-purple-900 font-bold underline mt-1 cursor-pointer"
            >
              Inspect Evaluation Progress →
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Approvals & Academic Monitoring Summary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pending Approval Queue */}
          <div className="card p-5 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>⚡</span> Urgent Approval Decision Queue
                </h3>
                <p className="text-xs text-[var(--slate)] font-mono">
                  {pendingApprovals.length} requests awaiting Head of Department sanction
                </p>
              </div>
              <button
                onClick={() => navigate('/hod/approvals')}
                className="text-xs font-mono text-[var(--brass-2)] font-bold hover:underline cursor-pointer"
              >
                Approvals Centre →
              </button>
            </div>

            {pendingApprovals.length === 0 ? (
              <p className="text-xs font-mono text-[var(--slate)] py-4 text-center">
                All departmental requests and OD claims are cleared.
              </p>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {pendingApprovals.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-lg border border-[var(--rule)] bg-[var(--parchment)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[var(--ink)]">{req.studentName}</span>
                        <Badge variant="ink">{req.category}</Badge>
                        {req.od && <span className="text-[10px] text-amber-800 font-bold">⚡ OD: {req.attendanceCreditDays || 2} Days</span>}
                      </div>
                      <div className="text-xs font-sans text-[var(--slate)] line-clamp-1">{req.title}</div>
                      <div className="text-[10px] text-[var(--slate)] mt-0.5">Faculty Rec: &ldquo;{req.facultyRemarks || 'Recommended'}&rdquo;</div>
                    </div>

                    <button
                      onClick={() => navigate('/hod/approvals')}
                      className="btn-brass px-3 py-1.5 rounded font-bold text-xs shadow-2xs cursor-pointer shrink-0"
                    >
                      Sanction / Decide →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Faculty Allocation Snapshot */}
          <div className="card p-5 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
              <h3 className="font-display font-bold text-base text-[var(--ink)]">
                Department Faculty Workload Snapshot
              </h3>
              <button
                onClick={() => navigate('/hod/faculty-allocations')}
                className="text-xs font-mono text-[var(--brass-2)] font-bold hover:underline cursor-pointer"
              >
                Manage Allocations →
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 font-mono text-xs">
              {faculty.map((f) => {
                const assigned = courses.filter(c => c.facultyId === f.id);
                const isUnassigned = assigned.length === 0;

                return (
                  <div
                    key={f.id}
                    className={`p-3.5 rounded-lg border flex flex-col justify-between space-y-2 ${
                      isUnassigned ? 'bg-amber-50/50 border-amber-300' : 'bg-[var(--parchment)] border-[var(--rule)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-[var(--ink)]">{f.name}</strong>
                        <Badge variant={isUnassigned ? 'amber' : 'pass'}>{isUnassigned ? 'UNASSIGNED' : 'ACTIVE'}</Badge>
                      </div>
                      <span className="text-[10px] text-[var(--slate)] block">{f.role}</span>
                    </div>

                    <div className="pt-2 border-t border-[var(--rule)]/60 text-[11px] flex justify-between">
                      <span>Assigned:</span>
                      <strong>{assigned.map(c => c.code).join(', ') || 'No active course'}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Students-at-Risk & Backlogs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Students at Academic Risk */}
          <div className="card p-5 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>🚨</span> Students at Academic Risk
                </h3>
                <p className="text-xs text-[var(--slate)] font-mono">{studentRiskCases.length} Active Intervention Cases</p>
              </div>
              <button
                onClick={() => navigate('/hod/students-at-risk')}
                className="text-xs font-mono text-[var(--brass-2)] font-bold hover:underline cursor-pointer"
              >
                Track All →
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {studentRiskCases.map((c) => (
                <div key={c.id} className="p-3.5 rounded-lg bg-[var(--parchment)] border border-[var(--rule)] space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-[var(--ink)]">{c.studentName} ({c.reg})</strong>
                    <Badge variant={c.riskLevel === 'HIGH' ? 'fail' : 'amber'}>{c.riskLevel} RISK</Badge>
                  </div>
                  <div className="text-[11px] text-[var(--slate)] space-y-0.5">
                    <div>Attendance: <strong className={c.attendance < 75 ? 'text-red-700' : 'text-emerald-800'}>{c.attendance}%</strong> • SGPA: <strong>{c.sgpa}</strong></div>
                    <div>Mentor: <strong className="text-[var(--brass-2)]">{c.mentorName || 'Unassigned'}</strong></div>
                  </div>
                  <p className="text-[11px] font-sans text-[var(--ink)] bg-white p-2 rounded border border-[var(--rule)]">
                    {c.interventionPlan}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrears & Remedial Status */}
          <div className="card p-5 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>⚠️</span> Standing Arrears / Backlogs
                </h3>
                <p className="text-xs text-[var(--slate)] font-mono">{activeBacklogs.length} Arrears registered</p>
              </div>
              <button
                onClick={() => navigate('/hod/backlogs')}
                className="text-xs font-mono text-[var(--brass-2)] font-bold hover:underline cursor-pointer"
              >
                Register →
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {activeBacklogs.map((b) => (
                <div key={b.id} className="p-3 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-[var(--ink)]">{b.studentName}</span>
                    <span className="text-red-700">{b.failedCourseCode}</span>
                  </div>
                  <div className="text-[11px] text-[var(--slate)]">{b.failedCourseName}</div>
                  <div className="text-[10px] text-[var(--brass-2)] font-bold pt-1">
                    Mentor: {b.mentorName} • Status: {b.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

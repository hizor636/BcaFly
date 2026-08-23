import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { Modal } from '../../../components/ui/Modal';

export const HodBacklogsPage = () => {
  const { activeSemester, faculty, backlogRecords, updateBacklogRemedialPlan } = useAcademic();

  const [selectedBacklog, setSelectedBacklog] = useState(null);
  const [mentorFacultyId, setMentorFacultyId] = useState(faculty[0]?.id || 'FAC01');
  const [remedialPlan, setRemedialPlan] = useState('');
  const [status, setStatus] = useState('IN_PROGRESS');
  const [actionSuccess, setActionSuccess] = useState(null);

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!selectedBacklog) return;

    const mentorObj = faculty.find(f => f.id === mentorFacultyId) || { name: 'Dr. A. Sharma' };

    updateBacklogRemedialPlan(selectedBacklog.id, {
      mentorFacultyId,
      mentorName: mentorObj.name,
      remedialPlan,
      status
    });

    setActionSuccess(`✓ Backlog record #${selectedBacklog.id} updated successfully.`);
    setSelectedBacklog(null);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const headers = ['Record ID', 'Register No', 'Student Name', 'Failed Subject', 'Exam Session', 'Attempt', 'Marks Obtained', 'Mentor Faculty', 'Remedial Attendance', 'Re-Exam Eligibility', 'Status'];
  const rows = backlogRecords.map(b => [
    b.id,
    b.reg,
    b.studentName,
    `${b.failedCourseCode} - ${b.failedCourseName}`,
    b.examSession,
    b.attemptCount,
    `${b.marksObtained}/100`,
    b.mentorName || 'Unassigned',
    `${b.remedialAttendancePercentage}%`,
    b.reExamEligibility,
    b.status
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>⚠️</span> ARREAR &amp; REMEDIAL GOVERNANCE
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Department Backlog &amp; Remedial Coaching Register
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Track standing arrears, assign faculty coaching mentors, verify remedial class attendance, and clear backlogs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename={`hod_backlog_register_sem${activeSemester}`}
            title={`Department Backlog Register — Semester ${activeSemester}`}
            subtitle="Department of Computer Applications"
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          {actionSuccess}
        </div>
      )}

      {/* Backlog Records Ledger */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Active Arrear Records ({backlogRecords.length})
          </h4>
          <span className="font-mono text-xs text-[var(--slate)]">Continuous Remedial Tracking</span>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Record ID',
              accessor: 'id',
              render: (b) => <span className="font-mono font-bold text-[var(--brass-2)]">#{b.id}</span>
            },
            {
              header: 'Student Info',
              accessor: 'studentName',
              render: (b) => (
                <div className="font-mono text-xs">
                  <div className="font-bold text-[var(--ink)]">{b.studentName}</div>
                  <div className="text-[10px] text-[var(--slate)]">{b.reg}</div>
                </div>
              )
            },
            {
              header: 'Arrear Subject',
              accessor: 'failedCourseCode',
              render: (b) => (
                <div>
                  <span className="font-mono font-bold text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {b.failedCourseCode}
                  </span>
                  <div className="font-bold text-xs text-[var(--ink)] mt-1">{b.failedCourseName}</div>
                  <div className="text-[10px] font-mono text-[var(--slate)]">Attempt #{b.attemptCount} • Score: {b.marksObtained}/100</div>
                </div>
              )
            },
            {
              header: 'Coaching Mentor & Plan',
              accessor: 'mentorName',
              render: (b) => (
                <div className="font-mono text-xs">
                  <strong className="text-[var(--brass-2)]">{b.mentorName}</strong>
                  <p className="text-[11px] font-sans text-[var(--slate)] italic line-clamp-1">{b.remedialPlan}</p>
                </div>
              )
            },
            {
              header: 'Remedial Attendance',
              accessor: 'remedialAttendancePercentage',
              render: (b) => (
                <span className="font-mono font-bold text-emerald-800 text-xs">
                  {b.remedialAttendancePercentage}% Attended
                </span>
              )
            },
            {
              header: 'Status & Action',
              accessor: 'status',
              render: (b) => (
                <div className="flex items-center gap-2">
                  <Badge variant={b.status === 'CLEARED' ? 'pass' : b.status === 'RE_EXAM_ELIGIBLE' ? 'ink' : 'amber'}>
                    {b.status}
                  </Badge>
                  <button
                    onClick={() => {
                      setSelectedBacklog(b);
                      setRemedialPlan(b.remedialPlan);
                      setStatus(b.status);
                    }}
                    className="px-2.5 py-1 bg-[var(--parchment-2)] hover:bg-[var(--brass-soft)] rounded font-mono text-[11px] font-bold border border-[var(--rule)] cursor-pointer"
                  >
                    ✏️ Manage
                  </button>
                </div>
              )
            }
          ]}
          data={backlogRecords}
        />
      </div>

      {/* Edit Backlog Plan Modal */}
      {selectedBacklog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBacklog(null)}
          title={`Remedial Plan — ${selectedBacklog.studentName}`}
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg font-mono space-y-1">
              <div>Student: <strong className="text-[var(--ink)]">{selectedBacklog.studentName}</strong> ({selectedBacklog.reg})</div>
              <div>Arrear Subject: <strong className="text-red-700">{selectedBacklog.failedCourseCode} — {selectedBacklog.failedCourseName}</strong></div>
              <div>Attempt Count: <strong>#{selectedBacklog.attemptCount}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Assign Remedial Mentor:</label>
                <select
                  value={mentorFacultyId}
                  onChange={(e) => setMentorFacultyId(e.target.value)}
                  className="field-input text-xs font-mono font-bold"
                >
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Backlog Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="field-input text-xs font-mono font-bold"
                >
                  <option value="IN_PROGRESS">Remedial In Progress</option>
                  <option value="RE_EXAM_ELIGIBLE">Re-Exam Eligible (Permit Hall Ticket)</option>
                  <option value="AWAITING_RESULT">Awaiting Re-Exam Result</option>
                  <option value="CLEARED">Cleared (Arrear Resolved)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Remedial Coaching Plan &amp; Schedule *:</label>
              <textarea
                rows={3}
                required
                value={remedialPlan}
                onChange={(e) => setRemedialPlan(e.target.value)}
                placeholder="Specify tutorial schedule, problem solving sessions..."
                className="field-input text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setSelectedBacklog(null)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Save Remedial Plan →
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

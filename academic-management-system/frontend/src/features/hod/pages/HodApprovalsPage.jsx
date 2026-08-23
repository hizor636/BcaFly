import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { Modal } from '../../../components/ui/Modal';

export const HodApprovalsPage = () => {
  const { activities, detailedAttendance, hodApproveRequest } = useAcademic();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  // Combine Activity / OD Claims & Attendance Correction requests into a single unified queue
  const activityRequests = activities.map(a => ({
    id: a.id,
    type: 'ACTIVITY',
    category: a.category,
    studentName: a.studentName,
    reg: a.reg,
    title: a.title,
    details: a.description,
    od: a.od,
    creditDays: a.attendanceCreditDays || 2,
    facultyRemarks: a.facultyRemarks || 'Recommended by Faculty Advisor',
    status: a.status,
    raw: a
  }));

  const attendanceRequests = (detailedAttendance?.correctionRequests || []).map(r => ({
    id: r.id,
    type: 'ATTENDANCE_CORRECTION',
    category: 'Attendance Appeal',
    studentName: r.studentName,
    reg: r.studentId,
    title: `Attendance Correction — ${r.courseCode}`,
    details: `Date: ${r.date} (Period ${r.period}) — Reason: "${r.reason}"`,
    od: false,
    creditDays: 0,
    facultyRemarks: r.facultyRemarks || 'Verified by Course Instructor',
    status: r.status === 'UNDER_REVIEW' ? 'PENDING' : r.status,
    raw: r
  }));

  const allRequests = [...activityRequests, ...attendanceRequests];

  const filteredRequests = allRequests.filter(r => {
    if (categoryFilter !== 'ALL' && r.type !== categoryFilter) return false;
    if (statusFilter === 'PENDING' && !(r.status === 'SUBMITTED' || r.status === 'FACULTY_RECOMMENDED' || r.status === 'PENDING' || r.status === 'UNDER_REVIEW')) return false;
    if (statusFilter === 'APPROVED' && !(r.status === 'HOD_APPROVED' || r.status === 'APPROVED' || r.status === 'VERIFIED')) return false;
    if (statusFilter === 'REJECTED' && !(r.status === 'HOD_REJECTED' || r.status === 'REJECTED')) return false;
    if (search && !r.studentName.toLowerCase().includes(search.toLowerCase()) && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDecision = (decision) => {
    if (!selectedRequest) return;

    hodApproveRequest(selectedRequest.type, selectedRequest.id, decision, decisionRemarks || (decision === 'APPROVED' ? 'Sanctioned by Head of Department.' : 'Declined per departmental review.'));

    setActionSuccess(`✓ Request #${selectedRequest.id} marked as ${decision}. Notification sent to student & faculty.`);
    setSelectedRequest(null);
    setDecisionRemarks('');
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const headers = ['Request ID', 'Type', 'Student Name', 'Title / Description', 'Faculty Recommendation', 'Status'];
  const rows = filteredRequests.map(r => [r.id, r.category, r.studentName, r.title, r.facultyRemarks, r.status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>⚡</span> CENTRALIZED DEPARTMENT APPROVALS CENTRE
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            HOD Governance &amp; Decision Queue
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Sanction co-curricular OD claims, verify attendance correction appeals, and review academic exceptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename="hod_centralized_approvals"
            title="HOD Approval Ledger"
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

      {/* Control Bar: Filters & Search */}
      <div className="card p-4 bg-white flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">TYPE:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="field-input text-xs py-1 min-w-[160px]"
            >
              <option value="ALL">All Request Types</option>
              <option value="ACTIVITY">Activity / OD Claims</option>
              <option value="ATTENDANCE_CORRECTION">Attendance Appeals</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">STATUS:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="field-input text-xs py-1 min-w-[150px]"
            >
              <option value="PENDING">Pending HOD Review</option>
              <option value="APPROVED">Approved / Sanctioned</option>
              <option value="REJECTED">Declined</option>
              <option value="ALL">All Statuses</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">SEARCH:</label>
          <input
            type="text"
            placeholder="Search student or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input text-xs py-1 min-w-[220px]"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card p-5 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Approval Requests Queue ({filteredRequests.length})
          </h4>
          <span className="font-mono text-xs text-[var(--slate)]">Head of Department Sanction Required</span>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Request ID',
              accessor: 'id',
              render: (r) => <span className="font-mono font-bold text-[var(--brass-2)]">#{r.id}</span>
            },
            {
              header: 'Student Info',
              accessor: 'studentName',
              render: (r) => (
                <div className="font-mono text-xs">
                  <div className="font-bold text-[var(--ink)]">{r.studentName}</div>
                  <div className="text-[10px] text-[var(--slate)]">{r.reg}</div>
                </div>
              )
            },
            {
              header: 'Request Title & Details',
              accessor: 'title',
              render: (r) => (
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Badge variant="ink">{r.category}</Badge>
                    {r.od && <span className="text-[10px] font-mono text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">⚡ OD: {r.creditDays}d</span>}
                  </div>
                  <div className="font-bold text-xs text-[var(--ink)]">{r.title}</div>
                  <p className="text-[11px] text-[var(--slate)] line-clamp-1">{r.details}</p>
                </div>
              )
            },
            {
              header: 'Faculty Mentor Note',
              accessor: 'facultyRemarks',
              render: (r) => (
                <span className="text-[11px] font-mono text-emerald-800 italic">
                  &ldquo;{r.facultyRemarks}&rdquo;
                </span>
              )
            },
            {
              header: 'Decision & Action',
              accessor: 'id',
              render: (r) => {
                const isPending = r.status === 'SUBMITTED' || r.status === 'FACULTY_RECOMMENDED' || r.status === 'PENDING' || r.status === 'UNDER_REVIEW';
                return (
                  <div className="flex items-center gap-2">
                    <Badge variant={r.status === 'HOD_APPROVED' || r.status === 'APPROVED' || r.status === 'VERIFIED' ? 'pass' : r.status === 'HOD_REJECTED' || r.status === 'REJECTED' ? 'fail' : 'amber'}>
                      {r.status}
                    </Badge>
                    {isPending && (
                      <button
                        onClick={() => {
                          setSelectedRequest(r);
                          setDecisionRemarks('');
                        }}
                        className="btn-brass px-3 py-1 rounded text-xs font-mono font-bold shadow-2xs cursor-pointer"
                      >
                        Sanction →
                      </button>
                    )}
                  </div>
                );
              }
            }
          ]}
          data={filteredRequests}
        />
      </div>

      {/* Decision Modal */}
      {selectedRequest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          title={`HOD Decision — Request #${selectedRequest.id}`}
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg font-mono space-y-1">
              <div>Student: <strong className="text-[var(--ink)]">{selectedRequest.studentName}</strong> ({selectedRequest.reg})</div>
              <div>Type: <strong>{selectedRequest.category}</strong></div>
              <div>Subject: <strong>{selectedRequest.title}</strong></div>
              {selectedRequest.od && <div>OD Credit Days: <strong className="text-amber-800">{selectedRequest.creditDays} Days</strong></div>}
            </div>

            <div className="p-3 bg-white border border-[var(--rule)] rounded space-y-1">
              <strong className="font-mono text-[10px] text-[var(--slate)] uppercase block">Faculty Recommendation:</strong>
              <p className="text-xs italic text-[var(--ink)]">&ldquo;{selectedRequest.facultyRemarks}&rdquo;</p>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">HOD Decision Remarks / Reason *:</label>
              <textarea
                rows={3}
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                placeholder="e.g. Sanctioned based on faculty verification and event certificate."
                className="field-input text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDecision('REJECTED')}
                className="px-4 py-2 bg-red-700 text-white rounded font-bold cursor-pointer hover:bg-red-800"
              >
                Decline ✗
              </button>
              <button
                type="button"
                onClick={() => handleDecision('APPROVED')}
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Sanction &amp; Sign-Off ✓
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

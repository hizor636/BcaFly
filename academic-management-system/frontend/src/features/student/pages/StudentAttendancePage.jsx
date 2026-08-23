import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { Modal } from '../../../components/ui/Modal';

export const StudentAttendancePage = () => {
  const { activeSemester, detailedAttendance, submitAttendanceCorrection } = useAcademic();
  const { user } = useAuth();

  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedCourseForCorrection, setSelectedCourseForCorrection] = useState('');
  const [correctionDate, setCorrectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [correctionPeriod, setCorrectionPeriod] = useState('1');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionSuccess, setCorrectionSuccess] = useState(false);

  const summaries = detailedAttendance?.summary || [];
  const records = detailedAttendance?.records || [];
  const correctionRequests = detailedAttendance?.correctionRequests || [];

  // Calculate overall attendance aggregate
  const totalConducted = summaries.reduce((acc, s) => acc + s.totalClasses, 0);
  const totalAttended = summaries.reduce((acc, s) => acc + s.attendedClasses, 0);
  const overallPercentage = totalConducted === 0 ? 0 : Math.round((totalAttended / totalConducted) * 100);

  const exportHeaders = ['Course Code', 'Course Title', 'Conducted', 'Attended', 'Absent', 'OD Credit', 'Percentage', 'Status'];
  const exportRows = summaries.map(s => [
    s.courseCode,
    s.courseName,
    s.totalClasses,
    s.attendedClasses,
    s.absentClasses,
    s.odClasses,
    `${s.attendancePercentage}%`,
    s.attendancePercentage >= 75 ? 'ELIGIBLE' : 'SHORTAGE RISK'
  ]);

  const handleOpenCorrection = (courseCode) => {
    setSelectedCourseForCorrection(courseCode || (summaries[0]?.courseCode || 'BCA304'));
    setCorrectionModalOpen(true);
    setCorrectionSuccess(false);
  };

  const handleCorrectionSubmit = (e) => {
    e.preventDefault();
    if (!correctionReason.trim()) return;

    submitAttendanceCorrection({
      courseCode: selectedCourseForCorrection,
      date: correctionDate,
      period: correctionPeriod,
      reason: correctionReason,
      studentId: user?.id || 'student-s3-001',
      studentName: user?.name || 'Rahul Kumar'
    });

    setCorrectionSuccess(true);
    setTimeout(() => {
      setCorrectionModalOpen(false);
      setCorrectionReason('');
      setCorrectionSuccess(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>⏱️</span> ATTENDANCE TRANSPARENCY &amp; REGULATORY BENCHMARK
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Detailed Subject &amp; Date Attendance — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Official lecture registers, On-Duty (OD) adjusted sessions, condonation calculations, and correction requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCorrection('')}
            className="btn-brass px-3.5 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>📝</span> Request Attendance Correction
          </button>
          <ExportToolbar
            filename={`bca_attendance_sem${activeSemester}`}
            title={`BCA Semester ${activeSemester} Official Attendance Statement`}
            subtitle={`Student: ${user?.name || 'Rahul Kumar'} — Overall: ${overallPercentage}%`}
            headers={exportHeaders}
            rows={exportRows}
          />
        </div>
      </div>

      {/* Aggregate Standing Card */}
      <div className="p-5 bg-white border border-[var(--rule)] rounded-lg shadow-2xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6 flex-wrap text-xs font-mono">
          <div>
            <span className="text-[var(--slate)] block text-[10px]">AGGREGATE ATTENDANCE:</span>
            <span className={`text-2xl font-bold ${overallPercentage >= 75 ? 'text-emerald-800' : 'text-red-700'}`}>
              {overallPercentage}%
            </span>
          </div>

          <div>
            <span className="text-[var(--slate)] block text-[10px]">TOTAL CLASSES:</span>
            <span className="text-base font-bold text-[var(--ink)]">{totalAttended} / {totalConducted} Hours</span>
          </div>

          <div>
            <span className="text-[var(--slate)] block text-[10px]">UNIVERSITY THRESHOLD:</span>
            <span className="text-base font-bold text-[var(--brass-2)]">≥ 75.0% Mandatory</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {overallPercentage >= 75 ? (
            <Badge variant="pass">HALL TICKET ELIGIBLE ✓</Badge>
          ) : (
            <Badge variant="fail">CONDONATION / DEBARRED WARNING ⚠️</Badge>
          )}
        </div>
      </div>

      {/* Subject-Wise Ledger Breakdown */}
      <div className="card p-5 bg-white">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-2.5">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Course-Wise Attendance Statement &amp; Shortage Recovery
          </h4>
          <span className="font-mono text-xs text-[var(--slate)]">{summaries.length} Enrolled Courses</span>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Course Code',
              accessor: 'courseCode',
              render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.courseCode}</span>
            },
            {
              header: 'Course Title',
              accessor: 'courseName',
              render: (s) => (
                <div>
                  <div className="font-bold text-xs text-[var(--ink)]">{s.courseName}</div>
                  {s.shortageRisk && (
                    <div className="text-[10px] font-mono text-red-700 font-semibold mt-0.5">
                      ⚠️ Shortage: Attend next {s.requiredFutureClasses} classes without absence to reach 75%
                    </div>
                  )}
                </div>
              )
            },
            {
              header: 'Conducted',
              accessor: 'totalClasses',
              render: (s) => <span className="font-mono">{s.totalClasses} Hrs</span>
            },
            {
              header: 'Attended',
              accessor: 'attendedClasses',
              render: (s) => <span className="font-mono font-bold text-emerald-800">{s.attendedClasses} Hrs</span>
            },
            {
              header: 'Absent',
              accessor: 'absentClasses',
              render: (s) => <span className="font-mono text-red-700 font-semibold">{s.absentClasses} Hrs</span>
            },
            {
              header: 'OD Credit',
              accessor: 'odClasses',
              render: (s) => <span className="font-mono text-[var(--brass-2)] font-semibold">{s.odClasses} Hrs</span>
            },
            {
              header: 'Percentage',
              accessor: 'attendancePercentage',
              render: (s) => (
                <span className={`font-mono font-bold text-sm ${s.attendancePercentage >= 75 ? 'text-emerald-800' : 'text-red-700'}`}>
                  {s.attendancePercentage}%
                </span>
              )
            },
            {
              header: 'Eligibility Standing',
              accessor: 'shortageRisk',
              render: (s) => (
                <Badge variant={s.attendancePercentage >= 75 ? 'pass' : 'fail'}>
                  {s.attendancePercentage >= 75 ? 'ELIGIBLE' : 'SHORTAGE RISK'}
                </Badge>
              )
            },
            {
              header: 'Action',
              accessor: 'courseCode',
              render: (s) => (
                <button
                  onClick={() => handleOpenCorrection(s.courseCode)}
                  className="px-2.5 py-1 bg-[var(--parchment-2)] hover:bg-[var(--brass-soft)] text-[var(--ink)] hover:text-[var(--brass-2)] rounded font-mono text-[11px] font-bold border border-[var(--rule)] transition cursor-pointer"
                >
                  Correction
                </button>
              )
            }
          ]}
          data={summaries}
        />
      </div>

      {/* Date-Wise Recent Attendance Log */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Date-Wise History */}
        <div className="lg:col-span-8 card p-5 bg-white">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-2.5">
            <h4 className="font-display font-bold text-base text-[var(--ink)]">
              Date-Wise Attendance History &amp; Biometric Records
            </h4>
            <span className="font-mono text-xs text-[var(--slate)]">{records.length} Recent Records</span>
          </div>

          <LedgerTable
            columns={[
              {
                header: 'Date & Period',
                accessor: 'date',
                render: (r) => (
                  <div className="font-mono text-xs">
                    <strong className="text-[var(--ink)]">{r.date}</strong>
                    <span className="text-[var(--slate)] ml-1.5">• Period {r.period}</span>
                  </div>
                )
              },
              {
                header: 'Course',
                accessor: 'courseCode',
                render: (r) => (
                  <div>
                    <span className="font-mono font-bold text-[var(--brass-2)]">{r.courseCode}</span>
                    <span className="text-xs text-[var(--ink)] ml-1">({r.courseName})</span>
                  </div>
                )
              },
              {
                header: 'Status',
                accessor: 'status',
                render: (r) => (
                  <Badge variant={r.status === 'PRESENT' ? 'pass' : r.status === 'OD' ? 'amber' : 'fail'}>
                    {r.status === 'OD' ? '⚡ ON-DUTY' : r.status}
                  </Badge>
                )
              },
              {
                header: 'Recorded By',
                accessor: 'markedBy',
                render: (r) => <span className="font-mono text-xs text-[var(--slate)]">{r.markedBy}</span>
              },
              {
                header: 'Remarks',
                accessor: 'remarks',
                render: (r) => <span className="text-[11px] font-mono text-[var(--slate)] italic">{r.remarks || '—'}</span>
              }
            ]}
            data={records}
          />
        </div>

        {/* Right: Correction Requests Status */}
        <div className="lg:col-span-4 card p-5 bg-white">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-2.5">
            <h4 className="font-display font-bold text-sm text-[var(--ink)]">
              Correction Requests Status
            </h4>
            <span className="font-mono text-xs text-[var(--slate)]">{correctionRequests.length} Filed</span>
          </div>

          {correctionRequests.length === 0 ? (
            <p className="text-xs font-mono text-[var(--slate)] py-4 text-center">
              No active attendance correction requests filed.
            </p>
          ) : (
            <div className="space-y-3">
              {correctionRequests.map(req => (
                <div key={req.id} className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[var(--brass-2)]">{req.courseCode}</span>
                    <Badge variant={req.status === 'APPROVED' ? 'pass' : req.status === 'REJECTED' ? 'fail' : 'amber'}>
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[var(--slate)]">
                    Date: <strong className="text-[var(--ink)]">{req.date} (Period {req.period})</strong>
                  </p>
                  <p className="text-[11px] text-[var(--ink)] font-sans italic">
                    &ldquo;{req.reason}&rdquo;
                  </p>
                  {req.facultyRemarks && (
                    <div className="mt-1 pt-1 border-t border-[var(--rule)] text-[10px] font-mono text-amber-900">
                      Faculty: {req.facultyRemarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Correction Modal */}
      {correctionModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCorrectionModalOpen(false)}
          title="Request Attendance Correction"
        >
          {correctionSuccess ? (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-mono text-xs text-center">
              ✓ Correction request submitted to Faculty &amp; HOD for ledger verification!
            </div>
          ) : (
            <form onSubmit={handleCorrectionSubmit} className="space-y-4 font-sans text-xs">
              <p className="text-xs text-[var(--slate)] font-mono">
                Submit an official reconciliation request if you were marked absent erroneously or due to biometric scan failure.
              </p>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Select Course:</label>
                <select
                  value={selectedCourseForCorrection}
                  onChange={(e) => setSelectedCourseForCorrection(e.target.value)}
                  className="field-input text-xs"
                  required
                >
                  {summaries.map(s => (
                    <option key={s.courseCode} value={s.courseCode}>
                      {s.courseCode} - {s.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-bold text-[var(--ink)] mb-1">Date of Class:</label>
                  <input
                    type="date"
                    required
                    value={correctionDate}
                    onChange={(e) => setCorrectionDate(e.target.value)}
                    className="field-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-[var(--ink)] mb-1">Period Slot:</label>
                  <select
                    value={correctionPeriod}
                    onChange={(e) => setCorrectionPeriod(e.target.value)}
                    className="field-input text-xs"
                  >
                    <option value="1">Period 1 (09:00 - 10:00)</option>
                    <option value="2">Period 2 (10:00 - 11:00)</option>
                    <option value="3">Period 3 (11:15 - 12:15)</option>
                    <option value="4">Period 4 (01:15 - 02:15)</option>
                    <option value="5">Period 5 (02:15 - 03:15)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">
                  Reason for Correction / Proof Details:
                </label>
                <textarea
                  rows={3}
                  required
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Biometric reader error at classroom entrance; attended full lecture and completed class quiz."
                  className="field-input text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectionModalOpen(false)}
                  className="px-3 py-2 rounded text-xs font-mono text-[var(--slate)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold shadow-xs cursor-pointer"
                >
                  Submit Correction Request →
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

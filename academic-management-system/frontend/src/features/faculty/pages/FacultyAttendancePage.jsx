import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { Modal } from '../../../components/ui/Modal';

export const FacultyAttendancePage = () => {
  const { activeSemester, activeWorkspace, detailedAttendance, saveAttendanceSession, reviewAttendanceCorrection } = useAcademic();
  const { user } = useAuth();

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code || 'BCA302');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionSlot, setSessionSlot] = useState('1');
  const [attendanceStates, setAttendanceStates] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const correctionRequests = detailedAttendance?.correctionRequests || [];

  const getStatus = (stuId) => attendanceStates[stuId] || 'Present';

  const setStatus = (stuId, status) => {
    setAttendanceStates(prev => ({ ...prev, [stuId]: status }));
  };

  const markAll = (status) => {
    const next = {};
    students.forEach(s => { next[s.id] = status; });
    setAttendanceStates(next);
  };

  const handleSave = (isDraft = false) => {
    const records = students.map(s => ({
      studentId: s.id,
      studentName: s.name,
      reg: s.reg || s.usn,
      status: getStatus(s.id)
    }));

    const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'OD').length;
    const absentCount = records.length - presentCount;

    saveAttendanceSession({
      courseCode: selectedCourse,
      date: sessionDate,
      period: sessionSlot,
      presentCount,
      absentCount,
      status: isDraft ? 'DRAFT' : 'LOCKED',
      studentRecords: records
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReviewSubmit = (decision) => {
    if (!selectedCorrection) return;

    reviewAttendanceCorrection(selectedCorrection.id, {
      status: decision,
      remarks: reviewRemarks || (decision === 'APPROVED' ? 'Verified with class record. Updated attendance.' : 'Absence confirmed by instructor.')
    });

    setReviewSuccess(true);
    setTimeout(() => {
      setSelectedCorrection(null);
      setReviewRemarks('');
      setReviewSuccess(false);
    }, 1500);
  };

  const headers = ['Register No', 'Student Name', 'Section', 'Session Date', 'Period', 'Status'];
  const rows = students.map(s => [s.reg || s.usn, s.name, s.section, sessionDate, `Period ${sessionSlot}`, getStatus(s.id)]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>⏱️</span> SESSION ATTENDANCE &amp; CORRECTION LEDGER
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Session-Based Attendance Entry — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Record lecture &amp; laboratory attendance, lock sessions, and review student attendance correction appeals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename={`bca_sem${activeSemester}_attendance_${selectedCourse}_${sessionDate}`}
            title={`Attendance Register — ${selectedCourse}`}
            subtitle={`Date: ${sessionDate} (Period ${sessionSlot}) — Faculty: ${user?.name || 'Prof. K. Rao'}`}
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono flex items-center gap-2 shadow-2xs">
          <span>✓</span> Attendance session successfully saved and synced to student records &amp; institutional ledger!
        </div>
      )}

      {/* Session Controls Form */}
      <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">COURSE:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="field-input text-xs py-1.5 min-w-[200px]"
            >
              {courses.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">SESSION DATE:</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="field-input text-xs py-1.5"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">PERIOD SLOT:</label>
            <select
              value={sessionSlot}
              onChange={(e) => setSessionSlot(e.target.value)}
              className="field-input text-xs py-1.5"
            >
              <option value="1">Period 1 (09:00 - 10:00)</option>
              <option value="2">Period 2 (10:00 - 11:00)</option>
              <option value="3">Period 3 (11:15 - 12:15)</option>
              <option value="4">Period 4 (01:15 - 02:15)</option>
              <option value="5">Period 5 (02:15 - 03:15)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => markAll('Present')}
            className="btn-ghost border border-[var(--rule)] px-3 py-2 rounded font-bold cursor-pointer"
          >
            All Present ✓
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="px-3 py-2 bg-white border border-[var(--rule)] text-[var(--slate)] rounded font-bold hover:text-[var(--ink)] cursor-pointer"
          >
            Save Draft 💾
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="btn-ink px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
          >
            Submit &amp; Lock 🔒
          </button>
        </div>
      </div>

      {/* 2-Column Layout: Attendance Entry Table & Correction Review Queue */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Roster Marking */}
        <div className="lg:col-span-8 card p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
            <h4 className="font-display font-bold text-base text-[var(--ink)]">
              Student Roster — {selectedCourse} (Section A)
            </h4>
            <span className="font-mono text-xs text-[var(--slate)]">{students.length} Students</span>
          </div>

          <LedgerTable
            columns={[
              {
                header: 'Register No',
                accessor: 'reg',
                render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
              },
              { header: 'Student Name', accessor: 'name', render: (s) => <strong className="text-xs">{s.name}</strong> },
              {
                header: 'Cumulative %',
                accessor: 'attendance',
                render: (s) => (
                  <span className={`font-mono font-bold ${s.attendance < 75 ? 'text-red-700' : 'text-emerald-800'}`}>
                    {s.attendance}%
                  </span>
                )
              },
              {
                header: 'Session Status',
                accessor: 'id',
                render: (s) => {
                  const current = getStatus(s.id);
                  return (
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => setStatus(s.id, 'Present')}
                        className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                          current === 'Present' ? 'bg-emerald-700 text-white shadow-2xs' : 'bg-[var(--parchment-2)] border border-[var(--rule)] text-[var(--slate)]'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(s.id, 'Absent')}
                        className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                          current === 'Absent' ? 'bg-red-700 text-white shadow-2xs' : 'bg-[var(--parchment-2)] border border-[var(--rule)] text-[var(--slate)]'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(s.id, 'Late')}
                        className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                          current === 'Late' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-[var(--parchment-2)] border border-[var(--rule)] text-[var(--slate)]'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(s.id, 'OD')}
                        className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                          current === 'OD' ? 'bg-blue-700 text-white shadow-2xs' : 'bg-[var(--parchment-2)] border border-[var(--rule)] text-[var(--slate)]'
                        }`}
                      >
                        OD
                      </button>
                    </div>
                  );
                }
              }
            ]}
            data={students}
          />
        </div>

        {/* Right Column: Correction Requests Review Queue */}
        <div className="lg:col-span-4 card p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
            <div>
              <h4 className="font-display font-bold text-sm text-[var(--ink)]">
                Attendance Correction Appeals
              </h4>
              <p className="text-[11px] font-mono text-[var(--slate)]">Student rectification requests</p>
            </div>
            <span className="font-mono text-xs font-bold text-[var(--brass-2)]">
              {correctionRequests.length} Filed
            </span>
          </div>

          {correctionRequests.length === 0 ? (
            <p className="text-xs font-mono text-[var(--slate)] py-4 text-center">
              No pending attendance correction appeals.
            </p>
          ) : (
            <div className="space-y-3">
              {correctionRequests.map((req) => (
                <div key={req.id} className="p-3.5 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <strong className="text-[var(--ink)]">{req.studentName}</strong>
                    <Badge variant={req.status === 'APPROVED' ? 'pass' : req.status === 'REJECTED' ? 'fail' : 'amber'}>
                      {req.status}
                    </Badge>
                  </div>

                  <div className="text-[11px] font-mono text-[var(--slate)]">
                    Course: <strong className="text-[var(--brass-2)]">{req.courseCode}</strong> • Date: {req.date} (P{req.period})
                  </div>

                  <p className="text-[11px] font-sans text-[var(--ink)] italic bg-white p-2 rounded border border-[var(--rule)]">
                    &ldquo;{req.reason}&rdquo;
                  </p>

                  {req.status === 'UNDER_REVIEW' && (
                    <button
                      onClick={() => setSelectedCorrection(req)}
                      className="w-full py-1.5 bg-[var(--brass)] text-white font-mono text-xs font-bold rounded shadow-2xs cursor-pointer hover:bg-[var(--brass-2)]"
                    >
                      Review &amp; Decide →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Correction Modal */}
      {selectedCorrection && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCorrection(null)}
          title="Review Attendance Correction Appeal"
        >
          {reviewSuccess ? (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-mono text-xs text-center">
              ✓ Correction appeal decision recorded and student notified!
            </div>
          ) : (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg font-mono space-y-1">
                <div>Student: <strong className="text-[var(--ink)]">{selectedCorrection.studentName}</strong></div>
                <div>Course: <strong>{selectedCorrection.courseCode}</strong></div>
                <div>Class Date &amp; Period: <strong>{selectedCorrection.date} (Period {selectedCorrection.period})</strong></div>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Student Stated Reason:</label>
                <div className="p-3 bg-white border border-[var(--rule)] rounded text-xs italic text-[var(--ink)]">
                  &ldquo;{selectedCorrection.reason}&rdquo;
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Faculty Remarks &amp; Decision Note:</label>
                <textarea
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="e.g. Verified with lab log. Student was present in Database Lab."
                  className="field-input text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedCorrection(null)}
                  className="px-3 py-2 rounded text-xs text-[var(--slate)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('REJECTED')}
                  className="px-4 py-2 bg-red-700 text-white rounded font-bold cursor-pointer"
                >
                  Reject ✗
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('APPROVED')}
                  className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
                >
                  Approve &amp; Update Ledger ✓
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

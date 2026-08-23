import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const FacultyAttendancePage = () => {
  const { activeSemester, activeWorkspace, logAction } = useAcademic();
  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code || 'BCA302');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionSlot, setSessionSlot] = useState('Period 1 (09:00 - 10:00)');
  const [attendanceStates, setAttendanceStates] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const getStatus = (stuId) => attendanceStates[stuId] || 'Present';

  const setStatus = (stuId, status) => {
    setAttendanceStates(prev => ({ ...prev, [stuId]: status }));
  };

  const markAll = (status) => {
    const next = {};
    students.forEach(s => { next[s.id] = status; });
    setAttendanceStates(next);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const presentCount = students.filter(s => getStatus(s.id) === 'Present').length;
    const absentCount = students.length - presentCount;

    logAction(
      'Faculty Attendance Recorded',
      `Marked attendance for ${selectedCourse} on ${sessionDate} (${sessionSlot}) — ${presentCount} Present, ${absentCount} Absent.`,
      'Faculty Instructor',
      'FACULTY'
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const headers = ['Register No', 'Student Name', 'Section', 'Session Date', 'Session Slot', 'Status'];
  const rows = students.map(s => [s.reg || s.usn, s.name, s.section, sessionDate, sessionSlot, getStatus(s.id)]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Attendance Entry — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Record period-wise lecture and lab attendance for your assigned courses.
          </p>
        </div>
        <ExportToolbar
          filename={`bca_sem${activeSemester}_faculty_attendance_${sessionDate}`}
          title={`Faculty Attendance Record — ${selectedCourse}`}
          subtitle={`Date: ${sessionDate} — Slot: ${sessionSlot}`}
          headers={headers}
          rows={rows}
        />
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-mono mb-4 flex items-center gap-2">
          <span>✓</span> Attendance record successfully saved to the institutional ledger and synced!
        </div>
      )}

      {/* Session Controls */}
      <form onSubmit={handleSave} className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-mono font-bold text-[var(--slate)] uppercase mb-1">COURSE:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="field-input text-xs py-1 min-w-[200px]"
            >
              {courses.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-[var(--slate)] uppercase mb-1">DATE:</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="field-input text-xs py-1"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-[var(--slate)] uppercase mb-1">PERIOD / SLOT:</label>
            <select
              value={sessionSlot}
              onChange={(e) => setSessionSlot(e.target.value)}
              className="field-input text-xs py-1"
            >
              <option>Period 1 (09:00 - 10:00)</option>
              <option>Period 2 (10:00 - 11:00)</option>
              <option>Period 3 (11:15 - 12:15)</option>
              <option>Period 4 (01:00 - 02:00)</option>
              <option>Period 5 (02:00 - 03:00)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 sm:pt-0">
          <button
            type="button"
            onClick={() => markAll('Present')}
            className="btn-ghost border border-[var(--rule)] px-3 py-1.5 rounded text-xs font-mono"
          >
            All Present
          </button>
          <button
            type="submit"
            className="btn-ink px-4 py-1.5 rounded text-xs font-mono font-bold shadow-xs"
          >
            💾 Save Attendance Session
          </button>
        </div>
      </form>

      <LedgerTable
        columns={[
          {
            header: 'Reg No',
            accessor: 'reg',
            render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
          },
          { header: 'Student Name', accessor: 'name' },
          { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
          {
            header: 'Cumulative Attendance',
            accessor: 'attendance',
            render: (s) => <span className="font-mono font-bold">{s.attendance}%</span>
          },
          {
            header: 'Mark Session Status',
            accessor: 'id',
            render: (s) => {
              const current = getStatus(s.id);
              return (
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setStatus(s.id, 'Present')}
                    className={`px-3 py-1 rounded font-bold transition ${
                      current === 'Present' ? 'bg-emerald-700 text-white' : 'bg-white border border-[var(--rule)] text-[var(--slate)]'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(s.id, 'Absent')}
                    className={`px-3 py-1 rounded font-bold transition ${
                      current === 'Absent' ? 'bg-red-700 text-white' : 'bg-white border border-[var(--rule)] text-[var(--slate)]'
                    }`}
                  >
                    Absent
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(s.id, 'On-Duty')}
                    className={`px-3 py-1 rounded font-bold transition ${
                      current === 'On-Duty' ? 'bg-amber-600 text-white' : 'bg-white border border-[var(--rule)] text-[var(--slate)]'
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
  );
};

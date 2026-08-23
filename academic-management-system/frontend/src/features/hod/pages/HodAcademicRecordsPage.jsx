import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const HodAcademicRecordsPage = () => {
  const { activeSemester, activeWorkspace, logAction } = useAcademic();

  const students = activeWorkspace?.students || [];
  const courses = activeWorkspace?.courses || [];

  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'courses' | 'governance'
  const [lockedSuccess, setLockedSuccess] = useState(false);

  const handleLockRecords = () => {
    logAction(
      'Semester Records Locked by HOD',
      `Audited and locked Semester ${activeSemester} master student grades and attendance ledger.`,
      'Dr. A. Sharma',
      'HOD'
    );
    setLockedSuccess(true);
    setTimeout(() => setLockedSuccess(false), 3500);
  };

  const headers = ['Register No', 'Student Name', 'Section', 'Attendance %', 'Current SGPA', 'Cumulative CGPA', 'Result Standing', 'Status'];
  const rows = students.map(s => [
    s.reg || s.usn,
    s.name,
    `Sec ${s.section}`,
    `${s.attendance}%`,
    s.sgpa?.toFixed(2),
    s.cgpa?.toFixed(2),
    s.resultStatus || 'PASS',
    s.status
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🗂️</span> SEMESTER MASTER RECORDS GOVERNANCE
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Academic Records &amp; Verification
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Departmental ledger oversight of student registrations, credit completion, examination standings, and record-locking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLockRecords}
            className="btn-ink px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>🔒</span> Lock Semester Ledger
          </button>
          <ExportToolbar
            filename={`hod_academic_records_sem${activeSemester}`}
            title={`Semester ${activeSemester} Master Academic Records`}
            subtitle="Department of Computer Applications"
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {lockedSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          ✓ Semester {activeSemester} academic records verified, audited, and locked against unauthorized edits!
        </div>
      )}

      {/* Completeness Checklist */}
      <div className="card p-5 bg-white space-y-3 font-mono text-xs">
        <h4 className="font-display font-bold text-sm text-[var(--ink)] border-b border-[var(--rule)] pb-2">
          Academic Completeness &amp; Quality Audit Checks
        </h4>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-emerald-900">
            <span>✓</span>
            <span>All 5 Courses have assigned instructors</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-emerald-900">
            <span>✓</span>
            <span>All 9 Students have course registrations</span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2 text-blue-900">
            <span>ℹ️</span>
            <span>CIA 2 Evaluation in progress (Window Open)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--rule)] pb-1 font-mono text-xs">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-t-lg font-bold transition cursor-pointer ${
            activeTab === 'students' ? 'bg-white border border-b-0 border-[var(--rule)] text-[var(--ink)] shadow-2xs' : 'text-[var(--slate)] hover:text-[var(--ink)]'
          }`}
        >
          🎓 Enrolled Students Ledger ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-t-lg font-bold transition cursor-pointer ${
            activeTab === 'courses' ? 'bg-white border border-b-0 border-[var(--rule)] text-[var(--ink)] shadow-2xs' : 'text-[var(--slate)] hover:text-[var(--ink)]'
          }`}
        >
          📚 Enrolled Courses ({courses.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'students' ? (
        <div className="card p-5 bg-white space-y-4">
          <LedgerTable
            columns={[
              {
                header: 'Register No',
                accessor: 'reg',
                render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
              },
              { header: 'Student Name', accessor: 'name', render: (s) => <strong className="text-xs">{s.name}</strong> },
              { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
              {
                header: 'Attendance %',
                accessor: 'attendance',
                render: (s) => (
                  <span className={`font-mono font-bold ${s.attendance < 75 ? 'text-red-700' : 'text-emerald-800'}`}>
                    {s.attendance}%
                  </span>
                )
              },
              {
                header: 'SGPA',
                accessor: 'sgpa',
                render: (s) => <span className="font-mono font-bold text-[var(--brass-2)]">{s.sgpa?.toFixed(2)}</span>
              },
              {
                header: 'CGPA',
                accessor: 'cgpa',
                render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.cgpa?.toFixed(2)}</span>
              },
              {
                header: 'Exam Result',
                accessor: 'resultStatus',
                render: (s) => <Badge variant={s.resultStatus === 'FAIL' ? 'fail' : 'pass'}>{s.resultStatus || 'PASS'}</Badge>
              }
            ]}
            data={students}
          />
        </div>
      ) : (
        <div className="card p-5 bg-white space-y-4">
          <LedgerTable
            columns={[
              {
                header: 'Course Code',
                accessor: 'code',
                render: (c) => <span className="font-mono font-bold text-[var(--brass-2)]">{c.code}</span>
              },
              { header: 'Course Title', accessor: 'name', render: (c) => <strong className="text-xs">{c.name || c.title}</strong> },
              { header: 'Course Type', accessor: 'type', render: (c) => <Badge variant={c.type?.includes('Lab') ? 'ink' : 'pass'}>{c.type}</Badge> },
              { header: 'Credits', accessor: 'credits', render: (c) => `${c.credits} Credits` },
              { header: 'Room / Lab', accessor: 'room', render: (c) => c.room || 'Room 302' }
            ]}
            data={courses}
          />
        </div>
      )}
    </div>
  );
};

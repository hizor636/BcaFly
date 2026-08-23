import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { exportToCSV, exportToExcel, exportToPDF } from '../../../services/exportService';

export const AdminReportsPage = () => {
  const { activeSemester, activeWorkspace, auditLogs } = useAcademic();
  const students = activeWorkspace?.students || [];
  const courses = activeWorkspace?.courses || [];

  const handleConsolidatedExport = (format) => {
    const headers = ['Register No', 'Student Name', 'Section', 'Attendance %', 'SGPA', 'CGPA', 'Status'];
    const rows = students.map(s => [s.reg || s.usn, s.name, s.section, `${s.attendance}%`, s.sgpa, s.cgpa, s.resultStatus]);
    const filename = `bca_sem${activeSemester}_consolidated_report`;

    if (format === 'csv') exportToCSV(filename, headers, rows);
    else if (format === 'xlsx') exportToExcel(filename, 'Consolidated Transcript', headers, rows);
    else exportToPDF(`Semester ${activeSemester} Consolidated Academic Report`, `Term: ${activeWorkspace?.term}`, headers, rows, filename);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
          Semester {activeSemester} Reports &amp; Exports
        </h3>
        <p className="text-xs text-[var(--slate)]">
          Generate formal department registers, NAAC/NBA compliance exports, and student transcripts.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Report Card 1 */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="text-2xl mb-2">📑</div>
            <h4 className="font-display font-bold text-base text-[var(--ink)] mb-1">
              Consolidated Semester Report
            </h4>
            <p className="text-xs text-[var(--slate)] mb-4">
              Comprehensive report containing student enrolment, attendance benchmarks, SGPA scores, and arrears.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleConsolidatedExport('pdf')}
              className="btn-brass px-3 py-1.5 rounded text-xs font-mono font-bold flex-1"
            >
              Export PDF 📑
            </button>
            <button
              onClick={() => handleConsolidatedExport('xlsx')}
              className="btn-ghost border border-[var(--rule)] px-3 py-1.5 rounded text-xs font-mono font-bold hover:border-[var(--brass)]"
            >
              Excel 📊
            </button>
          </div>
        </div>

        {/* Report Card 2 */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="text-2xl mb-2">⏱️</div>
            <h4 className="font-display font-bold text-base text-[var(--ink)] mb-1">
              Attendance Shortage Register
            </h4>
            <p className="text-xs text-[var(--slate)] mb-4">
              Official list of students with attendance below 75% requiring condonation or debarment notices.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const shortages = students.filter(s => s.attendance < 75);
                const headers = ['Register No', 'Student Name', 'Attendance %', 'Shortage Category'];
                const rows = shortages.map(s => [s.reg || s.usn, s.name, `${s.attendance}%`, s.attendance < 65 ? 'Debarred' : 'Condonation']);
                exportToPDF(`Semester ${activeSemester} Attendance Shortage Notice`, 'Department of Computer Applications', headers, rows, `bca_sem${activeSemester}_shortage`);
              }}
              className="btn-ink px-3 py-1.5 rounded text-xs font-mono font-bold flex-1"
            >
              Generate Notice 📑
            </button>
          </div>
        </div>

        {/* Report Card 3 */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-display font-bold text-base text-[var(--ink)] mb-1">
              Governance &amp; Audit Trail
            </h4>
            <p className="text-xs text-[var(--slate)] mb-4">
              Immutable record of all academic changes, mark updates, and attendance recordings.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Details'];
                const rows = auditLogs.map(a => [a.id, a.time, a.actor, a.role, a.action, a.details]);
                exportToPDF('BcaFly Immutable Audit Trail', 'Cryptographically verified mutation trail', headers, rows, 'bcafly_audit_trail');
              }}
              className="btn-ghost border border-[var(--rule)] px-3 py-1.5 rounded text-xs font-mono font-bold flex-1 hover:border-[var(--ink)]"
            >
              Export Audit Trail 🔒
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

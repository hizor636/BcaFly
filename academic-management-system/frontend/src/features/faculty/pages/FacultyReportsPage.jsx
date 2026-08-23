import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { MetricCard } from '../../../components/ui/MetricCard';

export const FacultyReportsPage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const { user } = useAuth();

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedCourse, setSelectedCourse] = useState('BCA302');
  const [reportType, setReportType] = useState('RISK'); // 'ALL' | 'RISK' | 'DEFAULTER'

  const processedData = students.map(s => {
    const ciaScore = Math.round(35 + (s.sgpa * 1.5));
    const att = s.attendance;
    const isAttendanceRisk = att < 75;
    const isAcademicRisk = s.sgpa < 7.5 || s.backlogCount > 0;
    const atRisk = isAttendanceRisk || isAcademicRisk;

    return {
      ...s,
      ciaScore,
      att,
      isAttendanceRisk,
      isAcademicRisk,
      atRisk,
      riskReason: isAttendanceRisk && isAcademicRisk
        ? 'Attendance Shortage (<75%) & Academic Caution'
        : isAttendanceRisk
        ? 'Attendance Shortage (<75%)'
        : isAcademicRisk
        ? 'Low CIA & SGPA Standing'
        : 'Satisfactory Performance',
      predictedGrade: s.sgpa >= 9.0 ? 'O' : s.sgpa >= 8.0 ? 'A+' : s.sgpa >= 7.0 ? 'A' : 'B+'
    };
  });

  const filteredData = processedData.filter(s => {
    if (reportType === 'RISK') return s.atRisk;
    if (reportType === 'DEFAULTER') return s.isAttendanceRisk;
    return true;
  });

  const highestScore = Math.max(...processedData.map(d => d.ciaScore));
  const lowestScore = Math.min(...processedData.map(d => d.ciaScore));
  const avgScore = Math.round(processedData.reduce((acc, curr) => acc + curr.ciaScore, 0) / processedData.length);
  const passCount = processedData.filter(d => d.ciaScore >= 20).length;
  const passPct = Math.round((passCount / processedData.length) * 100);

  const headers = ['Register No', 'Student Name', 'Section', 'Attendance %', 'CIA Score (50)', 'Academic Status', 'Risk Factor'];
  const rows = filteredData.map(r => [
    r.reg || r.usn,
    r.name,
    r.section,
    `${r.att}%`,
    r.ciaScore,
    r.predictedGrade,
    r.riskReason
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📈</span> COURSE ANALYTICS &amp; EARLY WARNING INTERVENTION
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Course Performance &amp; Students-at-Risk Reports
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Identify students requiring academic mentoring, attendance recovery, and remedial classes for Semester {activeSemester}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename={`faculty_report_${selectedCourse}_sem${activeSemester}`}
            title={`Course Performance & Risk Report — ${selectedCourse}`}
            subtitle={`Semester ${activeSemester} — Faculty: ${user?.name || 'Prof. K. Rao'}`}
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="HIGHEST CIA SCORE"
          value={`${highestScore} / 50`}
          subtitle="Top class performance"
          valueColor="text-emerald-800"
        />
        <MetricCard
          title="LOWEST CIA SCORE"
          value={`${lowestScore} / 50`}
          subtitle="Remedial threshold: 20/50"
          valueColor="text-amber-800"
        />
        <MetricCard
          title="AVERAGE CLASS SCORE"
          value={`${avgScore} / 50`}
          subtitle={`Class Pass Rate: ${passPct}%`}
        />
        <MetricCard
          title="STUDENTS AT RISK"
          value={`${processedData.filter(d => d.atRisk).length} Students`}
          subtitle="Attendance or CIA alert"
          valueColor="text-red-700"
        />
      </div>

      {/* Control and Filter Bar */}
      <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">SELECT COURSE:</label>
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
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">REPORT FILTER:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="field-input text-xs py-1 min-w-[200px]"
            >
              <option value="RISK">🚨 Students at Academic Risk Only</option>
              <option value="DEFAULTER">⚠️ Attendance Defaulters (&lt;75%)</option>
              <option value="ALL">📋 Complete Class Register</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] font-bold text-[var(--slate)]">
          Displaying {filteredData.length} of {processedData.length} students
        </div>
      </div>

      {/* Ledger Report Table */}
      <div className="card p-5 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Course Performance Ledger — {selectedCourse}
          </h4>
          <span className="font-mono text-xs text-[var(--slate)]">Department of Computer Applications</span>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Reg No',
              accessor: 'reg',
              render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
            },
            { header: 'Student Name', accessor: 'name', render: (s) => <strong className="text-xs">{s.name}</strong> },
            { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
            {
              header: 'Attendance %',
              accessor: 'att',
              render: (s) => (
                <span className={`font-mono font-bold ${s.att < 75 ? 'text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200' : 'text-emerald-800'}`}>
                  {s.att}%
                </span>
              )
            },
            {
              header: 'CIA Score (50)',
              accessor: 'ciaScore',
              render: (s) => <span className="font-mono font-bold text-[var(--brass-2)]">{s.ciaScore} / 50</span>
            },
            {
              header: 'Risk Level / Status',
              accessor: 'atRisk',
              render: (s) => (
                <Badge variant={s.atRisk ? 'fail' : 'pass'}>
                  {s.atRisk ? 'ACTION REQUIRED' : 'ON TRACK'}
                </Badge>
              )
            },
            {
              header: 'Diagnostic Reason',
              accessor: 'riskReason',
              render: (s) => (
                <span className="text-[11px] font-mono text-[var(--slate)]">
                  {s.riskReason}
                </span>
              )
            }
          ]}
          data={filteredData}
        />
      </div>
    </div>
  );
};

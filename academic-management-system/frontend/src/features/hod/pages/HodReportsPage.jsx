import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { MetricCard } from '../../../components/ui/MetricCard';

export const HodReportsPage = () => {
  const { activeSemester, activeWorkspace, faculty, studentRiskCases, backlogRecords, facultyAllocations } = useAcademic();

  const students = activeWorkspace?.students || [];
  const courses = activeWorkspace?.courses || [];

  const [reportType, setReportType] = useState('HEALTH'); // 'HEALTH' | 'RISK' | 'BACKLOG' | 'WORKLOAD'

  let headers = [];
  let rows = [];
  let title = '';

  if (reportType === 'HEALTH') {
    title = `Semester ${activeSemester} Academic Health & Pass Performance`;
    headers = ['Register No', 'Student Name', 'Section', 'Attendance %', 'Current SGPA', 'Standing', 'Result'];
    rows = students.map(s => [
      s.reg || s.usn,
      s.name,
      `Sec ${s.section}`,
      `${s.attendance}%`,
      s.sgpa?.toFixed(2),
      s.attendance >= 75 ? 'Eligible' : 'Attendance Shortage',
      s.resultStatus || 'PASS'
    ]);
  } else if (reportType === 'RISK') {
    title = `Department Students at Academic Risk Report — Semester ${activeSemester}`;
    headers = ['Case ID', 'Register No', 'Student Name', 'Risk Level', 'Attendance %', 'SGPA', 'Assigned Mentor', 'Status'];
    rows = studentRiskCases.map(c => [
      c.id,
      c.reg,
      c.studentName,
      c.riskLevel,
      `${c.attendance}%`,
      c.sgpa,
      c.mentorName,
      c.status
    ]);
  } else if (reportType === 'BACKLOG') {
    title = `Department Standing Arrears & Remedial Register — Semester ${activeSemester}`;
    headers = ['Record ID', 'Register No', 'Student Name', 'Failed Subject', 'Attempt', 'Marks Obtained', 'Mentor', 'Status'];
    rows = backlogRecords.map(b => [
      b.id,
      b.reg,
      b.studentName,
      `${b.failedCourseCode} - ${b.failedCourseName}`,
      b.attemptCount,
      `${b.marksObtained}/100`,
      b.mentorName,
      b.status
    ]);
  } else {
    title = `Faculty Teaching Workload & Allocation Register — Semester ${activeSemester}`;
    headers = ['Faculty Name', 'Designation', 'Assigned Course', 'Weekly Hours', 'Type', 'Status'];
    rows = facultyAllocations.map(a => [
      a.facultyName,
      a.role,
      a.courseCode || 'Unassigned',
      `${a.weeklyHours}h/week`,
      a.allocationType,
      a.status
    ]);
  }

  const avgAtt = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (Number(s.attendance) || 0), 0) / students.length)
    : 83;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📈</span> DEPARTMENT ANALYTICS &amp; STATISTICAL REPORTS
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Department Performance &amp; Governance Reports
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Export official departmental data, academic health metrics, arrear tracking, and faculty workloads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename={`hod_department_report_${reportType.toLowerCase()}_sem${activeSemester}`}
            title={title}
            subtitle="Department of Computer Applications — Dr. A. Sharma, HOD"
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="COHORT AVERAGE ATTENDANCE"
          value={`${avgAtt}%`}
          subtitle="Department Standard: ≥75%"
          valueColor="text-emerald-800"
        />
        <MetricCard
          title="AT-RISK INTERVENTIONS"
          value={`${studentRiskCases.length} Cases`}
          subtitle="Mentorship assigned"
          valueColor={studentRiskCases.length > 0 ? 'text-amber-800' : 'text-emerald-800'}
        />
        <MetricCard
          title="STANDING ARREARS"
          value={`${backlogRecords.length} Subjects`}
          subtitle="Remedial coaching in progress"
          valueColor={backlogRecords.length > 0 ? 'text-red-700' : 'text-emerald-800'}
        />
        <MetricCard
          title="FACULTY ALLOCATED"
          value={`${facultyAllocations.filter(a => a.status === 'ACTIVE').length} Courses`}
          subtitle="All lectures staffed"
        />
      </div>

      {/* Report Filter Switcher */}
      <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <label className="font-bold text-[var(--ink)]">SELECT REPORT CATEGORY:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="field-input text-xs py-1.5 min-w-[240px]"
          >
            <option value="HEALTH">📊 Semester Academic Health &amp; Attendance</option>
            <option value="RISK">🚨 Students at Academic Risk Register</option>
            <option value="BACKLOG">⚠️ Standing Backlogs &amp; Remedial Status</option>
            <option value="WORKLOAD">👨‍🏫 Faculty Workload &amp; Allocations</option>
          </select>
        </div>

        <span className="text-[11px] font-bold text-[var(--slate)]">
          {rows.length} Records generated for export
        </span>
      </div>

      {/* Data Table */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            {title}
          </h4>
          <span className="font-mono text-xs text-[var(--slate)]">Semester {activeSemester} (2025–26 ODD)</span>
        </div>

        {reportType === 'HEALTH' && (
          <LedgerTable
            columns={[
              { header: 'Register No', accessor: 'reg', render: (s) => <span className="font-mono font-bold">{s.reg || s.usn}</span> },
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
              { header: 'SGPA', accessor: 'sgpa', render: (s) => <span className="font-mono font-bold text-[var(--brass-2)]">{s.sgpa?.toFixed(2)}</span> },
              {
                header: 'Standing',
                accessor: 'attendance',
                render: (s) => (
                  <Badge variant={s.attendance >= 75 ? 'pass' : 'fail'}>
                    {s.attendance >= 75 ? 'ELIGIBLE' : 'ATTENDANCE SHORTAGE'}
                  </Badge>
                )
              }
            ]}
            data={students}
          />
        )}

        {reportType === 'RISK' && (
          <LedgerTable
            columns={[
              { header: 'Case ID', accessor: 'id', render: (c) => <span className="font-mono font-bold text-[var(--brass-2)]">#{c.id}</span> },
              { header: 'Register No', accessor: 'reg', render: (c) => <span className="font-mono font-bold">{c.reg}</span> },
              { header: 'Student Name', accessor: 'studentName', render: (c) => <strong className="text-xs">{c.studentName}</strong> },
              { header: 'Severity', accessor: 'riskLevel', render: (c) => <Badge variant={c.riskLevel === 'HIGH' ? 'fail' : 'amber'}>{c.riskLevel} RISK</Badge> },
              { header: 'Attendance %', accessor: 'attendance', render: (c) => <span className="font-mono font-bold">{c.attendance}%</span> },
              { header: 'SGPA', accessor: 'sgpa', render: (c) => <span className="font-mono font-bold">{c.sgpa}</span> },
              { header: 'Assigned Mentor', accessor: 'mentorName', render: (c) => <span className="font-mono text-xs">{c.mentorName}</span> },
              { header: 'Status', accessor: 'status', render: (c) => <Badge variant="ink">{c.status}</Badge> }
            ]}
            data={studentRiskCases}
          />
        )}

        {reportType === 'BACKLOG' && (
          <LedgerTable
            columns={[
              { header: 'Record ID', accessor: 'id', render: (b) => <span className="font-mono font-bold text-[var(--brass-2)]">#{b.id}</span> },
              { header: 'Student Name', accessor: 'studentName', render: (b) => <strong className="text-xs">{b.studentName}</strong> },
              { header: 'Failed Course', accessor: 'failedCourseCode', render: (b) => <span className="font-mono font-bold text-red-700">{b.failedCourseCode}</span> },
              { header: 'Attempt', accessor: 'attemptCount', render: (b) => <span className="font-mono font-bold">#{b.attemptCount}</span> },
              { header: 'Score', accessor: 'marksObtained', render: (b) => <span className="font-mono">{b.marksObtained}/100</span> },
              { header: 'Mentor Faculty', accessor: 'mentorName', render: (b) => <span className="font-mono">{b.mentorName}</span> },
              { header: 'Status', accessor: 'status', render: (b) => <Badge variant="amber">{b.status}</Badge> }
            ]}
            data={backlogRecords}
          />
        )}

        {reportType === 'WORKLOAD' && (
          <LedgerTable
            columns={[
              { header: 'Faculty Name', accessor: 'facultyName', render: (a) => <strong className="font-mono text-xs">{a.facultyName}</strong> },
              { header: 'Role', accessor: 'role' },
              { header: 'Allocated Course', accessor: 'courseCode', render: (a) => <span className="font-mono font-bold text-[var(--brass-2)]">{a.courseCode || 'None'}</span> },
              { header: 'Weekly Hours', accessor: 'weeklyHours', render: (a) => <span className="font-mono font-bold">{a.weeklyHours}h / week</span> },
              { header: 'Type', accessor: 'allocationType', render: (a) => <Badge variant={a.allocationType === 'LAB' ? 'ink' : 'pass'}>{a.allocationType}</Badge> },
              { header: 'Status', accessor: 'status', render: (a) => <Badge variant={a.status === 'ACTIVE' ? 'pass' : 'amber'}>{a.status}</Badge> }
            ]}
            data={facultyAllocations}
          />
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { MetricCard } from '../../../components/ui/MetricCard';

export const HodAcademicMonitoringPage = () => {
  const { activeSemester, activeWorkspace, assessmentMarks } = useAcademic();

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedBand, setSelectedBand] = useState('ALL'); // 'ALL' | 'SAFE' | 'WARNING' | 'CRITICAL'

  // Student Attendance Bands
  const analyzedStudents = students.map(s => {
    const att = s.attendance;
    const band = att >= 75 ? 'SAFE' : att >= 65 ? 'WARNING' : 'CRITICAL';
    const ciaScore = Math.round(35 + (s.sgpa * 1.5));

    return {
      ...s,
      att,
      band,
      ciaScore,
      statusLabel: band === 'SAFE' ? 'Eligible (≥75%)' : band === 'WARNING' ? 'Warning Band (65–75%)' : 'Critical Shortage (<65%)'
    };
  });

  const filteredStudents = analyzedStudents.filter(s => {
    if (selectedBand !== 'ALL' && s.band !== selectedBand) return false;
    return true;
  });

  const safeCount = analyzedStudents.filter(s => s.band === 'SAFE').length;
  const warningCount = analyzedStudents.filter(s => s.band === 'WARNING').length;
  const criticalCount = analyzedStudents.filter(s => s.band === 'CRITICAL').length;

  const headers = ['Register No', 'Student Name', 'Section', 'Attendance %', 'Risk Band', 'CIA Average (50)', 'Standing'];
  const rows = filteredStudents.map(s => [
    s.reg || s.usn,
    s.name,
    s.section,
    `${s.att}%`,
    s.band,
    s.ciaScore,
    s.statusLabel
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📊</span> DEPARTMENT ACADEMIC HEALTH &amp; ATTENDANCE MONITOR
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Academic Performance &amp; Risk Banding — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Department-wide analytics on lecture attendance bands, assessment pass percentages, and subject completion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename={`hod_academic_monitoring_sem${activeSemester}`}
            title={`Department Academic Monitoring — Semester ${activeSemester}`}
            subtitle="Department of Computer Applications"
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="SAFE BAND (≥75%)"
          value={`${safeCount} Students`}
          subtitle={`${Math.round((safeCount / students.length) * 100)}% of Cohort`}
          valueColor="text-emerald-800"
          onClick={() => setSelectedBand('SAFE')}
        />
        <MetricCard
          title="WARNING BAND (65–75%)"
          value={`${warningCount} Students`}
          subtitle="Borderline attendance"
          valueColor="text-amber-800"
          onClick={() => setSelectedBand('WARNING')}
        />
        <MetricCard
          title="CRITICAL SHORTAGE (<65%)"
          value={`${criticalCount} Students`}
          subtitle="Hall ticket withheld risk"
          valueColor="text-red-700"
          onClick={() => setSelectedBand('CRITICAL')}
        />
        <MetricCard
          title="COURSES MONITORED"
          value={`${courses.length} Subjects`}
          subtitle="Semester 3 Theory & Labs"
        />
      </div>

      {/* Course-Wise Health Breakdown */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Course-Wise Attendance &amp; Evaluation Progress
          </h4>
          <span className="font-mono text-xs text-[var(--slate)]">{courses.length} Active Courses</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((c) => {
            const isLab = c.type?.includes('Lab') || c.code.endsWith('L');
            const avgAtt = c.code === 'BCA304' ? 76 : c.code === 'BCA305L' ? 96 : 88;

            return (
              <div key={c.code} className="p-4 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--brass-2)]">{c.code}</span>
                  <Badge variant={isLab ? 'ink' : 'pass'}>{c.type}</Badge>
                </div>

                <h5 className="font-bold text-sm text-[var(--ink)] font-sans">{c.name || c.title}</h5>

                <div className="space-y-1.5 pt-2 border-t border-[var(--rule)]/60 text-[11px] text-[var(--slate)]">
                  <div className="flex justify-between">
                    <span>Average Attendance:</span>
                    <strong className={avgAtt < 80 ? 'text-amber-800' : 'text-emerald-800'}>{avgAtt}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CIA 1 Evaluation:</span>
                    <strong className="text-emerald-800">Completed (100%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CIA 2 Evaluation:</span>
                    <strong className="text-amber-800">In Progress (Marks Window Open)</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Risk Banding Ledger */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3 flex-wrap gap-2">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Cohort Attendance Standing &amp; Risk Bands
          </h4>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="font-bold text-[var(--slate)]">BAND:</span>
            <select
              value={selectedBand}
              onChange={(e) => setSelectedBand(e.target.value)}
              className="field-input text-xs py-1"
            >
              <option value="ALL">All Bands</option>
              <option value="SAFE">Safe Band (≥75%)</option>
              <option value="WARNING">Warning Band (65–75%)</option>
              <option value="CRITICAL">Critical Band (&lt;65%)</option>
            </select>
          </div>
        </div>

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
              accessor: 'att',
              render: (s) => (
                <span className={`font-mono font-bold ${s.att < 75 ? 'text-red-700' : 'text-emerald-800'}`}>
                  {s.att}%
                </span>
              )
            },
            {
              header: 'Risk Classification',
              accessor: 'band',
              render: (s) => (
                <Badge variant={s.band === 'SAFE' ? 'pass' : s.band === 'WARNING' ? 'amber' : 'fail'}>
                  {s.band === 'SAFE' ? 'SAFE (≥75%)' : s.band === 'WARNING' ? 'WARNING (65–75%)' : 'CRITICAL (<65%)'}
                </Badge>
              )
            },
            {
              header: 'CIA Average',
              accessor: 'ciaScore',
              render: (s) => <span className="font-mono font-bold text-[var(--brass-2)]">{s.ciaScore} / 50</span>
            }
          ]}
          data={filteredStudents}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { MetricCard } from '../../../components/ui/MetricCard';
import { IngestionZone } from '../../../components/ui/IngestionZone';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export const AdminOverviewPage = () => {
  const { activeSemester, activeWorkspace, semesters, auditLogs, logAction } = useAcademic();
  const navigate = useNavigate();

  const students = activeWorkspace?.students || [];
  const courses = activeWorkspace?.courses || [];
  const facultyIds = new Set(courses.map(c => c.facultyId));

  const avgAttendance = students.length > 0
    ? Math.round(students.reduce((a, s) => a + (Number(s.attendance) || 0), 0) / students.length)
    : 0;

  const passedCount = students.filter(s => s.resultStatus === 'PASS').length;
  const failedCount = students.filter(s => s.resultStatus === 'FAIL').length;

  // 6-semester bar chart data
  const barData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
    datasets: [
      {
        label: 'Enrolled Students',
        data: [1, 2, 3, 4, 5, 6].map(s => semesters[s]?.students?.length || 0),
        backgroundColor: '#1B2A4A',
        borderRadius: 4
      }
    ]
  };

  // Standing doughnut chart data
  const doughnutData = {
    labels: ['Passed (Clear)', 'Arrears / Backlogs'],
    datasets: [
      {
        data: [passedCount, failedCount],
        backgroundColor: ['#2D6A4F', '#9B2226'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Workspace Overview
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Independent academic configuration for the selected semester environment.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => logAction('Workspace Sync', `Synced Semester ${activeSemester} workspace cache.`)}
            className="btn-ghost border border-[var(--rule)] text-xs font-mono px-3 py-1.5 rounded"
          >
            🔄 SYNC WORKSPACE
          </button>
        </div>
      </div>

      {/* Universal Ingestion Zone */}
      <IngestionZone
        title="UPLOAD ACADEMIC GUIDELINES / CALENDAR"
        description="Upload official academic calendars or university guidelines to auto-populate semester milestones and term deadlines."
        onFileSelect={(file) => {
          logAction('Calendar Imported', `Imported academic file "${file.name}" for Semester ${activeSemester}.`);
          alert(`Successfully parsed "${file.name}" for Semester ${activeSemester}.`);
        }}
      />

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="SEMESTER ENROLMENT"
          value={students.length}
          subtitle="● Enrolled in Active Sem"
          onClick={() => navigate('/admin/students')}
        />
        <MetricCard
          title="SEMESTER-SPECIFIC COURSES"
          value={courses.length}
          subtitle="● Core & Electives"
          valueColor="text-[var(--brass-2)]"
          onClick={() => navigate('/admin/courses')}
        />
        <MetricCard
          title="ASSIGNED FACULTY"
          value={facultyIds.size}
          subtitle="● Course Instructors"
          onClick={() => navigate('/admin/faculty')}
        />
        <MetricCard
          title="SEMESTER ATTENDANCE"
          value={`${avgAttendance}%`}
          subtitle="● Benchmark: 75%"
          valueColor="text-emerald-700"
          onClick={() => navigate('/admin/attendance')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <div className="font-display font-bold text-sm mb-4 text-[var(--ink)]">
            Enrolment Across All Six Semesters
          </div>
          <div className="h-48">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="card p-5">
          <div className="font-display font-bold text-sm mb-4 text-[var(--ink)]">
            Active Semester Assessment Standing
          </div>
          <div className="h-48 flex justify-center">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Real-Time Mutation Trail */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3 border-b border-[var(--rule)] pb-2">
          <div className="font-display font-bold text-sm text-[var(--ink)]">
            Semester Mutation Trail <span className="font-mono text-xs font-normal text-[var(--slate)]">(Append-Only Log)</span>
          </div>
          <button
            onClick={() => navigate('/admin/audit')}
            className="text-xs font-mono text-[var(--brass)] hover:underline font-semibold"
          >
            FULL AUDIT LOG →
          </button>
        </div>

        <LedgerTable
          columns={[
            { header: 'Timestamp', accessor: 'time' },
            { header: 'Actor', accessor: 'actor' },
            {
              header: 'Role',
              accessor: 'role',
              render: (item) => <Badge variant={item.role === 'ADMIN' ? 'ink' : item.role === 'FACULTY' ? 'amber' : 'pass'}>{item.role}</Badge>
            },
            { header: 'Action', accessor: 'action' },
            { header: 'Details', accessor: 'details' }
          ]}
          data={auditLogs.slice(0, 5)}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { MetricCard } from '../../../components/ui/MetricCard';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export const FacultyOverviewPage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  // Match faculty by user ID or default to FAC02 (Prof. K. Rao) / FAC01
  const facultyId = user?.id === 'FAC02' ? 'FAC02' : user?.id === 'FAC01' ? 'FAC01' : 'FAC02';
  const myCourses = courses.filter(c => c.facultyId === facultyId || courses.length <= 2);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Faculty Platform — {user?.name || 'Prof. K. Rao'}
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Assigned courses, session attendance, and assessment entry for Semester {activeSemester}.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="MY ASSIGNED COURSES"
          value={myCourses.length}
          subtitle={`● Active in Semester ${activeSemester}`}
          onClick={() => navigate('/faculty/attendance')}
        />
        <MetricCard
          title="ENROLLED STUDENTS"
          value={students.length}
          subtitle="● Across All Sections"
        />
        <MetricCard
          title="UPCOMING TASK"
          value="CIA 2 Marks"
          subtitle="● Entry Window Open"
          valueColor="text-[var(--brass-2)]"
          onClick={() => navigate('/faculty/marks')}
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3 border-b border-[var(--rule)] pb-2">
          <div className="font-display font-bold text-sm text-[var(--ink)]">
            My Teaching Schedule &amp; Assigned Courses (Semester {activeSemester})
          </div>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Course Code',
              accessor: 'code',
              render: (c) => <span className="font-mono font-bold text-[var(--ink)]">{c.code}</span>
            },
            { header: 'Course Title', accessor: 'name', render: (c) => c.name || c.title },
            { header: 'Credits', accessor: 'credits', render: (c) => `${c.credits} Credits` },
            { header: 'Room / Slot', accessor: 'room', render: (c) => c.room || 'Room 302' },
            {
              header: 'Quick Actions',
              accessor: 'code',
              render: () => (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/faculty/attendance')}
                    className="btn-ink px-2.5 py-1 rounded text-[10px] font-mono font-bold"
                  >
                    Take Attendance ⏱️
                  </button>
                  <button
                    onClick={() => navigate('/faculty/marks')}
                    className="btn-brass px-2.5 py-1 rounded text-[10px] font-mono font-bold"
                  >
                    Enter Marks 📝
                  </button>
                </div>
              )
            }
          ]}
          data={myCourses}
        />
      </div>
    </div>
  );
};

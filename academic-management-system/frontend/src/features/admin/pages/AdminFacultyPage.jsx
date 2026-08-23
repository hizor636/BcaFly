import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const AdminFacultyPage = () => {
  const { activeSemester, activeWorkspace, faculty } = useAcademic();
  const courses = activeWorkspace?.courses || [];

  const facultyWithWorkload = faculty.map(f => {
    const assignedCourses = courses.filter(c => c.facultyId === f.id);
    const totalCredits = assignedCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
    return {
      ...f,
      assignedCourses,
      courseCount: assignedCourses.length,
      totalCredits
    };
  });

  const headers = ['Faculty ID', 'Faculty Name', 'Designation', 'Assigned Courses (Sem ' + activeSemester + ')', 'Weekly Credits', 'Contact Email'];
  const rows = facultyWithWorkload.map(f => [
    f.id,
    f.name,
    f.role,
    f.assignedCourses.map(c => c.code).join(', ') || 'None',
    `${f.totalCredits} Credits`,
    f.email
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Assigned Faculty for Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Course allocation, weekly teaching credits, and departmental instructors.
          </p>
        </div>
        <ExportToolbar
          filename={`bca_sem${activeSemester}_faculty`}
          title={`Faculty Allocation — Semester ${activeSemester}`}
          subtitle="Department of Computer Applications"
          headers={headers}
          rows={rows}
        />
      </div>

      <LedgerTable
        columns={[
          {
            header: 'Faculty ID',
            accessor: 'id',
            render: (f) => <span className="font-mono font-bold text-[var(--brass-2)]">{f.id}</span>
          },
          {
            header: 'Faculty Name',
            accessor: 'name',
            render: (f) => (
              <div className="font-mono text-xs">
                <div className="font-bold text-[var(--ink)]">{f.name}</div>
                <div className="text-[10px] text-[var(--slate)]">{f.role}</div>
              </div>
            )
          },
          { header: 'Department', accessor: 'dept' },
          {
            header: `Assigned Courses (Sem ${activeSemester})`,
            accessor: 'assignedCourses',
            render: (f) => (
              <div className="flex flex-wrap gap-1 font-mono text-xs">
                {f.assignedCourses.length > 0 ? (
                  f.assignedCourses.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[var(--parchment-2)] border border-[var(--rule)] rounded font-bold text-[var(--ink)]">
                      {c.code}
                    </span>
                  ))
                ) : (
                  <span className="text-[var(--slate)] italic text-[10px]">No active course in Sem {activeSemester}</span>
                )}
              </div>
            )
          },
          {
            header: 'Teaching Credits',
            accessor: 'totalCredits',
            render: (f) => <span className="font-mono font-bold text-emerald-800">{f.totalCredits} Credits/wk</span>
          },
          {
            header: 'Contact Info',
            accessor: 'email',
            render: (f) => (
              <div className="font-mono text-[11px] text-[var(--slate)]">
                <div>{f.email}</div>
                <div className="text-[10px]">{f.phone}</div>
              </div>
            )
          }
        ]}
        data={facultyWithWorkload}
      />
    </div>
  );
};

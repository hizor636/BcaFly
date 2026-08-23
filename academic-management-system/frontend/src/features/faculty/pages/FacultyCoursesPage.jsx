import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export const FacultyCoursesPage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const facultyId = user?.id || 'FAC02';
  const myCourses = courses.filter(
    c => c.facultyId === facultyId || c.code === 'BCA302' || c.code === 'BCA305L'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📚</span> ASSIGNED TEACHING WORKSPACE
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Assigned Courses &amp; Laboratory Modules — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Theory and laboratory course management, student roster, experiment tracking, and assessment oversight.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {myCourses.map((course) => {
          const isLab = course.type?.toLowerCase().includes('lab') || course.code.endsWith('L');

          return (
            <div
              key={course.id || course.code}
              className="card p-6 bg-white border border-[var(--rule)] hover:border-[var(--brass)] shadow-2xs space-y-4 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-2.5 py-0.5 rounded border border-[var(--brass)]">
                      {course.code}
                    </span>
                    <Badge variant={isLab ? 'ink' : 'pass'}>{course.type}</Badge>
                  </div>
                  <h4 className="font-display font-bold text-lg text-[var(--ink)]">
                    {course.name || course.title}
                  </h4>
                </div>

                <span className="font-mono text-xs font-bold text-[var(--ink)] bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)]">
                  {course.credits} Credits
                </span>
              </div>

              <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg grid grid-cols-3 gap-2 font-mono text-xs text-center">
                <div>
                  <span className="text-[10px] text-[var(--slate)] block uppercase">Enrolled:</span>
                  <strong className="text-[var(--ink)]">{students.length} Students</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--slate)] block uppercase">Room / Lab:</span>
                  <strong className="text-[var(--ink)]">{course.room || 'Room 302'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--slate)] block uppercase">Type:</span>
                  <strong className={isLab ? 'text-purple-800' : 'text-emerald-800'}>{isLab ? 'Practical Lab' : 'Core Theory'}</strong>
                </div>
              </div>

              {isLab ? (
                <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg text-xs font-mono text-purple-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>🧪</span> Laboratory Course Management Active
                  </div>
                  <p className="text-[11px] text-purple-800">
                    5 Practical Experiments configured. Supports GitHub code verification, viva marks, and observation scoring.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs font-mono text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>📖</span> Core Theory Course Management
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Units 1–5 lecture series with Continuous Internal Assessment (CIA 1 &amp; CIA 2) integration.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => navigate(`/faculty/courses/${course.code}`)}
                  className="flex-1 btn-ink py-2 rounded font-mono text-xs font-bold text-center shadow-2xs cursor-pointer"
                >
                  Open Course Workspace 📂
                </button>
                <button
                  onClick={() => navigate('/faculty/attendance')}
                  className="btn-ghost py-2 px-3 border border-[var(--rule)] hover:border-[var(--ink)] rounded font-mono text-xs font-bold text-center cursor-pointer"
                >
                  Attendance ⏱️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

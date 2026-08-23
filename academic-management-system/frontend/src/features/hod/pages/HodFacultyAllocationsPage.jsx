import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { Modal } from '../../../components/ui/Modal';

export const HodFacultyAllocationsPage = () => {
  const { activeSemester, activeWorkspace, faculty, facultyAllocations, allocateFacultyToCourse } = useAcademic();

  const courses = activeWorkspace?.courses || [];

  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code || 'BCA301');
  const [selectedFaculty, setSelectedFaculty] = useState(faculty[0]?.id || 'FAC01');
  const [weeklyHours, setWeeklyHours] = useState(4);
  const [allocType, setAllocType] = useState('THEORY');
  const [actionSuccess, setActionSuccess] = useState(null);

  const handleAllocateSubmit = (e) => {
    e.preventDefault();

    allocateFacultyToCourse(selectedCourse, selectedFaculty, weeklyHours, allocType);

    const facObj = faculty.find(f => f.id === selectedFaculty) || { name: 'Faculty' };
    setActionSuccess(`✓ Successfully assigned ${facObj.name} to course ${selectedCourse} (${weeklyHours} hrs/week).`);
    setAllocModalOpen(false);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const facultyWorkloads = faculty.map(f => {
    const allocs = facultyAllocations.filter(a => a.facultyId === f.id && a.status === 'ACTIVE');
    const totalHours = allocs.reduce((acc, curr) => acc + curr.weeklyHours, 0);
    const isUnassigned = allocs.length === 0;
    const isOverloaded = totalHours > 16;

    return {
      ...f,
      allocs,
      totalHours,
      isUnassigned,
      isOverloaded,
      statusLabel: isUnassigned ? 'UNASSIGNED (0 Hours)' : isOverloaded ? 'OVERLOADED (>16 Hours)' : 'BALANCED LOAD'
    };
  });

  const headers = ['Faculty Name', 'Designation', 'Assigned Courses', 'Weekly Teaching Hours', 'Workload Status'];
  const rows = facultyWorkloads.map(f => [
    f.name,
    f.role,
    f.allocs.map(a => a.courseCode).join(', ') || 'None',
    `${f.totalHours} Hours/Week`,
    f.statusLabel
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>👨‍🏫</span> FACULTY WORKLOAD &amp; TEACHING ALLOCATION
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Department Faculty Teaching Allocations — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Balance faculty weekly teaching workloads, allocate theory and laboratory modules, and prevent allocation conflicts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAllocModalOpen(true)}
            className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>➕</span> Allocate Course to Faculty
          </button>
          <ExportToolbar
            filename={`hod_faculty_allocations_sem${activeSemester}`}
            title={`Faculty Workload & Allocation Register — Semester ${activeSemester}`}
            subtitle="Department of Computer Applications"
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          {actionSuccess}
        </div>
      )}

      {/* Faculty Workload Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {facultyWorkloads.map((f) => (
          <div
            key={f.id}
            className={`card p-5 bg-white border flex flex-col justify-between space-y-4 transition ${
              f.isUnassigned ? 'border-amber-300 bg-amber-50/20' : f.isOverloaded ? 'border-red-300' : 'border-[var(--rule)]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <strong className="text-sm text-[var(--ink)]">{f.name}</strong>
                <Badge variant={f.isUnassigned ? 'amber' : f.isOverloaded ? 'fail' : 'pass'}>
                  {f.isUnassigned ? 'UNASSIGNED' : `${f.totalHours} HRS/WK`}
                </Badge>
              </div>
              <span className="text-[11px] text-[var(--slate)] block">{f.role} • {f.dept}</span>

              {/* Assigned courses list */}
              <div className="mt-3 space-y-1.5">
                <span className="text-[10px] text-[var(--slate)] uppercase font-bold block">Assigned Modules:</span>
                {f.allocs.length === 0 ? (
                  <p className="text-[11px] text-amber-800 italic">No active course allocated in Semester {activeSemester}.</p>
                ) : (
                  f.allocs.map((a) => (
                    <div key={a.id} className="p-2 bg-[var(--parchment)] border border-[var(--rule)] rounded flex justify-between items-center text-[11px]">
                      <div>
                        <strong className="text-[var(--brass-2)] mr-1">{a.courseCode}</strong>
                        <span className="text-[var(--ink)] truncate max-w-[120px] inline-block align-middle">{a.courseName}</span>
                      </div>
                      <span className="text-[10px] text-[var(--slate)]">{a.weeklyHours}h</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedFaculty(f.id);
                setAllocModalOpen(true);
              }}
              className="w-full py-1.5 bg-[var(--parchment-2)] hover:bg-[var(--brass-soft)] border border-[var(--rule)] rounded font-bold text-[var(--ink)] transition text-center cursor-pointer"
            >
              🔄 Modify Allocation
            </button>
          </div>
        ))}
      </div>

      {/* Allocation Modal */}
      {allocModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setAllocModalOpen(false)}
          title="Allocate Course to Faculty Member"
        >
          <form onSubmit={handleAllocateSubmit} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Select Faculty Instructor *:</label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="field-input text-xs font-mono font-bold"
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Select Course *:</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="field-input text-xs font-mono font-bold"
              >
                {courses.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Weekly Teaching Hours *:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="field-input text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Allocation Type *:</label>
                <select
                  value={allocType}
                  onChange={(e) => setAllocType(e.target.value)}
                  className="field-input text-xs font-mono font-bold"
                >
                  <option value="THEORY">Core Theory Lecture</option>
                  <option value="LAB">Laboratory Practical</option>
                  <option value="TUTORIAL">Remedial Tutorial</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setAllocModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Save Teaching Allocation →
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

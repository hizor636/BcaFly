import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { IngestionZone } from '../../../components/ui/IngestionZone';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const AdminCoursesPage = () => {
  const { activeSemester, activeWorkspace, faculty, addCourse, logAction } = useAcademic();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Core Theory',
    credits: 4,
    facultyId: 'FAC01',
    room: 'Room 301'
  });

  const courses = activeWorkspace?.courses || [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;
    addCourse(activeSemester, formData);
    setModalOpen(false);
    setFormData({ code: '', name: '', type: 'Core Theory', credits: 4, facultyId: 'FAC01', room: 'Room 301' });
  };

  const getFacultyName = (id) => {
    const f = faculty.find(fac => fac.id === id);
    return f ? f.name : 'Assigned Instructor';
  };

  const headers = ['Course Code', 'Course Title', 'Course Type', 'Credits', 'Assigned Faculty', 'Room Slot'];
  const rows = courses.map(c => [
    c.code,
    c.name || c.title,
    c.type,
    c.credits,
    getFacultyName(c.facultyId),
    c.room || 'N/A'
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Courses &amp; Subjects
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Courses and credits configured exclusively for the active semester environment.
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <ExportToolbar
            filename={`bca_sem${activeSemester}_courses`}
            title={`Semester ${activeSemester} Course Catalog`}
            subtitle={`BCA Academic Workspace — Term ${activeWorkspace?.term || 'ODD'}`}
            headers={headers}
            rows={rows}
            extraButtons={
              <button
                onClick={() => setModalOpen(true)}
                className="btn-ink text-xs font-mono px-4 py-1.5 rounded flex items-center gap-1.5 font-bold"
              >
                + ADD COURSE
              </button>
            }
          />
        </div>
      </div>

      <IngestionZone
        title="IMPORT COURSE SPECIFICATIONS"
        description="Bulk import course codes, credit hours, lab requirements (Excel/CSV) or upload official syllabi (PDF) for automated parsing."
        onFileSelect={(file) => {
          logAction('Courses Imported', `Imported course catalog from "${file.name}" for Semester ${activeSemester}.`);
          alert(`Successfully ingested courses from "${file.name}".`);
        }}
      />

      <LedgerTable
        searchPlaceholder="Filter courses by code, title, or instructor..."
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: 'Course Code',
            accessor: 'code',
            render: (c) => <span className="font-mono font-bold text-[var(--ink)]">{c.code}</span>
          },
          { header: 'Course Title', accessor: 'name', render: (c) => c.name || c.title },
          {
            header: 'Course Type',
            accessor: 'type',
            render: (c) => (
              <Badge variant={c.type.includes('Lab') ? 'pass' : c.type.includes('Elective') ? 'amber' : 'ink'}>
                {c.type}
              </Badge>
            )
          },
          {
            header: 'Credits',
            accessor: 'credits',
            render: (c) => <span className="font-mono font-bold">{c.credits} Credits</span>
          },
          {
            header: 'Assigned Faculty',
            accessor: 'facultyId',
            render: (c) => (
              <div className="font-mono text-xs">
                <div className="font-bold text-[var(--ink)]">{getFacultyName(c.facultyId)}</div>
                <div className="text-[10px] text-[var(--slate)]">{c.facultyId}</div>
              </div>
            )
          },
          { header: 'Classroom Slot', accessor: 'room', render: (c) => c.room || 'Room 301' }
        ]}
        data={courses}
      />

      {/* Add Course Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Configure New Course for Semester ${activeSemester}`}
        tag="ADMIN CONFIG"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Course Code:</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. BCA306"
                className="field-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Credits:</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="field-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Course Title:</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Advanced Web Architectures"
              className="field-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Course Type:</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="field-input text-xs"
              >
                <option value="Core Theory">Core Theory</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Discipline Elective">Discipline Elective</option>
                <option value="Ability Enhancement">Ability Enhancement</option>
                <option value="Major Capstone">Major Capstone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Assigned Instructor:</label>
              <select
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                className="field-input text-xs"
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Classroom / Lab Slot:</label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="e.g. Room 305 or Database Lab"
              className="field-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-ghost border border-[var(--rule)] px-4 py-2 rounded text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-ink px-4 py-2 rounded text-xs font-mono font-bold"
            >
              Save Course Configuration →
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

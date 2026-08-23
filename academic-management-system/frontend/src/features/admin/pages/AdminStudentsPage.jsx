import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { IngestionZone } from '../../../components/ui/IngestionZone';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const AdminStudentsPage = () => {
  const { activeSemester, activeWorkspace, addStudent, logAction } = useAcademic();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    name: '',
    reg: '',
    section: 'A',
    batch: activeWorkspace?.batch || '2024–27',
    attendance: 90,
    sgpa: 8.5
  });

  const students = activeWorkspace?.students || [];

  const filteredStudents = students.filter(s => {
    if (sectionFilter !== 'ALL' && s.section !== sectionFilter) return false;
    return true;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addStudent(activeSemester, formData);
    setModalOpen(false);
    setFormData({ name: '', reg: '', section: 'A', batch: activeWorkspace?.batch || '2024–27', attendance: 90, sgpa: 8.5 });
  };

  const headers = ['Reg. No / USN', 'Student Name', 'Section', 'Batch', 'Attendance %', 'Current SGPA', 'Result Status'];
  const rows = filteredStudents.map(s => [
    s.reg || s.usn,
    s.name,
    `Sec ${s.section}`,
    s.batch,
    `${s.attendance}%`,
    s.sgpa?.toFixed(2) || '0.00',
    s.resultStatus || 'PASS'
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Enrolment &amp; Rosters
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Official student registry enrolled in Semester {activeSemester} ({activeWorkspace?.batch}).
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <ExportToolbar
            filename={`bca_sem${activeSemester}_roster`}
            title={`Semester ${activeSemester} Student Roster`}
            subtitle={`Batch: ${activeWorkspace?.batch} — Total: ${filteredStudents.length} Students`}
            headers={headers}
            rows={rows}
            extraButtons={
              <button
                onClick={() => setModalOpen(true)}
                className="btn-ink text-xs font-mono px-4 py-1.5 rounded flex items-center gap-1.5 font-bold"
              >
                + ENROL STUDENT
              </button>
            }
          />
        </div>
      </div>

      <IngestionZone
        title="IMPORT STUDENT ENROLMENT ROSTER"
        description="Upload admission lists (Excel/CSV) or university nominal rolls (PDF) to batch-enrol students with automatic USN allocation."
        onFileSelect={(file) => {
          logAction('Roster Ingested', `Ingested student file "${file.name}" for Semester ${activeSemester}.`);
          alert(`Successfully uploaded "${file.name}".`);
        }}
      />

      <LedgerTable
        searchPlaceholder="Search student by name, USN, or register number..."
        searchValue={search}
        onSearchChange={setSearch}
        extraToolbar={
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[var(--slate)] font-bold">SECTION:</span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="field-input text-xs py-1"
            >
              <option value="ALL">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>
        }
        columns={[
          {
            header: 'USN / Reg No',
            accessor: 'reg',
            render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
          },
          {
            header: 'Student Name',
            accessor: 'name',
            render: (s) => (
              <div className="font-mono text-xs">
                <div className="font-bold text-[var(--ink)]">{s.name}</div>
                <div className="text-[10px] text-[var(--slate)]">Batch {s.batch}</div>
              </div>
            )
          },
          {
            header: 'Section',
            accessor: 'section',
            render: (s) => <span className="font-mono font-semibold">Sec {s.section}</span>
          },
          {
            header: 'Attendance',
            accessor: 'attendance',
            render: (s) => (
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">{s.attendance}%</span>
                <Badge variant={s.attendance >= 75 ? 'pass' : s.attendance >= 65 ? 'amber' : 'fail'}>
                  {s.attendance >= 75 ? 'Eligible' : s.attendance >= 65 ? 'Condonation' : 'Debarred'}
                </Badge>
              </div>
            )
          },
          {
            header: 'SGPA',
            accessor: 'sgpa',
            render: (s) => <span className="font-mono font-bold text-[var(--brass-2)]">{s.sgpa?.toFixed(2)}</span>
          },
          {
            header: 'Standing',
            accessor: 'resultStatus',
            render: (s) => (
              <Badge variant={s.resultStatus === 'PASS' ? 'pass' : 'fail'}>
                {s.resultStatus === 'PASS' ? 'PASS (Clear)' : `Arrears (${s.backlogCount || 1})`}
              </Badge>
            )
          }
        ]}
        data={filteredStudents}
      />

      {/* Enrol Student Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Enrol Student in Semester ${activeSemester}`}
        tag="STUDENT REGISTRY"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Student Full Name:</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Vikram Sharma"
              className="field-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Register No / USN:</label>
              <input
                type="text"
                value={formData.reg}
                onChange={(e) => setFormData({ ...formData, reg: e.target.value.toUpperCase() })}
                placeholder="e.g. 1BC24009"
                className="field-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Section:</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="field-input text-xs"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Initial Attendance %:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.attendance}
                onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })}
                className="field-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Current SGPA:</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.sgpa}
                onChange={(e) => setFormData({ ...formData, sgpa: Number(e.target.value) })}
                className="field-input text-xs"
              />
            </div>
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
              Confirm Enrolment →
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

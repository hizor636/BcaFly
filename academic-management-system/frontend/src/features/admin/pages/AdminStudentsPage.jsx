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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');

  // Import State
  const [importPreview, setImportPreview] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [importFileName, setImportFileName] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState(null);

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
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !(s.reg || s.usn || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addStudent(activeSemester, formData);
    setModalOpen(false);
    setFormData({ name: '', reg: '', section: 'A', batch: activeWorkspace?.batch || '2024–27', attendance: 90, sgpa: 8.5 });
  };

  // CSV Parsing & Validation
  const handleCSVFileSelect = (file) => {
    setImportFileName(file.name);
    setImportErrors([]);
    setImportPreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length <= 1) {
          setImportErrors(['Uploaded file is empty or missing data rows.']);
          setImportModalOpen(true);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
        const regIdx = headers.findIndex(h => h.includes('reg') || h.includes('usn') || h.includes('id'));
        const nameIdx = headers.findIndex(h => h.includes('name'));
        const secIdx = headers.findIndex(h => h.includes('sec'));
        const attIdx = headers.findIndex(h => h.includes('att'));
        const sgpaIdx = headers.findIndex(h => h.includes('sgpa') || h.includes('cgpa') || h.includes('marks'));

        if (nameIdx === -1) {
          setImportErrors(['CSV header missing required "fullName" or "name" column.']);
          setImportModalOpen(true);
          return;
        }

        const parsedRows = [];
        const errs = [];
        const seenRegs = new Set();

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length === 0 || cols.every(c => c === '')) continue;

          const name = cols[nameIdx] || '';
          const reg = (regIdx !== -1 && cols[regIdx]) ? cols[regIdx] : `1BC24${String(100 + i).padStart(3, '0')}`;
          const section = (secIdx !== -1 && cols[secIdx]) ? cols[secIdx].toUpperCase() : 'A';
          const attendance = (attIdx !== -1 && !isNaN(cols[attIdx])) ? Number(cols[attIdx]) : 88;
          const sgpa = (sgpaIdx !== -1 && !isNaN(cols[sgpaIdx])) ? Number(cols[sgpaIdx]) : 8.2;

          if (!name) {
            errs.push(`Row ${i + 1}: Missing student name.`);
            continue;
          }

          if (seenRegs.has(reg.toLowerCase())) {
            errs.push(`Row ${i + 1}: Duplicate register number "${reg}" in file.`);
            continue;
          }
          seenRegs.add(reg.toLowerCase());

          parsedRows.push({
            name,
            reg,
            usn: reg,
            section,
            batch: activeWorkspace?.batch || '2024–27',
            attendance,
            sgpa,
            cgpa: sgpa,
            status: 'Active',
            resultStatus: 'PASS'
          });
        }

        setImportPreview(parsedRows);
        setImportErrors(errs);
        setImportModalOpen(true);
      } catch (err) {
        setImportErrors(['Failed to parse file: ' + err.message]);
        setImportModalOpen(true);
      }
    };
    reader.readAsText(file);
  };

  const confirmBatchImport = () => {
    if (!importPreview || importPreview.length === 0) return;

    importPreview.forEach(student => {
      addStudent(activeSemester, student);
    });

    logAction(
      'Bulk Student Import Completed',
      `Imported ${importPreview.length} students into Semester ${activeSemester} from "${importFileName}".`,
      'Administrator',
      'ADMIN'
    );

    setImportSuccessMsg(`✓ Successfully imported ${importPreview.length} students into Semester ${activeSemester}.`);
    setImportModalOpen(false);
    setImportPreview(null);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  const downloadTemplate = () => {
    const csvContent = "registerNumber,admissionNumber,fullName,email,phone,department,program,academicYear,semester,section,batch,status\n"
      + "BCA24001,ADM2024001,Aakash Singh,aakash@example.com,9876543210,BCA,BCA,2025-26,3,A,Batch-1,ACTIVE\n"
      + "BCA24002,ADM2024002,Bhavana M,bhavana@example.com,9876543211,BCA,BCA,2025-26,3,A,Batch-1,ACTIVE\n"
      + "BCA24003,ADM2024003,Chetan Kumar,chetan@example.com,9876543212,BCA,BCA,2025-26,3,B,Batch-2,ACTIVE\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bcafly_student_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🎓</span> CENTRAL ENROLMENT &amp; NOMINAL ROSTERS
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Student Enrolment Registry
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            One central source of truth: Master student registry enrolled in Semester {activeSemester} ({activeWorkspace?.batch}).
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={downloadTemplate}
            className="px-3 py-1.5 bg-white hover:bg-[var(--parchment-2)] border border-[var(--rule)] rounded text-xs font-mono font-bold text-[var(--ink)] flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>📥</span> Download CSV Template
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-brass text-xs font-mono px-4 py-1.5 rounded flex items-center gap-1.5 font-bold shadow-xs cursor-pointer"
          >
            <span>➕</span> Single Enrolment
          </button>
          <ExportToolbar
            filename={`bca_sem${activeSemester}_roster`}
            title={`Semester ${activeSemester} Student Roster`}
            subtitle={`Batch: ${activeWorkspace?.batch} — Total: ${filteredStudents.length} Students`}
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {importSuccessMsg && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          {importSuccessMsg}
        </div>
      )}

      {/* CSV Ingestion Zone */}
      <IngestionZone
        title="BULK STUDENT CSV / EXCEL INGESTION"
        description="Drag and drop your nominal roll CSV or admission spreadsheet. The system will validate uniqueness, check columns, and provide an instant import preview."
        onFileSelect={handleCSVFileSelect}
      />

      {/* Roster Ledger */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3 flex-wrap gap-3 font-mono text-xs">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Enrolled Student Ledger ({filteredStudents.length} Students)
          </h4>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
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
          </div>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Reg. No / USN',
              accessor: 'reg',
              render: (s) => (
                <span className="font-mono font-bold text-xs bg-[var(--parchment-2)] px-2 py-0.5 rounded border border-[var(--rule)] text-[var(--ink)]">
                  {s.reg || s.usn}
                </span>
              )
            },
            {
              header: 'Student Name',
              accessor: 'name',
              render: (s) => <strong className="text-xs text-[var(--ink)]">{s.name}</strong>
            },
            {
              header: 'Section & Batch',
              accessor: 'section',
              render: (s) => <span className="font-mono text-xs">Sec {s.section} • {s.batch}</span>
            },
            {
              header: 'Attendance %',
              accessor: 'attendance',
              render: (s) => (
                <span className={`font-mono font-bold text-xs ${s.attendance < 75 ? 'text-red-700' : 'text-emerald-800'}`}>
                  {s.attendance}%
                </span>
              )
            },
            {
              header: 'Current SGPA',
              accessor: 'sgpa',
              render: (s) => <span className="font-mono font-bold text-xs text-[var(--brass-2)]">{s.sgpa?.toFixed(2)}</span>
            },
            {
              header: 'Standing',
              accessor: 'resultStatus',
              render: (s) => <Badge variant={s.resultStatus === 'FAIL' ? 'fail' : 'pass'}>{s.resultStatus || 'PASS'}</Badge>
            }
          ]}
          data={filteredStudents}
        />
      </div>

      {/* CSV Import Preview Modal */}
      {importModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setImportModalOpen(false)}
          title={`Bulk Student Import — "${importFileName}"`}
        >
          <div className="space-y-4 font-sans text-xs">
            {importErrors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 font-mono text-xs space-y-1">
                <strong className="block font-bold">⚠️ Import Validation Errors:</strong>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  {importErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {importPreview && importPreview.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded font-mono text-xs text-emerald-900 flex justify-between">
                  <span>✓ <strong>{importPreview.length} valid student records</strong> detected.</span>
                  <span>Target: Semester {activeSemester}</span>
                </div>

                <div className="max-h-60 overflow-y-auto border border-[var(--rule)] rounded">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-[var(--parchment-2)] border-b border-[var(--rule)] sticky top-0">
                      <tr>
                        <th className="p-2">Reg. No</th>
                        <th className="p-2">Student Name</th>
                        <th className="p-2">Section</th>
                        <th className="p-2">Initial Att.</th>
                        <th className="p-2">SGPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--rule)]">
                      {importPreview.map((s, idx) => (
                        <tr key={idx} className="hover:bg-[var(--parchment)]">
                          <td className="p-2 font-bold text-[var(--brass-2)]">{s.reg}</td>
                          <td className="p-2 font-bold text-[var(--ink)]">{s.name}</td>
                          <td className="p-2">Sec {s.section}</td>
                          <td className="p-2">{s.attendance}%</td>
                          <td className="p-2">{s.sgpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(false)}
                    className="px-3 py-2 rounded text-xs text-[var(--slate)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmBatchImport}
                    className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
                  >
                    Confirm &amp; Enrol {importPreview.length} Students →
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-[var(--rule)] flex justify-end">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="btn-ink px-4 py-2 rounded font-mono text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Single Enrolment Modal */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={`Enrol Student — Semester ${activeSemester}`}
        >
          <form onSubmit={handleCreate} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Full Student Name *:</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Kumar"
                className="field-input text-xs"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Register Number / USN:</label>
              <input
                type="text"
                value={formData.reg}
                onChange={(e) => setFormData({ ...formData, reg: e.target.value })}
                placeholder="e.g. BCS24CA009 (Auto-generated if empty)"
                className="field-input text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Section:</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="field-input text-xs font-mono"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Batch:</label>
                <input
                  type="text"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="field-input text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Save Enrolment →
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

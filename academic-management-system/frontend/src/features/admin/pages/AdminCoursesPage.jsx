import React, { useState, useMemo } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { IngestionZone } from '../../../components/ui/IngestionZone';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { parseCourseFile, SYSTEM_FIELDS } from '../../../utils/courseImportParser';
import { Edit2, Trash2, Plus, AlertCircle, CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet, Layers, BookOpen } from 'lucide-react';
import apiService from '../../../services/apiService';

export const AdminCoursesPage = () => {
  const {
    activeSemester,
    activeWorkspace,
    faculty,
    addCourse,
    updateCourse,
    deleteCourse,
    bulkDeleteCourses,
    importCourses,
    logAction
  } = useAcademic();

  const courses = activeWorkspace?.courses || [];

  // Table & selection state
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Add / Edit Modal state
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingTarget, setEditingTarget] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Core Theory',
    credits: 4,
    facultyId: 'FAC01',
    room: 'Room 301'
  });
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modals
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // File Import Preview Modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importAnalysis, setImportAnalysis] = useState(null);
  const [importFilter, setImportFilter] = useState('all'); // 'all' | 'ready' | 'warning' | 'error'
  const [importOptions, setImportOptions] = useState({
    overwriteDuplicates: true,
    skipErrors: true,
    replaceMode: false
  });
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);

  // Clear selected file/preview if the semester changes
  React.useEffect(() => {
    if (importAnalysis) {
      setImportAnalysis(null);
      setImportModalOpen(false);
      alert("Active semester changed. Please select the file again for the new target semester.");
    }
  }, [activeSemester]);

  // Compute metrics
  const totalCredits = useMemo(() => courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0), [courses]);
  const labCount = useMemo(() => courses.filter(c => (c.type || '').toLowerCase().includes('lab')).length, [courses]);
  const theoryCount = useMemo(() => courses.length - labCount, [courses, labCount]);

  const getFacultyName = (id) => {
    const f = faculty.find(fac => fac.id === id);
    return f ? f.name : 'Assigned Instructor';
  };

  // Selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === courses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(courses.map(c => c.id || c.code));
    }
  };

  // Modal open handlers
  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingTarget(null);
    setFormData({
      code: '',
      name: '',
      type: 'Core Theory',
      credits: 4,
      facultyId: faculty[0]?.id || 'FAC01',
      room: 'Room 301'
    });
    setFormError('');
  };

  const handleOpenEdit = (course) => {
    setModalMode('edit');
    setEditingTarget(course);
    setFormData({
      code: course.code || '',
      name: course.name || course.title || '',
      type: course.type || 'Core Theory',
      credits: Number(course.credits) || 4,
      facultyId: course.facultyId || 'FAC01',
      room: course.room || course.classroomSlot || 'Room 301'
    });
    setFormError('');
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedCode = formData.code.trim().toUpperCase();
    const trimmedName = formData.name.trim();

    if (!trimmedCode) {
      setFormError('Course Code is required.');
      return;
    }
    if (!trimmedName) {
      setFormError('Course Title is required.');
      return;
    }

    if (modalMode === 'add') {
      // Check duplicate
      const exists = courses.some(c => (c.code || '').trim().toUpperCase() === trimmedCode);
      if (exists) {
        setFormError(`Course code "${trimmedCode}" already exists in Semester ${activeSemester}.`);
        return;
      }
      addCourse(activeSemester, {
        code: trimmedCode,
        name: trimmedName,
        title: trimmedName,
        type: formData.type,
        credits: Number(formData.credits) || 4,
        facultyId: formData.facultyId,
        room: formData.room
      });
    } else if (modalMode === 'edit' && editingTarget) {
      updateCourse(activeSemester, editingTarget.id || editingTarget.code, {
        code: trimmedCode,
        name: trimmedName,
        title: trimmedName,
        type: formData.type,
        credits: Number(formData.credits) || 4,
        facultyId: formData.facultyId,
        room: formData.room
      });
    }

    setModalMode(null);
    setEditingTarget(null);
  };

  // Delete handlers
  const handleConfirmSingleDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id || deleteTarget.code;
    deleteCourse(activeSemester, targetId);
    setSelectedIds(prev => prev.filter(id => id !== targetId));
    setDeleteTarget(null);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    bulkDeleteCourses(activeSemester, selectedIds);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  // File Upload and Parsing Handler
  const handleFileSelect = async (file) => {
    if (!activeSemester) {
      alert("Select a semester before uploading a document.");
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      alert("Please select a CSV, XLS, or XLSX document.");
      return;
    }

    setIsIngesting(true);
    setImportSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('semesterId', String(activeSemester));
      formData.append('academicYearId', activeWorkspace?.term || '2025-26-odd');

      let analysis;
      try {
        const response = await apiService.admin.previewImportCourses(formData);
        if (response && response.success) {
          analysis = {
            uploadId: response.uploadId,
            fileName: file.name,
            fileSize: file.size,
            stats: response.stats,
            rows: response.rows,
            mappedFields: ["courseCode", "courseTitle", "courseType", "credits"],
            detectedHeaders: {
              courseCode: "Course Code",
              courseTitle: "Course Title",
              courseType: "Course Type",
              credits: "Credits"
            },
            unknownHeaders: [],
            isBackend: true
          };
        }
      } catch (apiErr) {
        console.warn("Backend preview failed or offline, falling back to local client parsing:", apiErr);
        const clientAnalysis = await parseCourseFile(file, courses, faculty);
        analysis = {
          ...clientAnalysis,
          uploadId: "UP-" + Date.now(),
          isBackend: false
        };
      }

      setImportAnalysis(analysis);
      setImportFilter('all');
      setImportModalOpen(true);
    } catch (err) {
      alert(`Failed to parse file "${file.name}": ${err.message}`);
    } finally {
      setIsIngesting(false);
    }
  };

  // Import Confirmation Handler
  const handleConfirmImport = async () => {
    if (!importAnalysis || !importAnalysis.rows) return;

    let rowsToImport = importAnalysis.rows;

    if (importOptions.skipErrors) {
      rowsToImport = rowsToImport.filter(r => r.status !== 'error');
    }

    if (rowsToImport.length === 0) {
      alert('No valid rows available to import.');
      return;
    }

    const confirmMsg = `Import ${rowsToImport.length} courses into Semester ${activeSemester}?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    const mode = importOptions.replaceMode ? 'replace' : 'merge';

    try {
      if (importAnalysis.isBackend) {
        await apiService.admin.confirmImportCourses({
          uploadId: importAnalysis.uploadId,
          semesterId: activeSemester,
          academicYearId: activeWorkspace?.term || '2025-26-odd',
          mode: mode
        });
      }
    } catch (apiErr) {
      console.warn("Backend import confirmation failed or offline, continuing local state import:", apiErr);
    }

    importCourses(activeSemester, rowsToImport, {
      overwriteDuplicates: importOptions.overwriteDuplicates,
      replaceMode: importOptions.replaceMode
    });

    setImportSuccessMsg(`Successfully imported ${rowsToImport.length} subjects into Semester ${activeSemester}.`);
    setImportModalOpen(false);
    setImportAnalysis(null);

    setTimeout(() => {
      setImportSuccessMsg('');
    }, 6000);
  };

  // Filtered rows for Import Preview Modal
  const previewRows = useMemo(() => {
    if (!importAnalysis || !importAnalysis.rows) return [];
    if (importFilter === 'all') return importAnalysis.rows;
    if (importFilter === 'ready') return importAnalysis.rows.filter(r => r.status === 'ready');
    if (importFilter === 'warning') return importAnalysis.rows.filter(r => r.status === 'warning');
    if (importFilter === 'error') return importAnalysis.rows.filter(r => r.status === 'error');
    return importAnalysis.rows;
  }, [importAnalysis, importFilter]);

  // Export headers & rows
  const exportHeaders = ['Course Code', 'Course Title', 'Course Type', 'Credits', 'Assigned Faculty', 'Classroom Slot'];
  const exportRows = courses.map(c => [
    c.code,
    c.name || c.title,
    c.type,
    c.credits,
    getFacultyName(c.facultyId),
    c.room || c.classroomSlot || 'Room 301'
  ]);

  return (
    <div className="space-y-4">
      {/* Top Banner / Success Alert */}
      {importSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between gap-2 text-emerald-900 text-xs font-mono animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importSuccessMsg}</span>
          </div>
          <button
            onClick={() => setImportSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-950 font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Export Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
              Semester {activeSemester} Courses &amp; Subjects
            </h3>
            <span className="badge b-ink text-[10px] font-mono font-bold">
              {courses.length} SUBJECTS
            </span>
          </div>
          <p className="text-xs text-[var(--slate)] mt-0.5">
            Configure CBCS courses, credit hours, lab requirements, and instructor allocations for Semester {activeSemester}.
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <ExportToolbar
            filename={`bca_sem${activeSemester}_courses`}
            title={`Semester ${activeSemester} Course Catalog`}
            subtitle={`BCA Academic Workspace — Term ${activeWorkspace?.term || 'ODD'}`}
            headers={exportHeaders}
            rows={exportRows}
            extraButtons={
              <button
                onClick={handleOpenAdd}
                className="btn-ink text-xs font-mono px-3.5 py-1.5 rounded flex items-center gap-1.5 font-bold cursor-pointer hover:shadow-md transition-shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD COURSE</span>
              </button>
            }
          />
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--brass-soft)] border border-[var(--brass)] flex items-center justify-center text-[var(--ink)] font-bold text-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Total Subjects</div>
            <div className="font-display font-bold text-lg text-[var(--ink)]">{courses.length}</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 font-bold text-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Total Credits</div>
            <div className="font-display font-bold text-lg text-blue-900">{totalCredits}</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-sm">
            📖
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Core Theory</div>
            <div className="font-display font-bold text-lg text-amber-900">{theoryCount}</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm">
            🧪
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Labs / Practicals</div>
            <div className="font-display font-bold text-lg text-emerald-900">{labCount}</div>
          </div>
        </div>
      </div>

      {/* Ingestion Zone with Dynamic File Parsing */}
      <div className={!activeSemester ? "opacity-50 pointer-events-none" : ""}>
        <IngestionZone
          title="IMPORT COURSE SPECIFICATIONS"
          description={
            activeSemester
              ? `Importing into: BCA Semester ${activeSemester} (${activeWorkspace?.term || '2025–26 ODD'})`
              : "Select a semester before uploading a document."
          }
          acceptedFormats={['.CSV', '.XLSX', '.XLS']}
          onFileSelect={activeSemester ? handleFileSelect : undefined}
          icon={isIngesting ? '⏳' : '📂'}
        />
      </div>

      {/* Bulk Actions Banner when items are selected */}
      {selectedIds.length > 0 && (
        <div className="card p-3 bg-[var(--parchment-2)] border-2 border-[var(--brass)] flex items-center justify-between gap-3 flex-wrap animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[var(--ink)]">
              {selectedIds.length} course{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <span className="text-xs text-[var(--slate)]">from Semester {activeSemester} catalog</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="btn-ghost border border-[var(--rule)] text-xs font-mono px-3 py-1.5 rounded"
            >
              Deselect All
            </button>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="px-3.5 py-1.5 rounded text-xs font-mono font-bold bg-red-700 hover:bg-red-800 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Ledger Table with Checkboxes, Actions, Badges */}
      <LedgerTable
        searchPlaceholder="Filter courses by code, title, type, or instructor..."
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: (
              <input
                type="checkbox"
                aria-label="Select all courses"
                checked={courses.length > 0 && selectedIds.length === courses.length}
                onChange={handleToggleSelectAll}
                className="cursor-pointer rounded border-[var(--rule)]"
              />
            ),
            accessor: 'select',
            width: '40px',
            align: 'center',
            render: (c) => {
              const id = c.id || c.code;
              return (
                <input
                  type="checkbox"
                  aria-label={`Select course ${c.code}`}
                  checked={selectedIds.includes(id)}
                  onChange={() => handleToggleSelect(id)}
                  className="cursor-pointer rounded border-[var(--rule)]"
                />
              );
            }
          },
          {
            header: 'Course Code',
            accessor: 'code',
            render: (c) => (
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[var(--ink)] tracking-wider">
                  {c.code}
                </span>
              </div>
            )
          },
          {
            header: 'Course Title',
            accessor: 'name',
            render: (c) => (
              <div>
                <div className="font-bold text-[var(--ink)] text-xs">{c.name || c.title}</div>
                <div className="text-[10px] text-[var(--slate)] font-mono">CBCS Accredited</div>
              </div>
            )
          },
          {
            header: 'Course Type',
            accessor: 'type',
            render: (c) => {
              const typeStr = c.type || 'Core Theory';
              const isLab = typeStr.toLowerCase().includes('lab');
              const isElective = typeStr.toLowerCase().includes('elective');
              const isAbility = typeStr.toLowerCase().includes('ability');
              return (
                <Badge variant={isLab ? 'pass' : isElective ? 'amber' : isAbility ? 'amber' : 'ink'}>
                  {typeStr}
                </Badge>
              );
            }
          },
          {
            header: 'Credits',
            accessor: 'credits',
            render: (c) => (
              <span className="font-mono font-bold text-xs bg-[var(--parchment-2)] px-2 py-0.5 rounded border border-[var(--rule)]">
                {c.credits} Credits
              </span>
            )
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
          {
            header: 'Classroom / Slot',
            accessor: 'room',
            render: (c) => (
              <span className="font-mono text-xs text-[var(--ink)]">
                {c.room || c.classroomSlot || 'Room 301'}
              </span>
            )
          },
          {
            header: 'Actions',
            accessor: 'actions',
            align: 'right',
            render: (c) => (
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[var(--parchment-2)] hover:bg-[var(--parchment-3)] text-[var(--ink)] border border-[var(--rule)] flex items-center gap-1 transition-colors cursor-pointer"
                  title={`Edit ${c.code}`}
                >
                  <Edit2 className="w-3 h-3 text-[var(--slate)]" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(c)}
                  className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title={`Delete ${c.code}`}
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                  <span>Delete</span>
                </button>
              </div>
            )
          }
        ]}
        data={courses}
      />

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode === 'add' ? `Configure New Course for Semester ${activeSemester}` : `Edit Course ${editingTarget?.code || ''}`}
        tag={modalMode === 'add' ? 'ADMIN CONFIG' : 'COURSE UPDATE'}
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-red-800 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">
                Course Code: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. BCA306"
                className="field-input text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">
                Credits: <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="field-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">
              Course Title: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Advanced Web Architectures & Cloud Services"
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
              placeholder="e.g. Room 305 or Database Lab 2"
              className="field-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--rule)]">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="btn-ghost border border-[var(--rule)] px-4 py-2 rounded text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-ink px-4 py-2 rounded text-xs font-mono font-bold cursor-pointer"
            >
              {modalMode === 'add' ? 'Save Course Configuration →' : 'Update Course Changes →'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Single Course Confirmation Modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Course Deletion"
        tag="DESTRUCTIVE ACTION"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-red-900 font-mono">
                  Are you sure you want to delete this course from Semester {activeSemester}?
                </h4>
                <p className="text-xs text-red-700 mt-1">
                  This will remove the course specifications, credit assignments, and timetable mappings for this course in the current semester workspace.
                </p>
              </div>
            </div>

            <div className="card p-3 bg-[var(--parchment-2)] border border-[var(--rule)] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[var(--slate)]">Course Code:</span>
                <span className="font-mono font-bold text-[var(--ink)] bg-white px-2 py-0.5 rounded border border-[var(--rule)]">
                  {deleteTarget.code}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[var(--slate)]">Course Title:</span>
                <span className="font-bold text-[var(--ink)]">{deleteTarget.name || deleteTarget.title}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[var(--slate)]">Type / Credits:</span>
                <span className="font-mono text-[var(--ink)]">{deleteTarget.type} • {deleteTarget.credits} Credits</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--rule)]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn-ghost border border-[var(--rule)] px-4 py-2 rounded text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 rounded text-xs font-mono font-bold bg-red-700 hover:bg-red-800 text-white cursor-pointer transition-colors shadow-sm"
              >
                Confirm Delete Course
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title={`Confirm Bulk Deletion (${selectedIds.length} Courses)`}
        tag="BULK DELETION"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-red-900 font-mono">
                Are you sure you want to delete {selectedIds.length} selected course(s) from Semester {activeSemester}?
              </h4>
              <p className="text-xs text-red-700 mt-1">
                This operation is irreversible. All selected subjects will be permanently removed from this semester workspace.
              </p>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto border border-[var(--rule)] rounded-lg divide-y divide-[var(--rule)] text-xs">
            {courses
              .filter(c => selectedIds.includes(c.id || c.code))
              .map((c, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between bg-white hover:bg-[var(--parchment-2)]">
                  <span className="font-mono font-bold text-[var(--ink)]">{c.code}</span>
                  <span className="text-[var(--ink)] truncate max-w-xs">{c.name || c.title}</span>
                  <span className="font-mono text-[var(--slate)]">{c.credits} Cr</span>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--rule)]">
            <button
              type="button"
              onClick={() => setBulkDeleteOpen(false)}
              className="btn-ghost border border-[var(--rule)] px-4 py-2 rounded text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmBulkDelete}
              className="px-4 py-2 rounded text-xs font-mono font-bold bg-red-700 hover:bg-red-800 text-white cursor-pointer transition-colors"
            >
              Delete {selectedIds.length} Selected Courses
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Preview Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title={`Import Course Specifications Preview — ${importAnalysis?.fileName || 'Spreadsheet'}`}
        tag="INGESTION PREVIEW"
        maxWidth="max-w-4xl"
      >
        {importAnalysis && (
          <div className="space-y-4">
            {/* Analysis Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="card p-2.5 bg-[var(--parchment-2)] border border-[var(--rule)]">
                <div className="text-[10px] font-mono text-[var(--slate)] uppercase font-semibold">Total Rows</div>
                <div className="font-display font-bold text-lg text-[var(--ink)]">
                  {importAnalysis.stats.totalRows}
                </div>
              </div>

              <div className="card p-2.5 bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-mono text-emerald-800 uppercase font-semibold">Ready to Import</div>
                <div className="font-display font-bold text-lg text-emerald-900">
                  {importAnalysis.stats.readyCount}
                </div>
              </div>

              <div className="card p-2.5 bg-amber-50 border border-amber-200">
                <div className="text-[10px] font-mono text-amber-800 uppercase font-semibold">Warnings / Duplicates</div>
                <div className="font-display font-bold text-lg text-amber-900">
                  {importAnalysis.stats.warningCount}
                </div>
              </div>

              <div className="card p-2.5 bg-red-50 border border-red-200">
                <div className="text-[10px] font-mono text-red-800 uppercase font-semibold">Errors / Missing Fields</div>
                <div className="font-display font-bold text-lg text-red-900">
                  {importAnalysis.stats.errorCount}
                </div>
              </div>
            </div>

            {/* Column Mapping Details */}
            <div className="card p-3 bg-[var(--parchment-2)] border border-[var(--rule)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--brass-2)]" />
                  Detected Field Mappings:
                </span>
                <span className="text-[10px] font-mono text-[var(--slate)]">
                  {importAnalysis.mappedFields.length} of {SYSTEM_FIELDS.length} internal fields mapped
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {SYSTEM_FIELDS.map(f => {
                  const detected = importAnalysis.detectedHeaders[f.key];
                  return (
                    <div
                      key={f.key}
                      className={`p-1.5 rounded border text-[11px] font-mono flex items-center justify-between ${
                        detected
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                          : f.required
                          ? 'bg-red-50 border-red-300 text-red-900'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="font-semibold">{f.label}:</span>
                      <span className="truncate max-w-[110px] font-bold">
                        {detected ? `"${detected}"` : f.required ? 'MISSING *' : 'Defaulted'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Unknown Columns notice */}
              {importAnalysis.unknownHeaders.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[var(--rule)] text-[11px] text-[var(--slate)] font-mono flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[var(--ink)]">Extra Columns Detected:</span>
                  {importAnalysis.unknownHeaders.map((u, i) => (
                    <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-[var(--rule)] text-[10px]">
                      "{u.header}"
                    </span>
                  ))}
                  <span className="text-[10px] text-emerald-700 font-semibold">(Non-fatal — safe to import)</span>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[var(--rule)] pb-2">
              <div className="flex items-center gap-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setImportFilter('all')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    importFilter === 'all'
                      ? 'bg-[var(--ink)] text-[var(--parchment)] font-bold'
                      : 'bg-[var(--parchment-2)] hover:bg-[var(--parchment-3)] text-[var(--ink)]'
                  }`}
                >
                  All Rows ({importAnalysis.stats.totalRows})
                </button>
                <button
                  type="button"
                  onClick={() => setImportFilter('ready')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    importFilter === 'ready'
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Ready ({importAnalysis.stats.readyCount})
                </button>
                <button
                  type="button"
                  onClick={() => setImportFilter('warning')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    importFilter === 'warning'
                      ? 'bg-amber-700 text-white font-bold'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Warnings ({importAnalysis.stats.warningCount})
                </button>
                {importAnalysis.stats.errorCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setImportFilter('error')}
                    className={`px-3 py-1 rounded cursor-pointer ${
                      importFilter === 'error'
                        ? 'bg-red-700 text-white font-bold'
                        : 'bg-red-50 text-red-800 hover:bg-red-100'
                    }`}
                  >
                    Errors ({importAnalysis.stats.errorCount})
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importOptions.overwriteDuplicates}
                    onChange={(e) => setImportOptions({ ...importOptions, overwriteDuplicates: e.target.checked, replaceMode: e.target.checked ? false : importOptions.replaceMode })}
                    className="rounded border-[var(--rule)]"
                  />
                  <span>Update existing courses (Merge Mode)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-red-700 font-bold">
                  <input
                    type="checkbox"
                    checked={importOptions.replaceMode}
                    onChange={(e) => setImportOptions({ ...importOptions, replaceMode: e.target.checked, overwriteDuplicates: e.target.checked ? false : importOptions.overwriteDuplicates })}
                    className="rounded border-red-300"
                  />
                  <span>Replace Existing Semester Courses (Safe Replace Mode)</span>
                </label>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border border-[var(--rule)] rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              <table className="ledger w-full text-xs">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th style={{ width: '150px' }}>Status</th>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Type</th>
                    <th>Credits</th>
                    <th>Faculty</th>
                    <th>Slot</th>
                    <th>Issues / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-6 text-[var(--slate)] font-mono">
                        No rows matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    previewRows.map((r, idx) => {
                      let statusBadge = <Badge variant="pass">Ready to Import</Badge>;
                      if (r.status === 'error') {
                        statusBadge = <Badge variant="fail">Missing Required Field</Badge>;
                        if (r.isFileDuplicate) {
                          statusBadge = <Badge variant="fail">Duplicate Course Code</Badge>;
                        }
                      } else if (r.status === 'warning') {
                        if (r.isExistingDuplicate) {
                          statusBadge = <Badge variant="amber">Duplicate Course Code</Badge>;
                        } else {
                          statusBadge = <Badge variant="amber">Mapped</Badge>;
                        }
                      }

                      return (
                        <tr
                          key={idx}
                          className={
                            r.status === 'error'
                              ? 'bg-red-50/50'
                              : r.status === 'warning'
                              ? 'bg-amber-50/30'
                              : ''
                          }
                        >
                          <td className="font-mono text-[10px] text-[var(--slate)]">{r.rowIndex}</td>
                          <td>{statusBadge}</td>
                          <td className="font-mono font-bold">{r.courseCode || <span className="text-red-500 italic">None</span>}</td>
                          <td className="font-semibold">{r.courseTitle || <span className="text-red-500 italic">None</span>}</td>
                          <td><span className="badge b-ink text-[10px]">{r.courseType}</span></td>
                          <td className="font-mono font-bold">{r.credits} Cr</td>
                          <td className="font-mono text-[11px]">{getFacultyName(r.assignedFaculty)}</td>
                          <td className="font-mono text-[11px]">{r.classroomSlot}</td>
                          <td className="text-[11px] font-mono">
                            {r.errors.length > 0 && (
                              <span className="text-red-600 font-bold">{r.errors.join(' ')}</span>
                            )}
                            {r.warnings.length > 0 && (
                              <span className="text-amber-700">{r.warnings.join(' ')}</span>
                            )}
                            {r.errors.length === 0 && r.warnings.length === 0 && (
                              <span className="text-emerald-600">✓ Valid Record</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

             {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--rule)] flex-wrap">
              <div className="text-xs font-mono text-[var(--slate)] space-y-1">
                <div>
                  <span className="font-bold text-[var(--ink)]">Target workspace:</span> BCA Semester {activeSemester} ({activeWorkspace?.term || '2025–26 ODD'})
                </div>
                <div>
                  <span className="font-bold text-[var(--ink)]">File:</span> {importAnalysis.fileName}
                </div>
                <div>
                  <span className="font-bold text-[var(--ink)]">Valid rows:</span> {importAnalysis.stats.validCount} | <span className="font-bold text-[var(--ink)]">Invalid rows:</span> {importAnalysis.stats.errorCount}
                </div>
                <div className="text-amber-800 font-bold">
                  Action: Import valid rows into Semester {activeSemester} ({importOptions.replaceMode ? "Replace Mode" : "Merge Mode"})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="btn-ghost border border-[var(--rule)] px-4 py-2 rounded text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importAnalysis.stats.validCount === 0}
                  onClick={handleConfirmImport}
                  className={`px-5 py-2 rounded text-xs font-mono font-bold cursor-pointer flex items-center gap-1.5 ${
                    importAnalysis.stats.validCount > 0
                      ? 'btn-ink shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>Import valid rows into Semester {activeSemester} →</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

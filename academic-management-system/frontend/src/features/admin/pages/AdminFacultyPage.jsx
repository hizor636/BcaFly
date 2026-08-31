import React, { useState, useEffect, useMemo } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Layers,
  Award,
  Clock,
  Users,
  UserPlus
} from 'lucide-react';
import apiService from '../../../services/apiService';
import * as XLSX from 'xlsx';

export const AdminFacultyPage = () => {
  const {
    activeSemester,
    activeWorkspace,
    faculty,
    assignFacultyCourse,
    updateFacultyCourseAssignment,
    removeFacultyCourseAssignment,
    importFacultyAssignments,
    logAction
  } = useAcademic();

  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'available'
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Form State for Assign Faculty
  const [assignFormData, setAssignFormData] = useState({
    facultyId: '',
    courseCode: '',
    weeklyTeachingCredits: 4,
    assignedRole: 'PRIMARY'
  });

  // Edit Assignment Form State
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    facultyId: '',
    courseCode: '',
    weeklyTeachingCredits: 4,
    assignedRole: 'PRIMARY'
  });

  // Target for Removal
  const [removingTarget, setRemovingTarget] = useState(null);

  // Import State
  const [importAnalysis, setImportAnalysis] = useState(null);
  const [importFilter, setImportFilter] = useState('all');
  const [importMode, setImportMode] = useState('merge');
  const [importSuccessMsg, setImportSuccessMsg] = useState(null);
  const [isIngesting, setIsIngesting] = useState(false);

  const courses = activeWorkspace?.courses || [];

  // Reset file selection when active semester switches
  useEffect(() => {
    if (importAnalysis) {
      setImportAnalysis(null);
      setImportModalOpen(false);
      alert("Active semester changed. Please select the faculty allocation document again for the new target workspace.");
    }
  }, [activeSemester]);

  // Compute workload and assigned courses strictly for the active semester
  const facultyWithWorkload = useMemo(() => {
    return faculty.map(f => {
      const assigned = courses.filter(c => c.facultyId === f.id || c.facultyId === f.facultyCode);
      const totalCredits = assigned.reduce((sum, c) => sum + (Number(c.weeklyTeachingCredits || c.credits) || 4), 0);

      return {
        ...f,
        assignedCourses: assigned,
        courseCount: assigned.length,
        totalCredits
      };
    });
  }, [faculty, courses]);

  // Split into Assigned vs Available Faculty
  const assignedFaculty = useMemo(() => facultyWithWorkload.filter(f => f.courseCount > 0), [facultyWithWorkload]);
  const availableFaculty = useMemo(() => facultyWithWorkload.filter(f => f.courseCount === 0), [facultyWithWorkload]);

  // Metrics Bar computation
  const totalAssignedFaculty = assignedFaculty.length;
  const totalAllocations = useMemo(() => courses.filter(c => c.facultyId).length, [courses]);
  const totalWeeklyCredits = useMemo(() => assignedFaculty.reduce((sum, f) => sum + f.totalCredits, 0), [assignedFaculty]);
  const labInchargesCount = useMemo(() => courses.filter(c => c.assignedRole === 'LAB_INCHARGE' || (c.type && c.type.toLowerCase().includes('lab'))).length, [courses]);

  const filteredAssignedFaculty = useMemo(() => {
    return assignedFaculty.filter(f => {
      if (deptFilter !== 'ALL' && f.dept !== deptFilter && f.department !== deptFilter) return false;
      const term = search.toLowerCase();
      if (search && !f.name.toLowerCase().includes(term) && !f.id.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [assignedFaculty, deptFilter, search]);

  const filteredAvailableFaculty = useMemo(() => {
    return availableFaculty.filter(f => {
      if (deptFilter !== 'ALL' && f.dept !== deptFilter && f.department !== deptFilter) return false;
      const term = search.toLowerCase();
      if (search && !f.name.toLowerCase().includes(term) && !f.id.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [availableFaculty, deptFilter, search]);

  // Open Assign Modal
  const handleOpenAssign = (preselectedFacultyId = '') => {
    if (!activeSemester) {
      alert("Select a semester before assigning faculty.");
      return;
    }
    const defaultCourse = courses.length > 0 ? courses[0].code : '';
    const defaultCredits = courses.length > 0 ? (Number(courses[0].credits) || 4) : 4;

    setAssignFormData({
      facultyId: preselectedFacultyId || (faculty.length > 0 ? faculty[0].id : ''),
      courseCode: defaultCourse,
      weeklyTeachingCredits: defaultCredits,
      assignedRole: 'PRIMARY'
    });
    setAssignModalOpen(true);
  };

  // Submit Assign with Duplicate Prevention
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignFormData.facultyId || !assignFormData.courseCode) return;

    // Check duplicate assignment
    const matchedFaculty = faculty.find(f => f.id === assignFormData.facultyId);
    const facultyCode = matchedFaculty?.facultyCode || assignFormData.facultyId;

    const alreadyAssigned = courses.some(
      (c) =>
        c.code === assignFormData.courseCode &&
        (c.facultyId === assignFormData.facultyId || c.facultyId === facultyCode)
    );

    if (alreadyAssigned) {
      alert("This faculty member is already assigned to this course for this semester.");
      return;
    }

    const matchedCourse = courses.find(c => c.code === assignFormData.courseCode);
    const payload = {
      facultyId: assignFormData.facultyId,
      courseId: matchedCourse ? matchedCourse.id : assignFormData.courseCode,
      courseCode: assignFormData.courseCode,
      weeklyTeachingCredits: Number(assignFormData.weeklyTeachingCredits) || 4,
      assignedRole: assignFormData.assignedRole,
      semesterId: activeSemester,
      academicYearId: activeWorkspace?.term || '2024-25-even'
    };

    try {
      await apiService.admin.assignFacultyCourse(payload);
    } catch (err) {
      console.warn("Backend API not reachable, updating local context state:", err);
    }

    assignFacultyCourse(activeSemester, payload);
    setAssignModalOpen(false);
    setImportSuccessMsg(`✓ Assigned course ${assignFormData.courseCode} to faculty in Semester ${activeSemester}.`);
    setActiveTab('assigned');
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  // Open Edit Modal
  const handleOpenEdit = (fac, course) => {
    setEditingAssignment({ faculty: fac, course });
    setEditFormData({
      facultyId: fac.id,
      courseCode: course.code,
      weeklyTeachingCredits: Number(course.weeklyTeachingCredits || course.credits) || 4,
      assignedRole: course.assignedRole || 'PRIMARY'
    });
    setEditModalOpen(true);
  };

  // Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAssignment) return;

    const payload = {
      facultyId: editFormData.facultyId,
      courseCode: editFormData.courseCode,
      weeklyTeachingCredits: Number(editFormData.weeklyTeachingCredits) || 4,
      assignedRole: editFormData.assignedRole,
      semesterId: activeSemester,
      academicYearId: activeWorkspace?.term || '2024-25-even'
    };

    const targetCourse = editingAssignment.course;
    try {
      await apiService.admin.updateFacultyAssignment(targetCourse.id || targetCourse.code, payload);
    } catch (err) {
      console.warn("Backend API not reachable, updating local context state:", err);
    }

    updateFacultyCourseAssignment(activeSemester, targetCourse.id || targetCourse.code, payload);
    setEditModalOpen(false);
    setEditingAssignment(null);
    setImportSuccessMsg(`✓ Updated assignment for ${editFormData.courseCode} in Semester ${activeSemester}.`);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  // Open Remove Modal
  const handleOpenRemove = (fac, course) => {
    setRemovingTarget({ faculty: fac, course });
    setRemoveModalOpen(true);
  };

  // Confirm Remove
  const handleConfirmRemove = async () => {
    if (!removingTarget) return;
    const targetCourse = removingTarget.course;

    try {
      await apiService.admin.deleteFacultyAssignment(targetCourse.id || targetCourse.code, activeSemester, activeWorkspace?.term || '2024-25-even');
    } catch (err) {
      console.warn("Backend API not reachable, removing from local context state:", err);
    }

    removeFacultyCourseAssignment(activeSemester, targetCourse.id || targetCourse.code, targetCourse.code);
    setRemoveModalOpen(false);
    setRemovingTarget(null);
    setImportSuccessMsg(`✓ Removed course allocation for ${targetCourse.code} from Semester ${activeSemester}.`);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  // Handle File Selection and Parsing
  const handleFileSelect = async (file) => {
    if (!activeSemester) {
      alert("Select a semester before uploading faculty allocation document.");
      return;
    }

    const allowedExtensions = ['.csv', '.xlsx', '.xls', '.pdf'];
    const ext = `.${file.name.split('.').pop().toLowerCase()}`;

    if (!allowedExtensions.includes(ext)) {
      alert("Upload a CSV, XLSX, XLS, or PDF document.");
      return;
    }

    setIsIngesting(true);
    setImportSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('semesterId', String(activeSemester));
      formData.append('academicYearId', activeWorkspace?.term || '2024-25-even');

      let analysis;
      try {
        const res = await apiService.admin.previewImportFaculty(formData);
        if (res && res.success) {
          analysis = {
            uploadId: res.uploadId,
            fileName: file.name,
            fileSize: file.size,
            stats: res.stats,
            rows: res.rows,
            isBackend: true
          };
        }
      } catch (apiErr) {
        console.warn("Backend preview failed, parsing client-side:", apiErr);
        analysis = await parseFileClientSide(file);
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

  // Client-side parser fallback
  const parseFileClientSide = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (jsonRows.length === 0) {
      throw new Error("Uploaded document is empty.");
    }

    const validSemesterCourses = new Set(courses.map(c => c.code.toUpperCase()));
    const parsedRows = [];
    const seenPairs = new Set();
    let readyCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let newCount = 0;
    let updateCount = 0;

    jsonRows.forEach((row, i) => {
      const keys = Object.keys(row);
      const facIdKey = keys.find(k => /fac.*id|fac.*code/i.test(k));
      const facNameKey = keys.find(k => /name|instructor/i.test(k));
      const cCodeKey = keys.find(k => /course.*code|subject.*code|code/i.test(k));
      const creditsKey = keys.find(k => /credit|hour/i.test(k));
      const roleKey = keys.find(k => /role/i.test(k));
      const deptKey = keys.find(k => /dept/i.test(k));
      const emailKey = keys.find(k => /email/i.test(k));

      const rawFacId = facIdKey ? String(row[facIdKey]).trim().toUpperCase() : 'FAC01';
      const rawFacName = facNameKey ? String(row[facNameKey]).trim() : 'Instructor';
      const rawCCode = cCodeKey ? String(row[cCodeKey]).trim().toUpperCase() : '';
      const rawCredits = creditsKey && !isNaN(row[creditsKey]) ? Number(row[creditsKey]) : 4;
      const rawRole = roleKey ? String(row[roleKey]).trim().toUpperCase() : 'PRIMARY';

      const errors = [];
      const warnings = [];

      if (!rawCCode) errors.push("Course code is missing.");
      if (!rawFacId) errors.push("Faculty ID is missing.");

      if (rawCCode && validSemesterCourses.size > 0 && !validSemesterCourses.has(rawCCode)) {
        errors.push(`Course ${rawCCode} does not belong to Semester ${activeSemester}.`);
      }

      const pairKey = `${rawFacId}::${rawCCode}`;
      if (seenPairs.has(pairKey)) {
        errors.push(`Duplicate allocation for ${rawFacId} and ${rawCCode} in file.`);
      } else {
        seenPairs.add(pairKey);
      }

      const existingInSem = courses.some(c => c.code.toUpperCase() === rawCCode && (c.facultyId === rawFacId));
      if (existingInSem) {
        warnings.push(`Allocation already exists in Semester ${activeSemester}. Will update credits.`);
        updateCount++;
      } else {
        newCount++;
      }

      let status = 'ready';
      if (errors.length > 0) {
        status = 'error';
        errorCount++;
      } else if (warnings.length > 0) {
        status = 'warning';
        warningCount++;
        readyCount++;
      } else {
        readyCount++;
      }

      parsedRows.push({
        rowIndex: i + 1,
        facultyCode: rawFacId,
        facultyName: rawFacName,
        courseCode: rawCCode,
        weeklyTeachingCredits: rawCredits,
        assignedRole: rawRole,
        department: deptKey ? row[deptKey] : 'BCA',
        email: emailKey ? row[emailKey] : '',
        status,
        errors,
        warnings
      });
    });

    return {
      uploadId: 'FAC-UP-' + Date.now(),
      fileName: file.name,
      fileSize: file.size,
      stats: {
        totalRows: jsonRows.length,
        validCount: readyCount,
        warningCount,
        errorCount,
        newCount,
        updateCount
      },
      rows: parsedRows,
      isBackend: false
    };
  };

  // Confirm Import Handler
  const handleConfirmImport = async () => {
    if (!importAnalysis || !importAnalysis.rows) return;

    const validRows = importAnalysis.rows.filter(r => r.status !== 'error');
    if (validRows.length === 0) {
      alert("No valid rows available to import.");
      return;
    }

    const confirmMsg = `Import ${validRows.length} faculty course allocations into Semester ${activeSemester} (${importMode === 'replace-semester' ? 'Replace Mode' : importMode === 'add-only' ? 'Add-Only Mode' : 'Merge Mode'})?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (importAnalysis.isBackend) {
        await apiService.admin.confirmImportFaculty({
          uploadId: importAnalysis.uploadId,
          semesterId: activeSemester,
          academicYearId: activeWorkspace?.term || '2024-25-even',
          mode: importMode
        });
      }
    } catch (apiErr) {
      console.warn("Backend confirmation failed, saving to local context state:", apiErr);
    }

    importFacultyAssignments(activeSemester, validRows, { mode: importMode });

    setImportSuccessMsg(`✓ Successfully imported ${validRows.length} faculty course allocations into Semester ${activeSemester}.`);
    setImportModalOpen(false);
    setImportAnalysis(null);
    setActiveTab('assigned');
    setTimeout(() => setImportSuccessMsg(null), 5000);
  };

  const previewRows = useMemo(() => {
    if (!importAnalysis || !importAnalysis.rows) return [];
    if (importFilter === 'all') return importAnalysis.rows;
    if (importFilter === 'ready') return importAnalysis.rows.filter(r => r.status === 'ready');
    if (importFilter === 'warning') return importAnalysis.rows.filter(r => r.status === 'warning');
    if (importFilter === 'error') return importAnalysis.rows.filter(r => r.status === 'error');
    return importAnalysis.rows;
  }, [importAnalysis, importFilter]);

  const headers = ['Faculty ID', 'Faculty Name', 'Designation', 'Assigned Courses (Sem ' + activeSemester + ')', 'Weekly Credits', 'Contact Email'];
  const exportRows = assignedFaculty.map(f => [
    f.id,
    f.name,
    f.role || f.designation,
    f.assignedCourses.map(c => c.code).join(', ') || 'None',
    `${f.totalCredits} Credits/wk`,
    f.email
  ]);

  return (
    <div className="space-y-6">
      {/* Header with New Consolidated Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>👨‍🏫</span> FACULTY &amp; COURSE ALLOCATIONS
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Assigned Faculty for Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Semester course allocations, weekly teaching credits, and departmental instructors ({activeWorkspace?.batch || '2024–27'}).
          </p>
        </div>

        {/* Toolbar: [ Assign Faculty ]  [ Export ▼ ] */}
        <div className="flex gap-2 items-center flex-wrap">
          <button
            disabled={!activeSemester}
            onClick={() => handleOpenAssign()}
            className={`text-xs font-mono px-4 py-1.5 rounded flex items-center gap-1.5 font-bold shadow-xs cursor-pointer ${
              activeSemester ? 'btn-brass' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Faculty</span>
          </button>

          <ExportToolbar
            filename={`bca_sem${activeSemester}_faculty`}
            title={`Faculty Allocation — Semester ${activeSemester}`}
            subtitle={`Department of Computer Applications — ${activeWorkspace?.term || '2024–25 EVEN'}`}
            headers={headers}
            rows={exportRows}
          />
        </div>
      </div>

      {importSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importSuccessMsg}</span>
          </div>
          <button onClick={() => setImportSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950 font-bold p-1">✕</button>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--brass-soft)] border border-[var(--brass)] flex items-center justify-center text-[var(--ink)] font-bold text-sm">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Assigned Faculty</div>
            <div className="font-display font-bold text-lg text-[var(--ink)]">{totalAssignedFaculty}</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 font-bold text-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Course Allocations</div>
            <div className="font-display font-bold text-lg text-blue-900">{totalAllocations}</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Weekly Credits</div>
            <div className="font-display font-bold text-lg text-emerald-900">{totalWeeklyCredits} hrs</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-800 font-bold text-sm">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Lab Incharges</div>
            <div className="font-display font-bold text-lg text-purple-900">{labInchargesCount}</div>
          </div>
        </div>
      </div>

      {/* Single Document Upload Flow */}
      <section className="card p-5 bg-white border border-[var(--rule)] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 className="font-display font-bold text-base text-[var(--ink)]">
              Faculty Allocation Import
            </h4>
            <p className="text-xs text-[var(--slate)] font-mono">
              Upload one CSV, Excel, or PDF allocation document for the selected semester.
            </p>
          </div>

          <div>
            <input
              id="faculty-allocation-document"
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              className="hidden"
              disabled={!activeSemester}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
            <label
              htmlFor="faculty-allocation-document"
              className={`px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ${
                activeSemester ? 'btn-brass' : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              <span>Select Document 📂</span>
            </label>
          </div>
        </div>
      </section>

      {/* Section Switcher Tabs */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3 flex-wrap gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'assigned'
                  ? 'bg-[var(--ink)] text-[var(--parchment)] shadow-2xs'
                  : 'bg-[var(--parchment-2)] hover:bg-[var(--parchment-3)] text-[var(--slate)]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assigned Faculty (Sem {activeSemester})</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {assignedFaculty.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('available')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'available'
                  ? 'bg-[var(--ink)] text-[var(--parchment)] shadow-2xs'
                  : 'bg-[var(--parchment-2)] hover:bg-[var(--parchment-3)] text-[var(--slate)]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Available Faculty Registry</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {availableFaculty.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field-input text-xs py-1 w-48 font-mono"
            />
          </div>
        </div>

        {/* Tab 1: Assigned Faculty */}
        {activeTab === 'assigned' && (
          <div>
            {assignedFaculty.length === 0 ? (
              /* Exact Requested Empty State */
              <div className="p-12 text-center border-2 border-dashed border-[var(--rule)] rounded-xl bg-[var(--parchment-2)]/50 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--parchment-3)] flex items-center justify-center text-xl text-[var(--slate)]">
                  👨‍🏫
                </div>
                <h4 className="font-display font-bold text-base text-[var(--ink)]">
                  No faculty assigned yet.
                </h4>
                <p className="text-xs text-[var(--slate)] max-w-md mx-auto font-mono leading-relaxed">
                  There are currently no faculty-course allocations for this semester.
                  Use “Assign Faculty” to add an allocation or “Select Document” to import one.
                </p>
                <div className="pt-2 flex justify-center items-center gap-3 flex-wrap font-mono">
                  <button
                    disabled={!activeSemester}
                    onClick={() => handleOpenAssign()}
                    className="btn-brass px-4 py-2 rounded text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Faculty</span>
                  </button>
                  <label
                    htmlFor="faculty-allocation-document"
                    className="px-4 py-2 rounded text-xs font-bold bg-white border border-[var(--rule)] hover:bg-[var(--parchment-2)] text-[var(--ink)] shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Select Document 📂</span>
                  </label>
                </div>
              </div>
            ) : (
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
                        <div className="text-[10px] text-[var(--slate)]">{f.role || f.designation}</div>
                      </div>
                    )
                  },
                  { header: 'Department', accessor: 'dept' },
                  {
                    header: `Assigned Courses (Sem ${activeSemester})`,
                    accessor: 'assignedCourses',
                    render: (f) => (
                      <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                        {f.assignedCourses.map((c, i) => (
                          <div key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[var(--parchment-2)] border border-[var(--rule)] rounded font-bold text-[var(--ink)] text-xs">
                            <span>{c.code}</span>
                            <span className="text-[10px] text-[var(--slate)] font-normal">({c.weeklyTeachingCredits || c.credits}cr)</span>
                            <button
                              onClick={() => handleOpenEdit(f, c)}
                              className="text-[var(--slate)] hover:text-[var(--ink)] cursor-pointer"
                              title="Edit Assignment"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleOpenRemove(f, c)}
                              className="text-[var(--slate)] hover:text-red-600 cursor-pointer"
                              title="Remove Assignment"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  },
                  {
                    header: 'Teaching Load',
                    accessor: 'totalCredits',
                    render: (f) => (
                      <span className="font-mono font-bold text-xs text-emerald-800">
                        {f.totalCredits} Credits/wk
                      </span>
                    )
                  },
                  {
                    header: 'Contact Email',
                    accessor: 'email',
                    render: (f) => (
                      <div className="font-mono text-[11px] text-[var(--slate)]">
                        <div>{f.email}</div>
                        <div className="text-[10px]">{f.phone}</div>
                      </div>
                    )
                  },
                  {
                    header: 'Actions',
                    accessor: 'actions',
                    render: (f) => (
                      <button
                        onClick={() => handleOpenAssign(f.id)}
                        className="px-2.5 py-1 bg-white hover:bg-[var(--parchment-2)] border border-[var(--rule)] rounded font-mono text-[11px] font-bold text-[var(--ink)] flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Assign Another Course"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Assign</span>
                      </button>
                    )
                  }
                ]}
                data={filteredAssignedFaculty}
              />
            )}
          </div>
        )}

        {/* Tab 2: Available Faculty Registry */}
        {activeTab === 'available' && (
          <div className="space-y-3">
            <div className="p-3 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg font-mono text-xs text-[var(--slate)] flex justify-between items-center">
              <span>These faculty profiles are registered in the master directory but currently have no course assignments in <strong>Semester {activeSemester}</strong>.</span>
              <span className="badge b-ink">{filteredAvailableFaculty.length} Available</span>
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
                      <div className="text-[10px] text-[var(--slate)]">{f.role || f.designation}</div>
                    </div>
                  )
                },
                { header: 'Department', accessor: 'dept' },
                {
                  header: 'Status in Semester ' + activeSemester,
                  accessor: 'status',
                  render: () => (
                    <span className="text-[var(--slate)] italic text-xs font-mono">
                      Available for Assignment
                    </span>
                  )
                },
                {
                  header: 'Contact Email',
                  accessor: 'email',
                  render: (f) => (
                    <div className="font-mono text-[11px] text-[var(--slate)]">
                      <div>{f.email}</div>
                      <div className="text-[10px]">{f.phone}</div>
                    </div>
                  )
                },
                {
                  header: 'Actions',
                  accessor: 'actions',
                  render: (f) => (
                    <button
                      onClick={() => handleOpenAssign(f.id)}
                      className="btn-brass px-3 py-1 rounded font-mono text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Assign Course"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Assign Course</span>
                    </button>
                  )
                }
              ]}
              data={filteredAvailableFaculty}
            />
          </div>
        )}
      </div>

      {/* Assign Faculty Modal */}
      {assignModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Course Allocation — Semester ${activeSemester}`}
        >
          <form onSubmit={handleAssign} className="space-y-4 font-sans text-xs">
            <div className="p-2.5 bg-[var(--parchment-2)] border border-[var(--rule)] rounded font-mono text-[11px]">
              <span className="font-bold text-[var(--ink)]">Target workspace:</span> BCA Semester {activeSemester} — {activeWorkspace?.term || '2024–25 EVEN'}
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Select Faculty Member *:</label>
              <select
                required
                value={assignFormData.facultyId}
                onChange={(e) => setAssignFormData({ ...assignFormData, facultyId: e.target.value })}
                className="field-input text-xs font-mono"
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.id}) — {f.role || f.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Select Course in Semester {activeSemester} *:</label>
              {courses.length === 0 ? (
                <div className="text-red-600 font-mono text-xs">No courses registered in Semester {activeSemester}. Please add courses first.</div>
              ) : (
                <select
                  required
                  value={assignFormData.courseCode}
                  onChange={(e) => {
                    const selCourse = courses.find(c => c.code === e.target.value);
                    setAssignFormData({
                      ...assignFormData,
                      courseCode: e.target.value,
                      weeklyTeachingCredits: selCourse ? (Number(selCourse.credits) || 4) : 4
                    });
                  }}
                  className="field-input text-xs font-mono"
                >
                  {courses.map(c => (
                    <option key={c.id || c.code} value={c.code}>
                      {c.code} — {c.name || c.title} ({c.credits} Credits, {c.type})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Weekly Teaching Credits:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={assignFormData.weeklyTeachingCredits}
                  onChange={(e) => setAssignFormData({ ...assignFormData, weeklyTeachingCredits: Number(e.target.value) })}
                  className="field-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Assignment Role:</label>
                <select
                  value={assignFormData.assignedRole}
                  onChange={(e) => setAssignFormData({ ...assignFormData, assignedRole: e.target.value })}
                  className="field-input text-xs font-mono"
                >
                  <option value="PRIMARY">PRIMARY</option>
                  <option value="CO_FACULTY">CO_FACULTY</option>
                  <option value="LAB_INCHARGE">LAB_INCHARGE</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={courses.length === 0}
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Assign Course →
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Assignment Modal */}
      {editModalOpen && editingAssignment && (
        <Modal
          isOpen={true}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Allocation — ${editFormData.courseCode}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 font-sans text-xs">
            <div className="p-2.5 bg-[var(--parchment-2)] border border-[var(--rule)] rounded font-mono text-[11px]">
              <span className="font-bold text-[var(--ink)]">Editing workspace:</span> BCA Semester {activeSemester} — {activeWorkspace?.term || '2024–25 EVEN'}
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Assigned Faculty Member:</label>
              <select
                value={editFormData.facultyId}
                onChange={(e) => setEditFormData({ ...editFormData, facultyId: e.target.value })}
                className="field-input text-xs font-mono"
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.id}) — {f.role || f.designation}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Weekly Teaching Credits:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={editFormData.weeklyTeachingCredits}
                  onChange={(e) => setEditFormData({ ...editFormData, weeklyTeachingCredits: Number(e.target.value) })}
                  className="field-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Assignment Role:</label>
                <select
                  value={editFormData.assignedRole}
                  onChange={(e) => setEditFormData({ ...editFormData, assignedRole: e.target.value })}
                  className="field-input text-xs font-mono"
                >
                  <option value="PRIMARY">PRIMARY</option>
                  <option value="CO_FACULTY">CO_FACULTY</option>
                  <option value="LAB_INCHARGE">LAB_INCHARGE</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Save Changes →
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Remove Allocation Modal */}
      {removeModalOpen && removingTarget && (
        <Modal
          isOpen={true}
          onClose={() => setRemoveModalOpen(false)}
          title="Remove Course Allocation"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 font-mono text-xs">
              <strong>⚠️ Semester-Scoped Action:</strong> Removing will only detach course <strong>{removingTarget.course.code}</strong> from faculty member <strong>{removingTarget.faculty.name}</strong> in <strong>Semester {activeSemester}</strong>. The faculty master profile and their assignments in other semesters will remain unchanged.
            </div>

            <p className="text-[var(--ink)]">
              Are you sure you want to remove the course allocation for <strong>{removingTarget.course.code}</strong> ({removingTarget.course.name || removingTarget.course.title})?
            </p>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setRemoveModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold shadow-xs cursor-pointer"
              >
                Confirm Remove Allocation
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Import Preview Modal */}
      {importModalOpen && importAnalysis && (
        <Modal
          isOpen={true}
          onClose={() => setImportModalOpen(false)}
          title={`Faculty Allocation Import — "${importAnalysis.fileName}"`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg font-mono text-xs flex justify-between items-center flex-wrap gap-2">
              <div>
                <span className="font-bold text-[var(--ink)]">Target workspace:</span> BCA Semester {activeSemester} — {activeWorkspace?.term || '2024–25 EVEN'}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-bold">✓ Valid: {importAnalysis.stats.validCount}</span>
                {importAnalysis.stats.warningCount > 0 && <span className="text-amber-700 font-bold">⚠️ Existing: {importAnalysis.stats.warningCount}</span>}
                {importAnalysis.stats.errorCount > 0 && <span className="text-red-700 font-bold">✕ Errors: {importAnalysis.stats.errorCount}</span>}
              </div>
            </div>

            {/* Filter Tabs & Mode Selector */}
            <div className="flex items-center justify-between gap-3 border-b border-[var(--rule)] pb-2 flex-wrap">
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
                  All ({importAnalysis.stats.totalRows})
                </button>
                <button
                  type="button"
                  onClick={() => setImportFilter('ready')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    importFilter === 'ready'
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  Ready ({importAnalysis.stats.validCount - importAnalysis.stats.warningCount})
                </button>
                {importAnalysis.stats.warningCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setImportFilter('warning')}
                    className={`px-3 py-1 rounded cursor-pointer ${
                      importFilter === 'warning'
                        ? 'bg-amber-700 text-white font-bold'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    Existing ({importAnalysis.stats.warningCount})
                  </button>
                )}
                {importAnalysis.stats.errorCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setImportFilter('error')}
                    className={`px-3 py-1 rounded cursor-pointer ${
                      importFilter === 'error'
                        ? 'bg-red-700 text-white font-bold'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    Errors ({importAnalysis.stats.errorCount})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={(e) => setImportMode(e.target.value)}
                  />
                  <span>Merge</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="add-only"
                    checked={importMode === 'add-only'}
                    onChange={(e) => setImportMode(e.target.value)}
                  />
                  <span>Add-Only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-red-700 font-bold">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace-semester"
                    checked={importMode === 'replace-semester'}
                    onChange={(e) => setImportMode(e.target.value)}
                  />
                  <span>Replace Semester</span>
                </label>
              </div>
            </div>

            {/* Preview Table */}
            <div className="max-h-60 overflow-y-auto border border-[var(--rule)] rounded-lg">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[var(--parchment-2)] border-b border-[var(--rule)] sticky top-0">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Faculty ID</th>
                    <th className="p-2">Faculty Name</th>
                    <th className="p-2">Course Code</th>
                    <th className="p-2">Credits/wk</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {previewRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-[var(--slate)] font-mono">
                        No rows in current filter.
                      </td>
                    </tr>
                  ) : (
                    previewRows.map((s, idx) => (
                      <tr
                        key={idx}
                        className={
                          s.status === 'error'
                            ? 'bg-red-50/50'
                            : s.status === 'warning'
                            ? 'bg-amber-50/30'
                            : 'hover:bg-[var(--parchment)]'
                        }
                      >
                        <td className="p-2 text-[10px] text-[var(--slate)]">{s.rowIndex}</td>
                        <td className="p-2">
                          {s.status === 'ready' && <Badge variant="pass">Ready</Badge>}
                          {s.status === 'warning' && <Badge variant="amber">Existing</Badge>}
                          {s.status === 'error' && <Badge variant="fail">Error</Badge>}
                        </td>
                        <td className="p-2 font-bold text-[var(--brass-2)]">{s.facultyCode}</td>
                        <td className="p-2 font-bold text-[var(--ink)]">{s.facultyName}</td>
                        <td className="p-2 font-bold text-[var(--ink)]">{s.courseCode}</td>
                        <td className="p-2">{s.weeklyTeachingCredits}</td>
                        <td className="p-2">{s.assignedRole}</td>
                        <td className="p-2 text-[11px]">
                          {s.errors && s.errors.length > 0 && (
                            <span className="text-red-600 font-bold">{s.errors.join(' ')}</span>
                          )}
                          {s.warnings && s.warnings.length > 0 && (
                            <span className="text-amber-700">{s.warnings.join(' ')}</span>
                          )}
                          {(!s.errors || s.errors.length === 0) && (!s.warnings || s.warnings.length === 0) && (
                            <span className="text-emerald-600">✓ Valid</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[var(--rule)] flex justify-between items-center flex-wrap gap-2 font-mono">
              <div className="text-xs text-[var(--slate)]">
                Ready to import <span className="font-bold text-[var(--ink)]">{importAnalysis.stats.validCount}</span> allocations into <span className="font-bold text-[var(--ink)]">Semester {activeSemester}</span> ({importMode}).
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-3 py-2 rounded text-xs text-[var(--slate)] hover:bg-[var(--parchment-2)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importAnalysis.stats.validCount === 0}
                  onClick={handleConfirmImport}
                  className={`px-4 py-2 rounded font-bold shadow-xs cursor-pointer flex items-center gap-1.5 ${
                    importAnalysis.stats.validCount > 0 ? 'btn-brass' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirm &amp; Allocate {importAnalysis.stats.validCount} Courses →
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { IngestionZone } from '../../../components/ui/IngestionZone';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { Edit2, Trash2, Plus, AlertCircle, CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet, GraduationCap, UserCheck, UserX, BookOpen } from 'lucide-react';
import apiService from '../../../services/apiService';
import * as XLSX from 'xlsx';

export const AdminStudentsPage = () => {
  const {
    activeSemester,
    activeWorkspace,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    logAction
  } = useAcademic();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');

  // Single Enrolment Form State
  const [formData, setFormData] = useState({
    name: '',
    reg: '',
    section: 'A',
    batch: activeWorkspace?.batch || '2024–27',
    attendance: 90,
    sgpa: 8.5,
    standing: 'PASS',
    email: '',
    phone: ''
  });

  // Edit Student State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    reg: '',
    section: 'A',
    batch: '2024–27',
    rollNumber: '',
    attendance: 90,
    sgpa: 8.5,
    standing: 'PASS',
    enrolmentStatus: 'ACTIVE'
  });

  // Delete Target State
  const [deletingStudent, setDeletingStudent] = useState(null);

  // Import State
  const [importAnalysis, setImportAnalysis] = useState(null);
  const [importFilter, setImportFilter] = useState('all');
  const [importMode, setImportMode] = useState('merge'); // 'merge' | 'add-only' | 'replace-semester'
  const [importSuccessMsg, setImportSuccessMsg] = useState(null);
  const [isIngesting, setIsIngesting] = useState(false);

  const students = activeWorkspace?.students || [];

  // Clear selected file and preview if active semester changes
  useEffect(() => {
    if (importAnalysis) {
      setImportAnalysis(null);
      setImportModalOpen(false);
      alert("Active semester changed. Please select the nominal roll file again for the new target workspace.");
    }
  }, [activeSemester]);

  // Compute metrics
  const activeStudentsCount = useMemo(() => students.filter(s => (s.status || s.enrolmentStatus || 'Active').toUpperCase() === 'ACTIVE').length, [students]);
  const secACount = useMemo(() => students.filter(s => s.section === 'A').length, [students]);
  const secBCount = useMemo(() => students.filter(s => s.section === 'B').length, [students]);
  const avgAttendance = useMemo(() => {
    if (students.length === 0) return 0;
    const sum = students.reduce((acc, s) => acc + (Number(s.attendance || s.attendancePercentage) || 0), 0);
    return (sum / students.length).toFixed(1);
  }, [students]);

  const filteredStudents = students.filter(s => {
    if (sectionFilter !== 'ALL' && s.section !== sectionFilter) return false;
    const term = search.toLowerCase();
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !(s.reg || s.usn || '').toLowerCase().includes(term)) return false;
    return true;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    if (!activeSemester) {
      alert("Select a semester before adding a student.");
      return;
    }
    setFormData({
      name: '',
      reg: '',
      section: 'A',
      batch: activeWorkspace?.batch || '2024–27',
      attendance: 90,
      sgpa: 8.5,
      standing: 'PASS',
      email: '',
      phone: ''
    });
    setModalOpen(true);
  };

  // Submit Create
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const payload = {
      ...formData,
      semesterId: activeSemester,
      academicYearId: activeWorkspace?.term || '2024-25-even'
    };

    try {
      await apiService.admin.enrolStudent(payload);
    } catch (err) {
      console.warn("Backend API not reachable, saving to local context state:", err);
    }

    addStudent(activeSemester, payload);
    setModalOpen(false);
    setImportSuccessMsg(`✓ Enrolled student ${formData.name} into Semester ${activeSemester}.`);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  // Open Edit Modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name || student.fullName || '',
      reg: student.reg || student.usn || '',
      section: student.section || 'A',
      batch: student.batch || activeWorkspace?.batch || '2024–27',
      rollNumber: student.rollNumber || '',
      attendance: Number(student.attendance || student.attendancePercentage) || 90,
      sgpa: Number(student.sgpa || student.currentSgpa) || 8.5,
      standing: student.standing || student.resultStatus || 'PASS',
      enrolmentStatus: (student.status || student.enrolmentStatus || 'ACTIVE').toUpperCase()
    });
    setEditModalOpen(true);
  };

  // Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    const targetId = editingStudent.id || editingStudent.reg || editingStudent.usn;
    const payload = {
      ...editFormData,
      semesterId: activeSemester,
      academicYearId: activeWorkspace?.term || '2024-25-even'
    };

    try {
      await apiService.admin.updateStudentEnrolment(targetId, payload);
    } catch (err) {
      console.warn("Backend API not reachable, updating local context state:", err);
    }

    updateStudent(activeSemester, targetId, {
      name: editFormData.name,
      section: editFormData.section,
      batch: editFormData.batch,
      rollNumber: editFormData.rollNumber,
      attendance: Number(editFormData.attendance),
      sgpa: Number(editFormData.sgpa),
      cgpa: Number(editFormData.sgpa),
      standing: editFormData.standing,
      resultStatus: editFormData.standing,
      status: editFormData.enrolmentStatus,
      enrolmentStatus: editFormData.enrolmentStatus
    });

    setEditModalOpen(false);
    setEditingStudent(null);
    setImportSuccessMsg(`✓ Updated enrolment for ${editFormData.name} in Semester ${activeSemester}.`);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  // Open Delete Modal
  const handleOpenDelete = (student) => {
    setDeletingStudent(student);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    const targetId = deletingStudent.id || deletingStudent.reg || deletingStudent.usn;

    try {
      await apiService.admin.deleteStudentEnrolment(targetId, activeSemester, activeWorkspace?.term || '2024-25-even');
    } catch (err) {
      console.warn("Backend API not reachable, dropping from local context state:", err);
    }

    deleteStudent(activeSemester, targetId);
    setDeleteModalOpen(false);
    setDeletingStudent(null);
    setImportSuccessMsg(`✓ Student enrolment removed from Semester ${activeSemester}.`);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  // File Upload and Parsing Handler
  const handleFileSelect = async (file) => {
    if (!activeSemester) {
      alert("Select a semester before uploading a document.");
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      alert("Please select a CSV, XLSX, or XLS document.");
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
        const res = await apiService.admin.previewImportStudents(formData);
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
        // Client-side fallback parsing
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

  // Client-side spreadsheet parser
  const parseFileClientSide = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (jsonRows.length === 0) {
      throw new Error("Uploaded file is empty or missing data rows.");
    }

    const parsedRows = [];
    const seenUsns = new Set();
    let readyCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let newCount = 0;
    let updateCount = 0;

    jsonRows.forEach((row, i) => {
      // Fuzzy header matching
      const keys = Object.keys(row);
      const usnKey = keys.find(k => /usn|reg|id/i.test(k));
      const nameKey = keys.find(k => /name/i.test(k));
      const secKey = keys.find(k => /sec/i.test(k));
      const batchKey = keys.find(k => /batch/i.test(k));
      const emailKey = keys.find(k => /email/i.test(k));
      const phoneKey = keys.find(k => /phone|mobile/i.test(k));
      const attKey = keys.find(k => /att/i.test(k));
      const sgpaKey = keys.find(k => /sgpa|cgpa/i.test(k));
      const standingKey = keys.find(k => /standing|result|status/i.test(k));

      const rawUsn = usnKey ? String(row[usnKey]).trim().toUpperCase() : `1BC24${String(100 + i).padStart(3, '0')}`;
      const rawName = nameKey ? String(row[nameKey]).trim() : '';
      const rawSec = secKey && row[secKey] ? String(row[secKey]).trim().toUpperCase() : 'A';
      const rawBatch = batchKey && row[batchKey] ? String(row[batchKey]).trim() : (activeWorkspace?.batch || '2024–27');
      const rawAtt = attKey && !isNaN(row[attKey]) ? Number(row[attKey]) : 90;
      const rawSgpa = sgpaKey && !isNaN(row[sgpaKey]) ? Number(row[sgpaKey]) : 8.5;
      const rawStanding = standingKey && row[standingKey] ? String(row[standingKey]).trim().toUpperCase() : 'PASS';

      const errors = [];
      const warnings = [];

      if (!rawName) errors.add ? errors.add("Student name is missing.") : errors.push("Student name is missing.");
      if (!rawUsn) errors.add ? errors.add("USN / Register number is missing.") : errors.push("USN / Register number is missing.");

      if (seenUsns.has(rawUsn)) {
        errors.push(`Duplicate USN "${rawUsn}" in file.`);
      } else {
        seenUsns.add(rawUsn);
      }

      // Check existing in local workspace students
      const existsInWorkspace = students.some(s => (s.reg || s.usn || '').toUpperCase() === rawUsn);
      if (existsInWorkspace) {
        warnings.push(`Student already enrolled in Semester (${rawUsn}).`);
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
        usn: rawUsn,
        reg: rawUsn,
        name: rawName,
        section: rawSec,
        batch: rawBatch,
        email: emailKey ? row[emailKey] : '',
        phone: phoneKey ? row[phoneKey] : '',
        attendance: rawAtt,
        sgpa: rawSgpa,
        standing: rawStanding,
        status,
        errors,
        warnings
      });
    });

    return {
      uploadId: 'STU-UP-' + Date.now(),
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

    const confirmMsg = `Import ${validRows.length} students into Semester ${activeSemester} (${importMode === 'replace-semester' ? 'Replace Mode' : importMode === 'add-only' ? 'Add-Only Mode' : 'Merge Mode'})?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (importAnalysis.isBackend) {
        await apiService.admin.confirmImportStudents({
          uploadId: importAnalysis.uploadId,
          semesterId: activeSemester,
          academicYearId: activeWorkspace?.term || '2024-25-even',
          mode: importMode
        });
      }
    } catch (apiErr) {
      console.warn("Backend confirmation failed, saving to local context state:", apiErr);
    }

    importStudents(activeSemester, validRows, { mode: importMode });

    setImportSuccessMsg(`✓ Successfully imported ${validRows.length} students into Semester ${activeSemester}.`);
    setImportModalOpen(false);
    setImportAnalysis(null);
    setTimeout(() => setImportSuccessMsg(null), 5000);
  };

  // Download Sample Template
  const downloadTemplate = async () => {
    try {
      const res = await apiService.admin.getImportTemplate(activeSemester);
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bcafly_semester_${activeSemester}_student_template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      const csvContent = "USN / Register Number,Student Name,Section,Batch,Email,Phone,Attendance Percentage,Current SGPA,Standing\n"
        + "1BC24001,Aakash Sharma,A,2024–27,aakash@example.com,9876543210,92.5,8.8,PASS\n"
        + "1BC24002,Bhavana Reddy,A,2024–27,bhavana@example.com,9876543211,88.0,8.4,PASS\n"
        + "1BC24003,Chetan Kumar,B,2024–27,chetan@example.com,9876543212,79.5,7.9,PASS\n";

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `bcafly_semester_${activeSemester}_student_template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  // Preview Rows Filtered
  const previewRows = useMemo(() => {
    if (!importAnalysis || !importAnalysis.rows) return [];
    if (importFilter === 'all') return importAnalysis.rows;
    if (importFilter === 'ready') return importAnalysis.rows.filter(r => r.status === 'ready');
    if (importFilter === 'warning') return importAnalysis.rows.filter(r => r.status === 'warning');
    if (importFilter === 'error') return importAnalysis.rows.filter(r => r.status === 'error');
    return importAnalysis.rows;
  }, [importAnalysis, importFilter]);

  const exportHeaders = ['Reg. No / USN', 'Student Name', 'Section', 'Batch', 'Attendance %', 'Current SGPA', 'Result Status', 'Enrolment Status'];
  const exportRows = filteredStudents.map(s => [
    s.reg || s.usn,
    s.name,
    `Sec ${s.section}`,
    s.batch,
    `${s.attendance || s.attendancePercentage}%`,
    (Number(s.sgpa || s.currentSgpa) || 0).toFixed(2),
    s.standing || s.resultStatus || 'PASS',
    s.status || s.enrolmentStatus || 'ACTIVE'
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
            Master student registry enrolled in Semester {activeSemester} ({activeWorkspace?.batch || '2024–27'}).
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <button
            disabled={!activeSemester}
            onClick={handleOpenCreate}
            className={`text-xs font-mono px-4 py-1.5 rounded flex items-center gap-1.5 font-bold shadow-xs cursor-pointer ${
              activeSemester ? 'btn-brass' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
          <ExportToolbar
            filename={`bca_sem${activeSemester}_roster`}
            title={`Semester ${activeSemester} Student Roster`}
            subtitle={`Batch: ${activeWorkspace?.batch || '2024–27'} — Total: ${filteredStudents.length} Students`}
            headers={exportHeaders}
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
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Active Enrolled</div>
            <div className="font-display font-bold text-lg text-[var(--ink)]">{activeStudentsCount}</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 font-bold text-sm">
            <span>🅰️</span>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Section A</div>
            <div className="font-display font-bold text-lg text-blue-900">{secACount}</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-800 font-bold text-sm">
            <span>🅱️</span>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Section B</div>
            <div className="font-display font-bold text-lg text-indigo-900">{secBCount}</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm">
            <span>📊</span>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">Avg. Attendance</div>
            <div className="font-display font-bold text-lg text-emerald-900">{avgAttendance}%</div>
          </div>
        </div>
      </div>

      {/* CSV / Excel Ingestion Zone */}
      <div className={!activeSemester ? "opacity-50 pointer-events-none" : ""}>
        <IngestionZone
          title="BULK STUDENT CSV / EXCEL INGESTION"
          description={
            activeSemester
              ? `Target workspace: BCA Semester ${activeSemester} — ${activeWorkspace?.term || '2024–25 EVEN'}`
              : "Select a semester before uploading nominal roll documents."
          }
          acceptedFormats={['.CSV', '.XLSX', '.XLS', '.PDF']}
          onFileSelect={activeSemester ? handleFileSelect : undefined}
          icon={isIngesting ? '⏳' : '📂'}
        />
      </div>

      {/* Roster Ledger */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3 flex-wrap gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <h4 className="font-display font-bold text-base text-[var(--ink)]">
              Enrolled Student Ledger ({filteredStudents.length} Students)
            </h4>
            <span className="badge b-ink text-[10px] font-bold">SEMESTER {activeSemester}</span>
          </div>

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
                <option value="C">Section C</option>
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
              render: (s) => <strong className="text-xs text-[var(--ink)]">{s.name || s.fullName}</strong>
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
                <span className={`font-mono font-bold text-xs ${Number(s.attendance || s.attendancePercentage) < 75 ? 'text-red-700' : 'text-emerald-800'}`}>
                  {s.attendance || s.attendancePercentage}%
                </span>
              )
            },
            {
              header: 'Current SGPA',
              accessor: 'sgpa',
              render: (s) => <span className="font-mono font-bold text-xs text-[var(--brass-2)]">{(Number(s.sgpa || s.currentSgpa) || 0).toFixed(2)}</span>
            },
            {
              header: 'Standing',
              accessor: 'resultStatus',
              render: (s) => (
                <Badge variant={(s.standing || s.resultStatus) === 'FAIL' ? 'fail' : 'pass'}>
                  {s.standing || s.resultStatus || 'PASS'}
                </Badge>
              )
            },
            {
              header: 'Actions',
              accessor: 'actions',
              render: (s) => (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1 rounded hover:bg-[var(--parchment-2)] text-[var(--slate)] hover:text-[var(--ink)] cursor-pointer"
                    title="Edit Student Enrolment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(s)}
                    className="p-1 rounded hover:bg-red-50 text-[var(--slate)] hover:text-red-600 cursor-pointer"
                    title="Drop / Delete Enrolment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            }
          ]}
          data={filteredStudents}
        />
      </div>

      {/* CSV / Excel Import Preview Modal */}
      {importModalOpen && importAnalysis && (
        <Modal
          isOpen={true}
          onClose={() => setImportModalOpen(false)}
          title={`Bulk Student Import — "${importAnalysis.fileName}"`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4 font-sans text-xs">
            {/* Top Workspace Target Banner */}
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

            {/* Filter Tabs & Import Mode Selector */}
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
                    Duplicates ({importAnalysis.stats.warningCount})
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

              {/* Import Mode Radio selection */}
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
                    <th className="p-2">Reg. No / USN</th>
                    <th className="p-2">Student Name</th>
                    <th className="p-2">Section</th>
                    <th className="p-2">Batch</th>
                    <th className="p-2">Att. %</th>
                    <th className="p-2">SGPA</th>
                    <th className="p-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {previewRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-[var(--slate)] font-mono">
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
                        <td className="p-2 font-bold text-[var(--brass-2)]">{s.usn || s.reg}</td>
                        <td className="p-2 font-bold text-[var(--ink)]">{s.name}</td>
                        <td className="p-2">Sec {s.section}</td>
                        <td className="p-2">{s.batch}</td>
                        <td className="p-2">{s.attendance}%</td>
                        <td className="p-2">{s.sgpa}</td>
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
                Ready to import <span className="font-bold text-[var(--ink)]">{importAnalysis.stats.validCount}</span> records into <span className="font-bold text-[var(--ink)]">Semester {activeSemester}</span> ({importMode}).
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
                  Confirm &amp; Enrol {importAnalysis.stats.validCount} Students →
                </button>
              </div>
            </div>
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
            <div className="p-2.5 bg-[var(--parchment-2)] border border-[var(--rule)] rounded font-mono text-[11px]">
              <span className="font-bold text-[var(--ink)]">Adding student to:</span> BCA Semester {activeSemester} — {activeWorkspace?.term || '2024–25 EVEN'}
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Full Student Name *:</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full student name"
                className="field-input text-xs"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Register Number / USN:</label>
              <input
                type="text"
                value={formData.reg}
                onChange={(e) => setFormData({ ...formData, reg: e.target.value })}
                placeholder="Enter Register Number / USN"
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
                  <option value="C">Section C</option>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Initial Attendance %:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })}
                  className="field-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Initial SGPA:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.sgpa}
                  onChange={(e) => setFormData({ ...formData, sgpa: Number(e.target.value) })}
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

      {/* Edit Student Enrolment Modal */}
      {editModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Enrolment — ${editFormData.name} (${editFormData.reg})`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 font-sans text-xs">
            <div className="p-2.5 bg-[var(--parchment-2)] border border-[var(--rule)] rounded font-mono text-[11px]">
              <span className="font-bold text-[var(--ink)]">Editing workspace:</span> BCA Semester {activeSemester} — {activeWorkspace?.term || '2024–25 EVEN'}
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Full Student Name *:</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="field-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Section:</label>
                <select
                  value={editFormData.section}
                  onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                  className="field-input text-xs font-mono"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Batch:</label>
                <input
                  type="text"
                  value={editFormData.batch}
                  onChange={(e) => setEditFormData({ ...editFormData, batch: e.target.value })}
                  className="field-input text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Roll Number:</label>
                <input
                  type="number"
                  value={editFormData.rollNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, rollNumber: e.target.value })}
                  placeholder="e.g. 15"
                  className="field-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Enrolment Status:</label>
                <select
                  value={editFormData.enrolmentStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, enrolmentStatus: e.target.value })}
                  className="field-input text-xs font-mono"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DROPPED">DROPPED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Attendance Percentage %:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={editFormData.attendance}
                  onChange={(e) => setEditFormData({ ...editFormData, attendance: Number(e.target.value) })}
                  className="field-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Current SGPA:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={editFormData.sgpa}
                  onChange={(e) => setEditFormData({ ...editFormData, sgpa: Number(e.target.value) })}
                  className="field-input text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Standing:</label>
              <select
                value={editFormData.standing}
                onChange={(e) => setEditFormData({ ...editFormData, standing: e.target.value })}
                className="field-input text-xs font-mono"
              >
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
                <option value="ATKT">ATKT</option>
                <option value="PENDING">PENDING</option>
              </select>
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

      {/* Delete / Drop Confirmation Modal */}
      {deleteModalOpen && deletingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteModalOpen(false)}
          title="Drop Student Enrolment"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 font-mono text-xs">
              <strong>⚠️ Semester-Scoped Action:</strong> Deleting will remove only this enrolment record from <strong>Semester {activeSemester}</strong>. The student's master profile and other semester records will remain intact.
            </div>

            <p className="text-[var(--ink)]">
              Are you sure you want to drop student <strong>{deletingStudent.name || deletingStudent.fullName}</strong> ({deletingStudent.reg || deletingStudent.usn}) from Semester {activeSemester}?
            </p>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold shadow-xs cursor-pointer"
              >
                Confirm Drop Enrolment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

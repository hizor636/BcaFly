import React, { useState, useMemo } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import {
  parseRawDocument,
  processDocumentData
} from '../../../services/dataIngestionEngine';
import {
  TEMPLATE_SCHEMAS,
  downloadTemplateFile
} from '../../../utils/templateGenerator';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  ArrowRight,
  Download,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Users,
  BookOpen,
  UserCheck,
  Calendar,
  Clock,
  ClipboardList,
  Award
} from 'lucide-react';

export const AdminDatabaseIngestionHub = () => {
  const {
    activeSemester,
    setActiveSemester,
    activeWorkspace,
    semesters,
    ingestBulkAcademicData,
    loadUniversityStarterDataset
  } = useAcademic();

  // Target Settings
  const [selectedCategory, setSelectedCategory] = useState('STUDENTS');
  const [targetSemester, setTargetSemester] = useState(activeSemester || 1);
  const [ingestionStrategy, setIngestionStrategy] = useState('merge'); // 'merge' | 'append' | 'replace'

  // Document Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [previewFilter, setPreviewFilter] = useState('ALL'); // 'ALL' | 'VALID' | 'ERROR'
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPage, setPreviewPage] = useState(1);
  const rowsPerPage = 10;

  // Modals & Feedback
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(null);
  const [starterModalOpen, setStarterModalOpen] = useState(false);
  const [starterLoading, setStarterLoading] = useState(false);

  // Category Configuration
  const CATEGORIES = [
    { key: 'STUDENTS', label: 'Students Nominal Roll', icon: Users, badge: 'ROSTER', desc: 'Enrolment, USN, cohort, batch, contact info' },
    { key: 'COURSES', label: 'Course Curriculum', icon: BookOpen, badge: 'SYLLABUS', desc: 'Course codes, titles, credits, lecture/lab types' },
    { key: 'FACULTY', label: 'Faculty & Allocations', icon: UserCheck, badge: 'STAFF', desc: 'Faculty directory, employee codes, course assignments' },
    { key: 'TIMETABLE', label: 'Weekly Timetable', icon: Calendar, badge: 'SCHEDULE', desc: 'Day, period slots (1–8), classrooms, faculty' },
    { key: 'ATTENDANCE', label: 'Attendance Registers', icon: Clock, badge: 'REGISTER', desc: 'Session dates, periods, student presence/OD status' },
    { key: 'MARKS', label: 'Internal Marks (CIE)', icon: ClipboardList, badge: 'ASSESSMENT', desc: 'CIA-1, CIA-2, assignments, model exam scores' },
    { key: 'RESULTS', label: 'Exam Results & Grades', icon: Award, badge: 'TRANSCRIPT', desc: 'Internal, external, total marks, letter grades, SGPA' }
  ];

  // Handle File Selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);
    setCommitSuccess(null);
    setPreviewPage(1);

    try {
      const rawRows = await parseRawDocument(file);
      const processed = processDocumentData(selectedCategory, rawRows, targetSemester);
      setAnalysisResult(processed);
    } catch (err) {
      alert(`Error reading file: ${err.message}`);
      setAnalysisResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch category
  const handleCategorySwitch = (catKey) => {
    setSelectedCategory(catKey);
    setUploadedFile(null);
    setAnalysisResult(null);
    setCommitSuccess(null);
  };

  // Commit Ingestion into Database & Workspace Store
  const handleCommitIngestion = () => {
    if (!analysisResult || analysisResult.parsedData.length === 0) return;

    setIsCommitting(true);

    setTimeout(() => {
      ingestBulkAcademicData(
        selectedCategory,
        targetSemester,
        analysisResult.parsedData,
        ingestionStrategy
      );

      setIsCommitting(false);
      setCommitSuccess({
        category: selectedCategory,
        semester: targetSemester,
        count: analysisResult.parsedData.length,
        strategy: ingestionStrategy,
        timestamp: new Date().toLocaleTimeString()
      });

      // Clear pending file
      setUploadedFile(null);
      setAnalysisResult(null);
    }, 600);
  };

  // Load Complete Starter Dataset
  const handleLoadStarterData = () => {
    setStarterLoading(true);
    setTimeout(() => {
      loadUniversityStarterDataset();
      setStarterLoading(false);
      setStarterModalOpen(false);
      setCommitSuccess({
        category: 'ALL_MODULES',
        semester: '1–6',
        count: 'Complete BCA University Syllabi & Rosters',
        strategy: 'INITIALIZE',
        timestamp: new Date().toLocaleTimeString()
      });
    }, 800);
  };

  // Filtered Preview Rows
  const previewRows = useMemo(() => {
    if (!analysisResult) return [];
    let rows = analysisResult.parsedData;

    if (previewFilter === 'ERROR') {
      // Filter rows that produced errors
      const errRows = new Set(analysisResult.errors.map(e => e.rowNumber));
      rows = rows.filter((_, idx) => errRows.has(idx + 2));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(r => {
        return Object.values(r).some(val => String(val).toLowerCase().includes(q));
      });
    }

    return rows;
  }, [analysisResult, previewFilter, searchQuery]);

  const totalPages = Math.ceil(previewRows.length / rowsPerPage) || 1;
  const paginatedRows = previewRows.slice((previewPage - 1) * rowsPerPage, previewPage * rowsPerPage);

  const currentWorkspace = semesters[targetSemester] || { students: [], courses: [] };

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[var(--rule)] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-2 font-bold">
            <Database className="w-3.5 h-3.5" /> UNIVERSAL DATABASE &amp; INGESTION PIPELINE
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            Database Creation &amp; Document Ingestion Hub
          </h2>
          <p className="text-xs text-[var(--slate)] font-mono max-w-3xl">
            Select, process, and ingest large academic documents (Excel, CSV, JSON) into your active database. Ingested datasets immediately synchronize and render across Admin, HOD, Faculty, and Student platform portals.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setStarterModalOpen(true)}
            className="btn-brass px-3.5 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> ⚡ Populate BCA 6-Semester University Data
          </button>
        </div>
      </div>

      {/* Commit Success Notification Banner */}
      {commitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-start justify-between gap-3 text-xs font-mono text-emerald-900 shadow-2xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">
                ✓ Database Ingestion Successful &amp; Synchronized!
              </div>
              <p className="mt-0.5 text-emerald-800">
                Ingested <strong>{commitSuccess.count}</strong> records into <strong>Semester {commitSuccess.semester}</strong> ({commitSuccess.category}) via <code>{commitSuccess.strategy.toUpperCase()}</code> mode at {commitSuccess.timestamp}.
                All platform features and dashboards have been updated in real time.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCommitSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Target Workspace & Category Selector */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Scope & Categories */}
        <div className="lg:col-span-4 space-y-4">
          {/* Target Workspace Selector Card */}
          <div className="card p-5 bg-white border border-[var(--rule)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
              <span className="font-display font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[var(--brass-2)]" /> 1. Select Target Semester
              </span>
              <span className="font-mono text-[11px] text-[var(--brass-2)] font-bold">
                Semester {targetSemester}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <button
                  key={sem}
                  onClick={() => {
                    setTargetSemester(sem);
                    setActiveSemester(sem);
                  }}
                  className={`p-2.5 rounded-md text-xs font-mono font-bold transition flex flex-col items-center justify-center cursor-pointer border ${
                    targetSemester === sem
                      ? 'bg-[var(--ink)] text-white border-[var(--ink)] shadow-xs'
                      : 'bg-[var(--parchment-2)] text-[var(--slate)] border-[var(--rule)] hover:border-[var(--brass)] hover:text-[var(--ink)]'
                  }`}
                >
                  <span className="text-[10px] opacity-75">BCA</span>
                  <span>Sem {sem}</span>
                </button>
              ))}
            </div>

            <div className="p-3 bg-[var(--parchment)] rounded border border-[var(--rule)] text-[11px] font-mono text-[var(--slate)] space-y-1">
              <div className="flex justify-between">
                <span>Enrolled Students:</span>
                <strong className="text-[var(--ink)]">{currentWorkspace.students?.length || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span>Configured Courses:</span>
                <strong className="text-[var(--ink)]">{currentWorkspace.courses?.length || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span>Active Term:</span>
                <strong className="text-[var(--brass-2)]">{currentWorkspace.term || `2026–27 ODD`}</strong>
              </div>
            </div>
          </div>

          {/* Academic Document Categories */}
          <div className="card p-5 bg-white border border-[var(--rule)] space-y-3">
            <div className="border-b border-[var(--rule)] pb-2.5">
              <span className="font-display font-bold text-sm text-[var(--ink)]">
                2. Select Document Category
              </span>
            </div>

            <div className="space-y-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategorySwitch(cat.key)}
                    className={`w-full p-3 rounded-lg text-left transition border flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--brass-soft)] border-[var(--brass)] shadow-xs'
                        : 'bg-white border-[var(--rule)] hover:border-[var(--slate)]'
                    }`}
                  >
                    <div className={`p-2 rounded-md shrink-0 ${isSelected ? 'bg-[var(--brass)] text-white' : 'bg-[var(--parchment-2)] text-[var(--slate)]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-display font-bold text-xs ${isSelected ? 'text-[var(--ink)] font-extrabold' : 'text-[var(--ink)]'}`}>
                          {cat.label}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-[var(--rule)] text-[var(--slate)]">
                          {cat.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--slate)] font-mono truncate">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Ingestion Workbench */}
        <div className="lg:col-span-8 space-y-4">
          {/* File Upload Zone & Schema Card */}
          <div className="card p-6 bg-white border border-[var(--rule)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--ink)]">
                  3. Ingest {TEMPLATE_SCHEMAS[selectedCategory]?.title || selectedCategory}
                </h3>
                <p className="text-[11px] font-mono text-[var(--slate)]">
                  Target: Semester {targetSemester} • Supports .xlsx, .xls, .csv, and .json
                </p>
              </div>

              {/* Template Downloaders */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadTemplateFile(selectedCategory, 'xlsx')}
                  className="px-2.5 py-1.5 rounded bg-[var(--parchment-2)] hover:bg-[var(--parchment)] border border-[var(--rule)] text-[11px] font-mono text-[var(--ink)] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Download standard Excel template with sample rows"
                >
                  <Download className="w-3.5 h-3.5" /> Template (.xlsx)
                </button>
                <button
                  onClick={() => downloadTemplateFile(selectedCategory, 'csv')}
                  className="px-2.5 py-1.5 rounded bg-[var(--parchment-2)] hover:bg-[var(--parchment)] border border-[var(--rule)] text-[11px] font-mono text-[var(--ink)] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Download CSV template"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div className="relative border-2 border-dashed border-[var(--rule)] hover:border-[var(--brass)] bg-[var(--parchment)] rounded-xl p-8 text-center transition group">
              <input
                type="file"
                accept=".xlsx, .xls, .csv, .json"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white border border-[var(--rule)] text-[var(--brass-2)] flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="font-display font-bold text-sm text-[var(--ink)]">
                  {uploadedFile ? uploadedFile.name : 'Select or Drop Academic Document Here'}
                </div>
                <p className="text-xs text-[var(--slate)] font-mono">
                  {uploadedFile
                    ? `File size: ${(uploadedFile.size / 1024).toFixed(1)} KB • Ready for processing`
                    : 'Drag & drop Excel (.xlsx, .xls), CSV or JSON files to parse and validate'}
                </p>
              </div>
            </div>

            {isProcessing && (
              <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg text-xs font-mono text-center flex items-center justify-center gap-2 text-[var(--ink)]">
                <RotateCcw className="w-4 h-4 animate-spin text-[var(--brass-2)]" />
                Processing and validating document against {selectedCategory} schema...
              </div>
            )}
          </div>

          {/* Pre-Commit Analysis & Diagnostic Dashboard */}
          {analysisResult && (
            <div className="card p-6 bg-white border border-[var(--rule)] space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3 flex-wrap gap-2">
                <div>
                  <h4 className="font-display font-bold text-base text-[var(--ink)]">
                    4. Pre-Commit Analysis &amp; Diagnostics
                  </h4>
                  <p className="text-[11px] font-mono text-[var(--slate)]">
                    {analysisResult.totalRows} raw rows parsed • {analysisResult.validRows} ready for database commit
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--slate)]">Mode:</span>
                  <select
                    value={ingestionStrategy}
                    onChange={(e) => setIngestionStrategy(e.target.value)}
                    className="field-input text-xs font-mono py-1 px-2.5 font-bold"
                  >
                    <option value="merge">Merge &amp; Upsert (Recommended)</option>
                    <option value="append">Append New Only</option>
                    <option value="replace">Replace Workspace Dataset</option>
                  </select>
                </div>
              </div>

              {/* Diagnostic Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[var(--parchment-2)] rounded-lg border border-[var(--rule)]">
                  <div className="text-[10px] font-mono uppercase font-bold text-[var(--slate)]">Total Rows</div>
                  <div className="font-display text-2xl font-bold text-[var(--ink)] mt-0.5">
                    {analysisResult.totalRows}
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-[10px] font-mono uppercase font-bold text-emerald-800">Valid Rows</div>
                  <div className="font-display text-2xl font-bold text-emerald-900 mt-0.5">
                    {analysisResult.validRows}
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-[10px] font-mono uppercase font-bold text-amber-800">Duplicates</div>
                  <div className="font-display text-2xl font-bold text-amber-900 mt-0.5">
                    {analysisResult.duplicateRows}
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="text-[10px] font-mono uppercase font-bold text-rose-800">Errors</div>
                  <div className="font-display text-2xl font-bold text-rose-900 mt-0.5">
                    {analysisResult.invalidRows}
                  </div>
                </div>
              </div>

              {/* Column Mapping Badges */}
              <div className="p-3 bg-[var(--parchment)] rounded-lg border border-[var(--rule)] space-y-1.5">
                <div className="text-[10px] font-mono uppercase font-bold text-[var(--slate)]">
                  Detected Header Mappings:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.columnsMapped.map((col, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white rounded border border-[var(--rule)] font-mono text-[10px] text-[var(--ink)]"
                    >
                      <strong className="text-[var(--brass-2)]">{col.original}</strong> → {col.mappedTo}
                    </span>
                  ))}
                </div>
              </div>

              {/* Error Warnings List */}
              {analysisResult.errors.length > 0 && (
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-1.5 max-h-36 overflow-y-auto text-xs font-mono">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Validation Diagnostics ({analysisResult.errors.length} notices):
                  </div>
                  {analysisResult.errors.map((err, i) => (
                    <div key={i} className="text-[11px] text-amber-800 flex items-start gap-1">
                      <span>•</span>
                      <span>
                        [Row {err.rowNumber}] <strong>{err.field}</strong>: {err.reason}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Data Preview Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setPreviewFilter('ALL'); setPreviewPage(1); }}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                        previewFilter === 'ALL' ? 'bg-[var(--ink)] text-white' : 'bg-[var(--parchment-2)] text-[var(--slate)]'
                      }`}
                    >
                      All Rows ({analysisResult.parsedData.length})
                    </button>
                    {analysisResult.errors.length > 0 && (
                      <button
                        onClick={() => { setPreviewFilter('ERROR'); setPreviewPage(1); }}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                          previewFilter === 'ERROR' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        Errors Only
                      </button>
                    )}
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPreviewPage(1); }}
                      placeholder="Filter preview..."
                      className="field-input text-xs font-mono pl-7 py-1 w-44"
                    />
                    <Search className="w-3.5 h-3.5 text-[var(--slate)] absolute left-2 top-2" />
                  </div>
                </div>

                <div className="overflow-x-auto border border-[var(--rule)] rounded-lg">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="bg-[var(--parchment-2)] text-[var(--slate)] border-b border-[var(--rule)] uppercase text-[10px]">
                        <th className="p-2.5">#</th>
                        {Object.keys(paginatedRows[0] || {}).slice(0, 7).map((header, hIdx) => (
                          <th key={hIdx} className="p-2.5 whitespace-nowrap">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--rule)] bg-white">
                      {paginatedRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[var(--parchment)] transition">
                          <td className="p-2.5 text-[var(--slate)]">{(previewPage - 1) * rowsPerPage + rIdx + 1}</td>
                          {Object.values(row).slice(0, 7).map((val, cIdx) => (
                            <td key={cIdx} className="p-2.5 text-[var(--ink)] whitespace-nowrap">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--slate)] pt-1">
                    <span>Showing page {previewPage} of {totalPages}</span>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={previewPage <= 1}
                        onClick={() => setPreviewPage(p => p - 1)}
                        className="px-2 py-1 bg-[var(--parchment-2)] rounded border border-[var(--rule)] disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        disabled={previewPage >= totalPages}
                        onClick={() => setPreviewPage(p => p + 1)}
                        className="px-2 py-1 bg-[var(--parchment-2)] rounded border border-[var(--rule)] disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Ingest Execution Button */}
              <div className="pt-3 border-t border-[var(--rule)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setUploadedFile(null); setAnalysisResult(null); }}
                  className="btn-ghost border border-[var(--rule)] px-4 py-2.5 rounded text-xs font-mono"
                >
                  Discard
                </button>
                <button
                  type="button"
                  disabled={isCommitting || analysisResult.validRows === 0}
                  onClick={handleCommitIngestion}
                  className="btn-ink px-6 py-2.5 rounded text-xs font-mono font-bold flex items-center gap-2 min-h-[44px] cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isCommitting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" /> Ingesting Data into Database...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Commit {analysisResult.validRows} Records to Semester {targetSemester} Database →
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Starter Dataset Confirmation Modal */}
      <Modal
        isOpen={starterModalOpen}
        onClose={() => setStarterModalOpen(false)}
        title="Initialize BCA 6-Semester Official University Data"
        tag="STARTER DATA ENGINE"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-[var(--ink)] leading-relaxed">
            This will populate complete curriculum catalogs, student nominal rolls (10 enrolled students per semester), course allocations, and active terms across <strong>all 6 BCA Semesters (Semester 1 through 6)</strong>.
          </p>

          <div className="p-3.5 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg font-mono text-[11px] space-y-1.5 text-[var(--slate)]">
            <div className="font-bold text-[var(--ink)]">Included in University Dataset:</div>
            <div>• 30 Official BCA Course Modules with syllabi, credit weights, and room numbers</div>
            <div>• 60 Enrolled Students with unique register numbers (USNs) across 6 cohorts</div>
            <div>• Academic Year Terms: 2026–27 ODD / EVEN</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setStarterModalOpen(false)}
              className="btn-ghost border border-[var(--rule)] px-4 py-2 rounded text-xs font-mono"
            >
              Cancel
            </button>
            <button
              disabled={starterLoading}
              onClick={handleLoadStarterData}
              className="btn-brass px-5 py-2 rounded text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {starterLoading ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Initializing...
                </>
              ) : (
                'Confirm & Populate All Semesters →'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

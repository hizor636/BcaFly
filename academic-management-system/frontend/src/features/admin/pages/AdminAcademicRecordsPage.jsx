import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { MetricCard } from '../../../components/ui/MetricCard';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { AcademicFileUploadModal } from '../../../components/ui/AcademicFileUploadModal';
import { AcademicFilesTable } from '../../../components/common/AcademicFilesTable';
import { calculateInternalTotal, getGradeInfo } from '../../../utils/academicCalculations';

export const AdminAcademicRecordsPage = () => {
  const {
    activeSemester,
    activeWorkspace,
    academicFiles,
    activities,
    verifyActivity,
    logAction
  } = useAcademic();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'assessments' | 'results' | 'activities'
  const [search, setSearch] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadDefaultType, setUploadDefaultType] = useState('Attendance');

  // Attendance tab states
  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];
  const [selectedCourseAtt, setSelectedCourseAtt] = useState('ALL');

  // Assessment tab states
  const [selectedCourseMarks, setSelectedCourseMarks] = useState(courses[0]?.code || 'BCA301');
  const [isAssessmentLocked, setIsAssessmentLocked] = useState(true);
  const [isAssessmentPublished, setIsAssessmentPublished] = useState(true);

  // Filter semester specific academic files
  const semFiles = academicFiles.filter(f => Number(f.sem) === Number(activeSemester));

  const openUploadModal = (recordType) => {
    setUploadDefaultType(recordType || (activeTab === 'attendance' ? 'Attendance' : activeTab === 'assessments' ? 'Assessment' : activeTab === 'results' ? 'Result' : 'Activity Portfolio'));
    setUploadModalOpen(true);
  };

  // 1. Attendance Data Calculation
  const attendanceData = students.map(s => {
    const totalClasses = 45;
    const attended = Math.round((s.attendance / 100) * totalClasses);
    return {
      ...s,
      conducted: totalClasses,
      attended,
      missed: totalClasses - attended,
      status: s.attendance >= 75 ? 'Eligible' : s.attendance >= 65 ? 'Condonation' : 'Debarred'
    };
  });

  const shortages = students.filter(s => s.attendance < 75);

  // 2. Assessment Data Calculation
  const marksData = students.map(s => {
    const cia1 = Math.min(50, Math.round(30 + (s.sgpa * 1.8)));
    const cia2 = Math.min(50, Math.round(32 + (s.sgpa * 1.7)));
    const model = Math.min(100, Math.round(60 + (s.sgpa * 3.8)));
    const assignment = 9;
    const internalTotal = calculateInternalTotal(cia1, cia2, model, assignment);
    const grade = getGradeInfo(internalTotal * 2);

    return {
      ...s,
      cia1,
      cia2,
      model,
      assignment,
      internalTotal,
      grade: grade.grade
    };
  });

  // 3. Results Data
  const passCount = students.filter(s => s.resultStatus === 'PASS').length;
  const failCount = students.filter(s => s.resultStatus === 'FAIL').length;
  const passRate = students.length > 0 ? Math.round((passCount / students.length) * 100) : 0;

  // 4. Activities Data
  const semActivities = activities.filter(a => Number(a.sem) === Number(activeSemester) || !a.sem);

  return (
    <div>
      {/* Workspace Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-2 font-bold">
            <span>🗂️</span> SEMESTER GOVERNANCE &amp; ACADEMIC RECORDS
          </div>
          <h2 className="font-display text-3xl font-bold text-[var(--ink)]">
            Semester {activeSemester} — Academic Records
          </h2>
          <p className="text-xs text-[var(--slate)] max-w-2xl">
            Manage attendance, assessment scores, published results, activities, and supporting evidence files for Semester {activeSemester} ({activeWorkspace?.batch}).
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openUploadModal()}
            className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>📤</span> Upload Files
          </button>

          <ExportToolbar
            filename={`bca_sem${activeSemester}_academic_records_${activeTab}`}
            title={`Semester ${activeSemester} Academic Records (${activeTab.toUpperCase()})`}
            subtitle={`Batch: ${activeWorkspace?.batch} — Term: ${activeWorkspace?.term}`}
            headers={['Record ID', 'Student Name', 'Section', 'Category', 'Details']}
            rows={students.map(s => [s.reg, s.name, s.section, activeTab, `${s.attendance}% attendance, SGPA ${s.sgpa}`])}
          />
        </div>
      </div>

      {/* Internal Tabs Navigation (Gold-Accented) */}
      <div className="flex items-center border-b border-[var(--rule)] mb-6 flex-wrap gap-1 bg-white p-1 rounded-t-lg shadow-2xs">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-5 py-2.5 rounded-md text-xs font-mono font-bold transition flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-[var(--ink)] text-white shadow-xs'
              : 'text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--parchment-2)]'
          }`}
        >
          <span>⏱️</span> Attendance
          <span className="badge b-ink ml-1">{students.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-5 py-2.5 rounded-md text-xs font-mono font-bold transition flex items-center gap-2 ${
            activeTab === 'assessments'
              ? 'bg-[var(--ink)] text-white shadow-xs'
              : 'text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--parchment-2)]'
          }`}
        >
          <span>📝</span> Assessments
          <span className="badge b-amber ml-1">{courses.length} Courses</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-5 py-2.5 rounded-md text-xs font-mono font-bold transition flex items-center gap-2 ${
            activeTab === 'results'
              ? 'bg-[var(--ink)] text-white shadow-xs'
              : 'text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--parchment-2)]'
          }`}
        >
          <span>🏆</span> Results
          <span className="badge b-pass ml-1">{passRate}% Clear</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`px-5 py-2.5 rounded-md text-xs font-mono font-bold transition flex items-center gap-2 ${
            activeTab === 'activities'
              ? 'bg-[var(--ink)] text-white shadow-xs'
              : 'text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--parchment-2)]'
          }`}
        >
          <span>🎖️</span> Activities &amp; Portfolios
          <span className="badge b-lock ml-1">{semActivities.length}</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ATTENDANCE
      ========================================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="AVERAGE ATTENDANCE"
              value={`${Math.round(students.reduce((a, s) => a + s.attendance, 0) / (students.length || 1))}%`}
              subtitle="● Target: 75% Minimum"
              valueColor="text-emerald-800"
            />
            <MetricCard
              title="CONDUCTED SESSIONS"
              value="45 Hours"
              subtitle="● Active Semester Total"
            />
            <MetricCard
              title="SHORTAGE FLAGS"
              value={shortages.length}
              subtitle="● < 75% Attendance"
              valueColor={shortages.length > 0 ? 'text-amber-700' : 'text-emerald-700'}
            />
            <MetricCard
              title="ATTENDANCE EVIDENCE"
              value={semFiles.filter(f => f.recordType === 'Attendance').length}
              subtitle="● Signed Reports on File"
              onClick={() => openUploadModal('Attendance')}
            />
          </div>

          {shortages.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-amber-900">
                <span className="text-base">⚠️</span>
                <span><strong>Shortage Alert:</strong> {shortages.length} student(s) require official condonation letter before hall ticket issuance.</span>
              </div>
              <button
                onClick={() => openUploadModal('Attendance')}
                className="px-3 py-1 bg-amber-800 text-white rounded font-bold hover:bg-amber-900"
              >
                Upload Shortage Letter 📤
              </button>
            </div>
          )}

          {/* Attendance Table */}
          <LedgerTable
            searchPlaceholder="Search student attendance..."
            searchValue={search}
            onSearchChange={setSearch}
            extraToolbar={
              <div className="flex items-center gap-3">
                <select
                  value={selectedCourseAtt}
                  onChange={(e) => setSelectedCourseAtt(e.target.value)}
                  className="field-input text-xs py-1"
                >
                  <option value="ALL">All Courses (Consolidated)</option>
                  {courses.map(c => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
                  ))}
                </select>
                <button
                  onClick={() => openUploadModal('Attendance')}
                  className="btn-brass px-3 py-1 rounded text-xs font-mono font-bold shrink-0"
                >
                  + Upload Register
                </button>
              </div>
            }
            columns={[
              {
                header: 'Reg No',
                accessor: 'reg',
                render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
              },
              { header: 'Student Name', accessor: 'name' },
              { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
              { header: 'Total Sessions', accessor: 'conducted', render: (s) => <span className="font-mono">{s.conducted}</span> },
              { header: 'Attended', accessor: 'attended', render: (s) => <span className="font-mono text-emerald-800 font-bold">{s.attended}</span> },
              { header: 'Missed', accessor: 'missed', render: (s) => <span className="font-mono text-red-800">{s.missed}</span> },
              {
                header: 'Percentage',
                accessor: 'attendance',
                render: (s) => <span className="font-mono font-bold text-sm">{s.attendance}%</span>
              },
              {
                header: 'Exam Eligibility',
                accessor: 'status',
                render: (s) => (
                  <Badge variant={s.attendance >= 75 ? 'pass' : s.attendance >= 65 ? 'amber' : 'fail'}>
                    {s.status}
                  </Badge>
                )
              }
            ]}
            data={attendanceData}
          />

          {/* Supporting Attendance Files Table */}
          <AcademicFilesTable
            files={semFiles}
            recordTypeFilter="Attendance"
            onUploadClick={() => openUploadModal('Attendance')}
            emptyText={`No supporting attendance files uploaded yet for Semester ${activeSemester}.`}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: ASSESSMENTS
      ========================================================================== */}
      {activeTab === 'assessments' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-mono font-bold text-[var(--ink)]">SELECT COURSE:</label>
              <select
                value={selectedCourseMarks}
                onChange={(e) => setSelectedCourseMarks(e.target.value)}
                className="field-input text-xs py-1.5 min-w-[240px]"
              >
                {courses.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const next = !isAssessmentLocked;
                  setIsAssessmentLocked(next);
                  logAction(next ? 'Assessment Locked' : 'Assessment Unlocked', `Locked status changed for ${selectedCourseMarks}.`);
                }}
                className="btn-ghost border border-[var(--rule)] px-3 py-1.5 rounded text-xs font-mono font-bold"
              >
                {isAssessmentLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
              </button>
              <button
                onClick={() => {
                  const next = !isAssessmentPublished;
                  setIsAssessmentPublished(next);
                  logAction(next ? 'Marks Published' : 'Marks Drafted', `Marks publication status changed for ${selectedCourseMarks}.`);
                }}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold ${
                  isAssessmentPublished ? 'bg-emerald-800 text-white' : 'btn-brass'
                }`}
              >
                {isAssessmentPublished ? '✓ PUBLISHED' : 'PUBLISH'}
              </button>
              <button
                onClick={() => openUploadModal('Assessment')}
                className="btn-brass px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1"
              >
                <span>📤</span> Upload Assessment Sheet
              </button>
            </div>
          </div>

          <LedgerTable
            searchPlaceholder="Search assessment scores..."
            searchValue={search}
            onSearchChange={setSearch}
            columns={[
              {
                header: 'Reg No',
                accessor: 'reg',
                render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
              },
              { header: 'Student Name', accessor: 'name' },
              { header: 'CIA 1 (50)', accessor: 'cia1', render: (s) => <span className="font-mono">{s.cia1}</span> },
              { header: 'CIA 2 (50)', accessor: 'cia2', render: (s) => <span className="font-mono">{s.cia2}</span> },
              { header: 'Model (100)', accessor: 'model', render: (s) => <span className="font-mono">{s.model}</span> },
              { header: 'Assignment (10)', accessor: 'assignment', render: (s) => <span className="font-mono">{s.assignment}</span> },
              {
                header: 'Internal Total (50)',
                accessor: 'internalTotal',
                render: (s) => <span className="font-mono font-bold text-sm text-[var(--brass-2)]">{s.internalTotal} / 50</span>
              },
              {
                header: 'Grade Standing',
                accessor: 'grade',
                render: (s) => <Badge variant={s.grade === 'RA' ? 'fail' : 'pass'}>{s.grade}</Badge>
              }
            ]}
            data={marksData}
          />

          {/* Supporting Assessment Files */}
          <AcademicFilesTable
            files={semFiles}
            recordTypeFilter="Assessment"
            onUploadClick={() => openUploadModal('Assessment')}
            emptyText={`No assessment documents or question papers uploaded yet for Semester ${activeSemester}.`}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: RESULTS
      ========================================================================== */}
      {activeTab === 'results' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="OVERALL PASS RATE"
              value={`${passRate}%`}
              subtitle={`● ${passCount} Passed / ${students.length} Enrolled`}
              valueColor="text-emerald-800"
            />
            <MetricCard
              title="ARREARS / BACKLOGS"
              value={failCount}
              subtitle="● Arrears in Active Semester"
              valueColor={failCount > 0 ? 'text-red-700' : 'text-emerald-800'}
            />
            <MetricCard
              title="OFFICIAL GAZETTES"
              value={semFiles.filter(f => f.recordType === 'Result').length}
              subtitle="● Controller Signed Documents"
              onClick={() => openUploadModal('Result')}
            />
          </div>

          <LedgerTable
            searchPlaceholder="Search semester exam results..."
            searchValue={search}
            onSearchChange={setSearch}
            extraToolbar={
              <button
                onClick={() => openUploadModal('Result')}
                className="btn-brass px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1"
              >
                <span>📤</span> Upload Official Gazette
              </button>
            }
            columns={[
              {
                header: 'Reg No',
                accessor: 'reg',
                render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
              },
              { header: 'Student Name', accessor: 'name' },
              { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
              {
                header: 'Semester SGPA',
                accessor: 'sgpa',
                render: (s) => <span className="font-mono font-bold text-sm text-[var(--brass-2)]">{s.sgpa?.toFixed(2)}</span>
              },
              {
                header: 'Cumulative CGPA',
                accessor: 'cgpa',
                render: (s) => <span className="font-mono font-bold text-sm">{s.cgpa?.toFixed(2)}</span>
              },
              {
                header: 'Standing',
                accessor: 'resultStatus',
                render: (s) => (
                  <Badge variant={s.resultStatus === 'PASS' ? 'pass' : 'fail'}>
                    {s.resultStatus === 'PASS' ? 'PASS (All Clear)' : 'FAIL (Arrears Pending)'}
                  </Badge>
                )
              }
            ]}
            data={students}
          />

          {/* Supporting Result Files */}
          <AcademicFilesTable
            files={semFiles}
            recordTypeFilter="Result"
            onUploadClick={() => openUploadModal('Result')}
            emptyText={`No official exam result gazettes uploaded for Semester ${activeSemester}.`}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 4: ACTIVITIES & PORTFOLIOS
      ========================================================================== */}
      {activeTab === 'activities' && (
        <div className="space-y-6 animate-fadeIn">
          <LedgerTable
            searchPlaceholder="Search co-curricular activities & OD requests..."
            searchValue={search}
            onSearchChange={setSearch}
            extraToolbar={
              <button
                onClick={() => openUploadModal('Activity Portfolio')}
                className="btn-brass px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1"
              >
                <span>📤</span> Upload Activity Evidence
              </button>
            }
            columns={[
              {
                header: 'Activity ID',
                accessor: 'id',
                render: (a) => <span className="font-mono font-bold text-[var(--brass-2)]">{a.id}</span>
              },
              {
                header: 'Student',
                accessor: 'studentName',
                render: (a) => (
                  <div className="font-mono text-xs">
                    <div className="font-bold text-[var(--ink)]">{a.studentName}</div>
                    <div className="text-[10px] text-[var(--slate)]">{a.reg}</div>
                  </div>
                )
              },
              {
                header: 'Event Details',
                accessor: 'title',
                render: (a) => (
                  <div>
                    <div className="font-bold text-[var(--ink)]">{a.title}</div>
                    <div className="text-[10px] font-mono text-[var(--slate)]">{a.org} • {a.date}</div>
                  </div>
                )
              },
              {
                header: 'Category',
                accessor: 'category',
                render: (a) => <Badge variant="ink">{a.category}</Badge>
              },
              {
                header: 'On-Duty (OD)',
                accessor: 'od',
                render: (a) => (
                  <span className={`font-mono text-xs font-bold ${a.od ? 'text-amber-700' : 'text-[var(--slate)]'}`}>
                    {a.od ? '⚡ OD Claimed' : '—'}
                  </span>
                )
              },
              {
                header: 'Status & Decision',
                accessor: 'status',
                render: (a) => (
                  <div className="flex items-center gap-2">
                    <Badge variant={a.status === 'VERIFIED' ? 'pass' : a.status === 'REJECTED' ? 'fail' : 'amber'}>
                      {a.status}
                    </Badge>
                    {a.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => verifyActivity(a.id, 'VERIFIED', 'Sanctioned by Administrator.')}
                          className="px-2 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-mono font-bold hover:bg-emerald-800"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => verifyActivity(a.id, 'REJECTED', 'Declined by Administrator.')}
                          className="px-2 py-0.5 bg-red-700 text-white rounded text-[10px] font-mono font-bold hover:bg-red-800"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                )
              }
            ]}
            data={semActivities}
          />

          {/* Supporting Activity Portfolio Files */}
          <AcademicFilesTable
            files={semFiles}
            recordTypeFilter="Activity Portfolio"
            onUploadClick={() => openUploadModal('Activity Portfolio')}
            emptyText={`No student activity certificates or portfolio files uploaded for Semester ${activeSemester}.`}
          />
        </div>
      )}

      {/* Universal Upload Modal */}
      <AcademicFileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        defaultRecordType={uploadDefaultType}
        onUploadSuccess={(count) => alert(`Successfully uploaded ${count} academic file(s) into Semester ${activeSemester} records!`)}
      />
    </div>
  );
};

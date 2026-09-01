import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { Modal } from '../../../components/ui/Modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const StudentResultsPage = () => {
  const { activeSemester, examResults, submitRevaluationRequest } = useAcademic();
  const { user } = useAuth();

  const [selectedSemester, setSelectedSemester] = useState(activeSemester || 1);
  const [revalModalOpen, setRevalModalOpen] = useState(false);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [revalReason, setRevalReason] = useState('');
  const [revalSuccess, setRevalSuccess] = useState(false);

  const history = examResults?.history || [];
  const currentSemRecord = history.find(h => h.semester === selectedSemester) || null;
  const subjects = currentSemRecord?.subjects || [];

  const exportHeaders = ['Subject Code', 'Subject Name', 'Credits', 'Internal (50)', 'External (50)', 'Total (100)', 'Letter Grade', 'Grade Point', 'Result'];
  const exportRows = subjects.map(s => [
    s.code,
    s.name,
    s.credits,
    s.internal,
    s.external,
    s.total,
    s.grade,
    s.gradePoint,
    s.result
  ]);

  // Official PDF Marks Card Generator using jsPDF & autotable
  const handleDownloadOfficialPDF = () => {
    if (!currentSemRecord) {
      alert("No published result record found for the selected semester.");
      return;
    }

    const doc = new jsPDF();

    // College Header Banner
    doc.setFillColor(27, 42, 74); // #1B2A4A
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(245, 232, 201); // Brass Gold
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.text('BCAFLY DEPARTMENT ACADEMIC PLATFORM', 105, 14, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('AFFILIATED UNIVERSITY • DEPARTMENT OF COMPUTER APPLICATIONS', 105, 22, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('OFFICIAL PROVISIONAL STATEMENT OF MARKS / GRADE CARD', 105, 30, { align: 'center' });

    // Student Information Block
    doc.setTextColor(27, 42, 74);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`STUDENT NAME: ${(user?.name || 'STUDENT').toUpperCase()}`, 14, 48);
    doc.text(`REGISTER / USN: ${(user?.usn || user?.reg || 'UNASSIGNED').toUpperCase()}`, 14, 55);
    doc.text(`SEMESTER: SEMESTER ${selectedSemester}`, 14, 62);

    doc.text(`DEGREE: BACHELOR OF COMPUTER APPLICATIONS (BCA)`, 120, 48);
    doc.text(`ACADEMIC TERM: ${currentSemRecord.term || 'Current Academic Term'}`, 120, 55);
    doc.text(`EXAMINATION STATUS: ${currentSemRecord.resultStatus || 'PENDING'} (${currentSemRecord.remarks || '—'})`, 120, 62);

    // Marks Table
    const tableData = subjects.map(s => [
      s.code,
      s.name,
      s.credits,
      s.internal,
      s.external,
      s.total,
      s.grade,
      s.gradePoint,
      s.result
    ]);

    doc.autoTable({
      startY: 68,
      head: [['Code', 'Course Title', 'Credits', 'CIA (50)', 'ESE (50)', 'Total', 'Grade', 'Point', 'Result']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [27, 42, 74], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 22 },
        1: { cellWidth: 65 },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center', fontStyle: 'bold' },
        6: { halign: 'center', fontStyle: 'bold' },
        7: { halign: 'center' },
        8: { halign: 'center', fontStyle: 'bold' }
      }
    });

    const finalY = (doc.lastAutoTable?.finalY || 100) + 8;

    // Summary Box
    doc.setFillColor(247, 244, 236);
    doc.rect(14, finalY, 182, 22, 'F');
    doc.setDrawColor(217, 210, 190);
    doc.rect(14, finalY, 182, 22, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 42, 74);
    doc.text(`SEMESTER SGPA: ${(currentSemRecord.sgpa || 0).toFixed(2)}`, 20, finalY + 9);
    doc.text(`CUMULATIVE CGPA: ${(examResults?.cgpa || 0).toFixed(2)}`, 85, finalY + 9);
    doc.text(`CREDITS EARNED: ${currentSemRecord.creditsEarned || 0} / ${currentSemRecord.totalCredits || 0}`, 145, finalY + 9);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(91, 100, 120);
    doc.text('Grading Scale: O (90-100), A+ (80-89), A (70-79), B+ (60-69), B (55-59), C (50-54), F (<50 / Reappear)', 20, finalY + 17);

    // Signatures
    const sigY = finalY + 45;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(27, 42, 74);
    doc.text('Prepared & Verified by', 25, sigY);
    doc.text('Head of Department (BCA)', 95, sigY);
    doc.text('Controller of Examinations', 155, sigY);

    doc.save(`BCA_Marks_Card_Sem${selectedSemester}_${user?.usn || user?.reg || 'Student'}.pdf`);
  };

  const handleOpenReval = (subCode) => {
    setSelectedSubjectCode(subCode || (subjects[0]?.code || ''));
    setRevalModalOpen(true);
    setRevalSuccess(false);
  };

  const handleRevalSubmit = (e) => {
    e.preventDefault();
    if (!revalReason.trim()) return;

    submitRevaluationRequest({
      semester: selectedSemester,
      subjectCode: selectedSubjectCode,
      reason: revalReason,
      studentId: user?.id || 'stu-unknown',
      studentName: user?.name || 'Student'
    });

    setRevalSuccess(true);
    setTimeout(() => {
      setRevalModalOpen(false);
      setRevalReason('');
      setRevalSuccess(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🏆</span> OFFICIAL UNIVERSITY EXAMINATION GRADE CARDS
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester Examination Results &amp; Grade Sheets
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Downloadable official marks cards, multi-semester SGPA &amp; CGPA progression, and revaluation request services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadOfficialPDF}
            className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>📥</span> Download Official Grade Card (PDF)
          </button>
          <ExportToolbar
            filename={`bca_grades_sem${selectedSemester}`}
            title={`BCA Semester ${selectedSemester} Grade Statement`}
            subtitle={`Student: ${user?.name || 'Student'} — SGPA: ${currentSemRecord?.sgpa ?? 'N/A'}`}
            headers={exportHeaders}
            rows={exportRows}
          />
        </div>
      </div>

      {/* Semester Selector Tabs & Cumulative CGPA Stats */}
      <div className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 card p-4 bg-white flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[var(--slate)]">
            <span>SELECT SEMESTER:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6].map(sem => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3.5 py-1.5 rounded font-bold transition cursor-pointer ${
                    selectedSemester === sem
                      ? 'bg-[var(--ink)] text-white shadow-2xs'
                      : 'bg-[var(--parchment-2)] text-[var(--ink)] hover:bg-[var(--brass-soft)]'
                  }`}
                >
                  Semester {sem}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-mono text-[var(--slate)]">
            Term: <strong className="text-[var(--ink)]">{currentSemRecord?.term || `Semester ${selectedSemester}`}</strong>
          </div>
        </div>

        <div className="lg:col-span-4 card p-4 bg-white flex items-center justify-between font-mono text-xs">
          <div>
            <span className="text-[var(--slate)] block text-[10px]">CUMULATIVE CGPA:</span>
            <span className="text-xl font-bold text-[var(--brass-2)]">{(examResults?.cgpa || 0).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[var(--slate)] block text-[10px]">TOTAL CREDITS:</span>
            <span className="text-sm font-bold text-[var(--ink)]">{examResults?.totalCreditsEarned || 0} Credits</span>
          </div>
          <div>
            <span className="text-[var(--slate)] block text-[10px]">ARREARS:</span>
            <Badge variant={examResults?.arrearCount === 0 ? 'pass' : 'fail'}>
              {examResults?.arrearCount === 0 ? 'ZERO (CLEAR)' : `${examResults?.arrearCount} Backlogs`}
            </Badge>
          </div>
        </div>
      </div>

      {/* Semester Results Summary Box */}
      {currentSemRecord ? (
        <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <span className="text-[var(--slate)]">SEMESTER SGPA:</span>{' '}
              <span className="font-bold text-base text-[var(--ink)]">{(currentSemRecord.sgpa || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[var(--slate)]">CREDITS EARNED:</span>{' '}
              <span className="font-bold text-base text-[var(--brass-2)]">{currentSemRecord.creditsEarned || 0} / {currentSemRecord.totalCredits || 0}</span>
            </div>
            <div>
              <span className="text-[var(--slate)]">RESULT:</span>{' '}
              <span className="font-bold text-base text-emerald-800">{currentSemRecord.resultStatus || 'PASS'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentSemRecord.remarks && <Badge variant="pass">{currentSemRecord.remarks}</Badge>}
            <button
              onClick={() => handleOpenReval('')}
              className="px-3 py-1 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-bold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer"
            >
              Apply for Revaluation 📝
            </button>
          </div>
        </div>
      ) : null}

      {/* Grade Ledger Table */}
      <div className="card p-5 bg-white">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-2.5">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Semester {selectedSemester} Official Subject Scores &amp; Letter Grades
          </h4>
          <span className="font-mono text-xs text-[var(--slate)]">
            {currentSemRecord?.publishedAt ? `Published: ${currentSemRecord.publishedAt}` : 'No publication record'}
          </span>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Course Code',
              accessor: 'code',
              render: (g) => <span className="font-mono font-bold text-[var(--ink)]">{g.code}</span>
            },
            { header: 'Course Title', accessor: 'name', render: (g) => <span className="font-bold text-xs">{g.name}</span> },
            { header: 'Credits', accessor: 'credits', render: (g) => <span className="font-mono">{g.credits}</span> },
            { header: 'Internal (50)', accessor: 'internal', render: (g) => <span className="font-mono">{g.internal}</span> },
            { header: 'External (50)', accessor: 'external', render: (g) => <span className="font-mono">{g.external}</span> },
            { header: 'Total (100)', accessor: 'total', render: (g) => <span className="font-mono font-bold text-sm text-[var(--ink)]">{g.total}</span> },
            {
              header: 'Letter Grade',
              accessor: 'grade',
              render: (g) => (
                <Badge variant={g.grade === 'O' || g.grade === 'A+' || g.grade === 'A' ? 'pass' : 'amber'}>
                  {g.grade}
                </Badge>
              )
            },
            {
              header: 'Grade Point',
              accessor: 'gradePoint',
              render: (g) => <span className="font-mono font-bold text-[var(--brass-2)]">{g.gradePoint}</span>
            },
            {
              header: 'Result Status',
              accessor: 'result',
              render: (g) => (
                <Badge variant={g.result === 'PASS' ? 'pass' : 'fail'}>
                  {g.result}
                </Badge>
              )
            }
          ]}
          data={subjects}
          emptyMessage={`No published exam results found for Semester ${selectedSemester}.`}
        />
      </div>

      {/* Multi-Semester SGPA Progression Table */}
      {history.length > 0 && (
        <div className="card p-5 bg-white">
          <h4 className="font-display font-bold text-base text-[var(--ink)] mb-3 border-b border-[var(--rule)] pb-2">
            Academic Progression &amp; Semester History
          </h4>

          <div className="grid sm:grid-cols-3 gap-4">
            {history.map(item => (
              <div key={item.semester} className={`p-4 rounded-lg border ${item.semester === selectedSemester ? 'bg-[var(--parchment)] border-[var(--brass)] shadow-2xs' : 'bg-white border-[var(--rule)]'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[var(--ink)]">Semester {item.semester}</span>
                  <Badge variant="pass">SGPA: {(item.sgpa || 0).toFixed(2)}</Badge>
                </div>
                <p className="text-xs font-mono text-[var(--slate)]">{item.term}</p>
                <div className="mt-2 pt-2 border-t border-[var(--rule)] text-[11px] font-mono text-[var(--slate)] flex justify-between">
                  <span>Credits: {item.creditsEarned}</span>
                  <span className="text-emerald-800 font-bold">{item.remarks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revaluation Request Modal */}
      {revalModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setRevalModalOpen(false)}
          title="Apply for Challenge Revaluation / Paper Verification"
        >
          {revalSuccess ? (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-mono text-xs text-center">
              ✓ Revaluation application submitted to Controller of Examinations!
            </div>
          ) : (
            <form onSubmit={handleRevalSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[var(--slate)] font-bold mb-1">SELECT COURSE / SUBJECT:</label>
                <select
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                  className="field-input py-2 text-xs"
                  required
                >
                  <option value="">Select subject for revaluation</option>
                  {subjects.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name} (Current Grade: {s.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--slate)] font-bold mb-1">REASON / JUSTIFICATION FOR REVALUATION:</label>
                <textarea
                  value={revalReason}
                  onChange={(e) => setRevalReason(e.target.value)}
                  rows={3}
                  placeholder="Detail discrepancies in internal/external mark tabulation or request photocopied answer script verification..."
                  className="field-input py-2 text-xs"
                  required
                />
              </div>

              <div className="p-3 bg-[var(--parchment-2)] border border-[var(--rule)] rounded text-[11px] text-[var(--slate)]">
                Note: Standard challenge revaluation fee of ₹500/paper applies upon administrative verification.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevalModalOpen(false)}
                  className="btn-ghost border border-[var(--rule)] px-3 py-1.5 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brass px-4 py-1.5 rounded font-bold">
                  Submit Revaluation Request
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

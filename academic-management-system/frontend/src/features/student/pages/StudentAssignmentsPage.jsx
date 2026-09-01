import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export const StudentAssignmentsPage = () => {
  const { activeSemester, activeWorkspace, assignments, submissions, submitAssignment, saveAssignmentDraft } = useAcademic();
  const { user } = useAuth();

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Submission Form State
  const [subText, setSubText] = useState('');
  const [subLinks, setSubLinks] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const courses = activeWorkspace?.courses || [];
  const currentStudentId = user?.id || '';
  const currentStudentName = user?.name || 'Student';

  const getSubmissionForAssignment = (asgId) => {
    return submissions.find(s => s.assignmentId === asgId && (currentStudentId ? s.studentId === currentStudentId : true));
  };

  const handleOpenSubmission = (asg) => {
    setSelectedAssignment(asg);
    const existing = getSubmissionForAssignment(asg.id);
    if (existing) {
      setSubText(existing.submissionText || '');
      setSubLinks((existing.submissionLinks || []).join(', '));
      setUploadedFiles(existing.uploadedFiles || []);
    } else {
      setSubText('');
      setSubLinks('');
      setUploadedFiles([]);
    }
    setSubmissionModalOpen(true);
    setFeedbackMessage(null);
  };

  const handleSubmit = (isDraft = false) => {
    if (!selectedAssignment) return;

    const linksArray = subLinks
      .split(',')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const isLate = new Date() > new Date(selectedAssignment.dueAt);

    if (isDraft) {
      saveAssignmentDraft({
        assignmentId: selectedAssignment.id,
        studentId: currentStudentId,
        studentName: currentStudentName,
        submissionText: subText,
        submissionLinks: linksArray,
        uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : ['Draft_Solution.zip']
      });
      setFeedbackMessage({ type: 'info', text: 'Draft saved locally. You can finalize and submit anytime before deadline.' });
    } else {
      submitAssignment({
        assignmentId: selectedAssignment.id,
        studentId: currentStudentId,
        studentName: currentStudentName,
        submissionText: subText,
        submissionLinks: linksArray,
        uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : [`${selectedAssignment.courseCode}_Solution_${currentStudentName.replace(/\s+/g, '_')}.pdf`],
        isLate
      });
      setFeedbackMessage({ type: 'success', text: 'Assignment submitted successfully for faculty evaluation!' });
    }

    setTimeout(() => {
      setSubmissionModalOpen(false);
      setFeedbackMessage(null);
    }, 1500);
  };

  const filteredAssignments = assignments.filter(asg => {
    if (courseFilter !== 'ALL' && asg.courseCode !== courseFilter) return false;
    const sub = getSubmissionForAssignment(asg.id);
    const status = sub ? sub.status : 'PENDING';
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📝</span> CONTINUOUS ASSESSMENT SUBMISSIONS
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Course Assignments &amp; Mini Projects
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Submit coursework files, GitHub code repositories, view faculty grading rubrics, and track deadlines.
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="card p-4 bg-white flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[var(--slate)] font-bold">COURSE:</span>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="field-input py-1.5 text-xs w-auto min-w-[180px]"
            >
              <option value="ALL">All Enrolled Courses</option>
              {courses.map(c => (
                <option key={c.id || c.code} value={c.code}>
                  {c.code} - {c.name || c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--slate)] font-bold">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="field-input py-1.5 text-xs w-auto"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Submission</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="GRADED">Graded</option>
              <option value="LATE">Late Submission</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        <span className="text-[var(--slate)] font-semibold">
          Showing {filteredAssignments.length} Assignments
        </span>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="card p-12 text-center text-xs font-mono text-[var(--slate)]">
            No assignments match the selected filter.
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const sub = getSubmissionForAssignment(asg.id);
            const isDuePassed = new Date() > new Date(asg.dueAt);
            const status = sub ? sub.status : isDuePassed ? 'OVERDUE' : 'PENDING';

            return (
              <div key={asg.id} className="card p-6 bg-white hover:border-[var(--brass)] transition">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-2 py-0.5 rounded border border-[var(--brass)]">
                        {asg.courseCode}
                      </span>
                      <span className="text-xs font-mono text-[var(--slate)]">
                        {asg.courseName}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-lg text-[var(--ink)]">
                      {asg.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <Badge variant={status === 'GRADED' ? 'pass' : status === 'SUBMITTED' ? 'ink' : status === 'LATE' || status === 'OVERDUE' ? 'fail' : 'amber'}>
                      {status}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-[var(--slate)] mb-3 leading-relaxed">
                  {asg.description}
                </p>

                {asg.instructions && (
                  <div className="p-3 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg mb-4 text-xs font-mono text-[var(--ink)] space-y-1">
                    <strong className="text-[var(--brass-2)] block uppercase tracking-wider text-[10px]">Evaluation Instructions:</strong>
                    <p>{asg.instructions}</p>
                  </div>
                )}

                {/* Submissions feedback or action row */}
                <div className="mt-4 pt-4 border-t border-[var(--rule)] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-4 flex-wrap text-[var(--slate)]">
                    <div>
                      Due Date: <strong className="text-[var(--ink)]">{new Date(asg.dueAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                    </div>
                    <div>
                      Weightage: <strong className="text-[var(--brass-2)]">{asg.maxMarks} Max Marks</strong>
                    </div>
                    <div>
                      Assigned by: <strong className="text-[var(--ink)]">{asg.createdBy}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {sub && sub.status === 'GRADED' ? (
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded text-emerald-900">
                        <span>Score: <strong>{sub.marksObtained} / {asg.maxMarks}</strong></span>
                        {sub.feedback && (
                          <span className="text-[11px] text-emerald-800 italic" title={sub.feedback}>
                            &ldquo;{sub.feedback}&rdquo;
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenSubmission(asg)}
                        className={`px-4 py-2 rounded text-xs font-mono font-bold transition cursor-pointer shadow-xs ${
                          sub ? 'btn-ghost border border-[var(--ink)] text-[var(--ink)]' : 'btn-brass'
                        }`}
                      >
                        {sub ? '✏️ Update / Resubmit' : '📤 Submit Assignment'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Modal */}
      {submissionModalOpen && selectedAssignment && (
        <Modal
          isOpen={true}
          onClose={() => setSubmissionModalOpen(false)}
          title={`Assignment Submission — ${selectedAssignment.courseCode}`}
        >
          <div className="space-y-4 font-sans text-xs">
            {feedbackMessage && (
              <div className={`p-3 rounded font-mono text-xs ${feedbackMessage.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-blue-100 text-blue-900'}`}>
                {feedbackMessage.text}
              </div>
            )}

            <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg">
              <h4 className="font-bold text-[var(--ink)] text-sm mb-1">{selectedAssignment.title}</h4>
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--slate)]">
                <span>Max Marks: <strong>{selectedAssignment.maxMarks}</strong></span>
                <span>Deadline: <strong>{new Date(selectedAssignment.dueAt).toLocaleDateString('en-GB')}</strong></span>
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">
                Solution Notes / Write-up:
              </label>
              <textarea
                rows={4}
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                placeholder="Enter summary of your approach, algorithms implemented, or query execution proofs..."
                className="field-input font-sans text-xs"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">
                External Project Link (GitHub / Google Drive / Live Demo):
              </label>
              <input
                type="url"
                value={subLinks}
                onChange={(e) => setSubLinks(e.target.value)}
                placeholder="https://github.com/username/project-repo"
                className="field-input text-xs"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">
                Upload Solution File (PDF, DOCX, ZIP, SQL):
              </label>
              <div className="p-4 bg-[var(--parchment-2)] border-2 border-dashed border-[var(--rule)] rounded-lg text-center">
                <p className="text-xs text-[var(--slate)] font-mono mb-2">
                  Attach your compiled report or project source code
                </p>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedFiles([e.target.files[0].name]);
                    }
                  }}
                  className="text-xs font-mono"
                />
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 text-xs font-mono text-emerald-800 font-bold">
                    📎 Selected: {uploadedFiles.join(', ')}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--rule)] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="btn-ghost px-3.5 py-2 rounded text-xs font-mono font-bold border border-[var(--rule)] cursor-pointer"
              >
                💾 Save as Draft
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubmissionModalOpen(false)}
                  className="px-3 py-2 rounded text-xs font-mono text-[var(--slate)] hover:text-[var(--ink)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold shadow-xs cursor-pointer"
                >
                  Finalize &amp; Submit →
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

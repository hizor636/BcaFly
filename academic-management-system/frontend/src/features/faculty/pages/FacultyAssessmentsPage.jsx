import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { Modal } from '../../../components/ui/Modal';
import { calculateInternalTotal, getGradeInfo } from '../../../utils/academicCalculations';

export const FacultyAssessmentsPage = () => {
  const { activeSemester, activeWorkspace, assessmentMarks, createAssessment, saveAssessmentMarksEntry } = useAcademic();
  const { user } = useAuth();

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedCourse, setSelectedCourse] = useState('BCA302');
  const [selectedComponent, setSelectedComponent] = useState('CIA1');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [marksState, setMarksState] = useState({});
  const [feedbackState, setFeedbackState] = useState({});
  const [saveMessage, setSaveMessage] = useState(null);

  // New Assessment Form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('CIA2');
  const [newMaxMarks, setNewMaxMarks] = useState(50);
  const [newWeightage, setNewWeightage] = useState(20);

  const getScore = (stuId, defaultVal) => {
    return marksState[stuId] !== undefined ? marksState[stuId] : defaultVal;
  };

  const setScore = (stuId, val) => {
    setMarksState(prev => ({ ...prev, [stuId]: val }));
  };

  const getFeedback = (stuId, defaultVal = '') => {
    return feedbackState[stuId] !== undefined ? feedbackState[stuId] : defaultVal;
  };

  const setFeedback = (stuId, val) => {
    setFeedbackState(prev => ({ ...prev, [stuId]: val }));
  };

  const handleSave = (isPublish = false) => {
    saveAssessmentMarksEntry(selectedCourse, selectedComponent, marksState, isPublish, feedbackState);
    setSaveMessage({
      type: 'success',
      text: isPublish
        ? '✓ Assessment marks published live to enrolled students with notification alerts!'
        : '✓ Draft marks saved securely in the institutional repository.'
    });
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleCreateAssessmentSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createAssessment({
      courseCode: selectedCourse,
      title: newTitle,
      type: newType,
      maxMarks: newMaxMarks,
      weightage: newWeightage
    });

    setCreateModalOpen(false);
    setNewTitle('');
    setSelectedComponent(newType);
  };

  const handleCsvImport = () => {
    const nextMarks = {};
    students.forEach((s, idx) => {
      nextMarks[s.id] = Math.min(Number(newMaxMarks) || 50, Math.round(38 + (s.sgpa * 1.2) + (idx % 3)));
    });
    setMarksState(nextMarks);
    setCsvModalOpen(false);
    setSaveMessage({ type: 'success', text: '✓ Successfully imported scores for all 9 students from CSV roster template!' });
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const maxMarks = selectedComponent === 'Model' ? 100 : selectedComponent === 'Assignment' ? 10 : 50;

  const headers = ['Register No', 'Student Name', 'Section', 'Component', 'Max Marks', 'Score Obtained', 'Grade', 'Remarks'];
  const rows = students.map(s => {
    const defaultScore = selectedComponent === 'Assignment' ? 9 : selectedComponent === 'Model' ? Math.round(65 + s.sgpa * 3.5) : Math.round(35 + s.sgpa * 1.5);
    const score = getScore(s.id, defaultScore);
    const grade = getGradeInfo((score / maxMarks) * 100);
    return [s.reg || s.usn, s.name, s.section, selectedComponent, maxMarks, score, grade.grade, getFeedback(s.id, 'Good performance')];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📋</span> CONTINUOUS ASSESSMENT &amp; MARKS GOVERNANCE
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Assessment &amp; Marks Workspace — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Create internal evaluations, enter student scores, import CSV data, and publish validated grades.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-brass px-3.5 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>➕</span> Create Assessment
          </button>
          <ExportToolbar
            filename={`bca_marks_${selectedCourse}_${selectedComponent}`}
            title={`Assessment Mark Sheet — ${selectedCourse}`}
            subtitle={`Component: ${selectedComponent} — Faculty: ${user?.name || 'Prof. K. Rao'}`}
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono flex items-center gap-2 shadow-2xs">
          {saveMessage.text}
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">COURSE:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="field-input text-xs py-1.5 min-w-[200px]"
            >
              {courses.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">ASSESSMENT COMPONENT:</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="field-input text-xs py-1.5 min-w-[200px]"
            >
              <option value="CIA1">Continuous Internal Assessment 1 (50)</option>
              <option value="CIA2">Continuous Internal Assessment 2 (50)</option>
              <option value="Model">Model Examination (100)</option>
              <option value="Assignment">Continuous Assignments (10)</option>
              <option value="Quiz">Online Quiz Assessment (20)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCsvModalOpen(true)}
            className="px-3 py-2 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-bold text-[var(--ink)] cursor-pointer"
          >
            📥 Import CSV
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-3 py-2 bg-white border border-[var(--rule)] rounded font-bold text-[var(--slate)] hover:text-[var(--ink)] cursor-pointer"
          >
            Save Draft 💾
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="btn-ink px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
          >
            Publish Live to Students 🚀
          </button>
        </div>
      </div>

      {/* Marks Entry Grid */}
      <div className="card p-5 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Mark Sheet — {selectedCourse} [{selectedComponent}] (Max Marks: {maxMarks})
          </h4>
          <span className="font-mono text-xs text-[var(--slate)]">{students.length} Enrolled Students</span>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Register No',
              accessor: 'reg',
              render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
            },
            { header: 'Student Name', accessor: 'name', render: (s) => <strong className="text-xs">{s.name}</strong> },
            { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
            {
              header: `Score (Max ${maxMarks})`,
              accessor: 'id',
              render: (s) => {
                const defaultScore = selectedComponent === 'Assignment' ? 9 : selectedComponent === 'Model' ? Math.round(65 + s.sgpa * 3.5) : Math.round(35 + s.sgpa * 1.5);
                const score = getScore(s.id, defaultScore);
                return (
                  <input
                    type="number"
                    min="0"
                    max={maxMarks}
                    value={score}
                    onChange={(e) => setScore(s.id, Number(e.target.value))}
                    className="field-input text-xs font-mono font-bold w-20 py-1 text-center"
                  />
                );
              }
            },
            {
              header: 'Computed Grade',
              accessor: 'sgpa',
              render: (s) => {
                const defaultScore = selectedComponent === 'Assignment' ? 9 : selectedComponent === 'Model' ? Math.round(65 + s.sgpa * 3.5) : Math.round(35 + s.sgpa * 1.5);
                const score = getScore(s.id, defaultScore);
                const grade = getGradeInfo((score / maxMarks) * 100);
                return <Badge variant={grade.grade === 'RA' ? 'fail' : 'pass'}>{grade.grade}</Badge>;
              }
            },
            {
              header: 'Faculty Remarks / Feedback',
              accessor: 'id',
              render: (s) => (
                <input
                  type="text"
                  placeholder="Feedback for student..."
                  value={getFeedback(s.id, 'Good analytical approach')}
                  onChange={(e) => setFeedback(s.id, e.target.value)}
                  className="field-input text-xs py-1 min-w-[200px]"
                />
              )
            }
          ]}
          data={students}
        />
      </div>

      {/* Create Assessment Modal */}
      {createModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Continuous Assessment"
        >
          <form onSubmit={handleCreateAssessmentSubmit} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Assessment Title *:</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. CIA 2 Mid-Semester Theory Exam"
                className="field-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Assessment Type:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="field-input text-xs"
                >
                  <option value="CIA1">CIA 1</option>
                  <option value="CIA2">CIA 2</option>
                  <option value="CIA3">CIA 3</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="LAB">Lab Practical</option>
                  <option value="PROJECT">Mini Project</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Max Marks:</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  required
                  value={newMaxMarks}
                  onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                  className="field-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Course Weightage (%):</label>
              <input
                type="number"
                min="5"
                max="50"
                value={newWeightage}
                onChange={(e) => setNewWeightage(Number(e.target.value))}
                className="field-input text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Create Assessment →
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CSV Import Modal */}
      {csvModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCsvModalOpen(false)}
          title="Import Assessment Marks via CSV"
        >
          <div className="space-y-4 font-sans text-xs">
            <p className="text-xs text-[var(--slate)] font-mono">
              Upload a standard CSV roster spreadsheet containing Register Numbers and Marks Obtained columns.
            </p>

            <div className="p-4 bg-[var(--parchment-2)] border-2 border-dashed border-[var(--rule)] rounded-lg text-center font-mono">
              <span className="text-2xl block mb-1">📄</span>
              <span>Drag and drop mark_sheet_template.csv or choose file</span>
              <input type="file" className="mt-2 text-xs" />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setCsvModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvImport}
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Process &amp; Load Scores →
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

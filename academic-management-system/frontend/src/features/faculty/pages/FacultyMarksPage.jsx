import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { calculateInternalTotal, getGradeInfo } from '../../../utils/academicCalculations';

export const FacultyMarksPage = () => {
  const { activeSemester, activeWorkspace, logAction } = useAcademic();
  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code || 'BCA302');
  const [componentType, setComponentType] = useState('CIA1');
  const [marksState, setMarksState] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const getScore = (stuId, defaultVal) => {
    return marksState[stuId] !== undefined ? marksState[stuId] : defaultVal;
  };

  const setScore = (stuId, val) => {
    setMarksState(prev => ({ ...prev, [stuId]: val }));
  };

  const handleSaveMarks = (e) => {
    e.preventDefault();
    logAction(
      'Faculty Assessment Entered',
      `Saved ${componentType} marks entry for course ${selectedCourse} (Semester ${activeSemester}).`,
      'Faculty Instructor',
      'FACULTY'
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const headers = ['Register No', 'Student Name', 'Section', 'Component', 'Max Marks', 'Score Obtained', 'Grade'];
  const rows = students.map(s => {
    const score = getScore(s.id, Math.round(35 + (s.sgpa * 1.5)));
    const grade = getGradeInfo((score / 50) * 100);
    return [s.reg || s.usn, s.name, s.section, componentType, '50', score, grade.grade];
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Assessment Marks Entry — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Enter CIA 1, CIA 2, Model exams, and assignment marks with automatic total and grade computation.
          </p>
        </div>
        <ExportToolbar
          filename={`bca_sem${activeSemester}_faculty_marks_${selectedCourse}`}
          title={`Faculty Assessment Score Sheet — ${selectedCourse}`}
          subtitle={`Component: ${componentType}`}
          headers={headers}
          rows={rows}
        />
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-mono mb-4 flex items-center gap-2">
          <span>✓</span> Assessment marks saved and submitted to institutional record!
        </div>
      )}

      {/* Course & Component Filter */}
      <form onSubmit={handleSaveMarks} className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-mono font-bold text-[var(--slate)] uppercase mb-1">COURSE:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="field-input text-xs py-1 min-w-[200px]"
            >
              {courses.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-[var(--slate)] uppercase mb-1">ASSESSMENT COMPONENT:</label>
            <select
              value={componentType}
              onChange={(e) => setComponentType(e.target.value)}
              className="field-input text-xs py-1 min-w-[180px]"
            >
              <option value="CIA1">Continuous Internal Assessment 1 (Max: 50)</option>
              <option value="CIA2">Continuous Internal Assessment 2 (Max: 50)</option>
              <option value="Model">Model Examination (Max: 100)</option>
              <option value="Assignment">Assignments / Seminars (Max: 10)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn-ink px-4 py-1.5 rounded text-xs font-mono font-bold shadow-xs"
        >
          💾 Save &amp; Validate Scores
        </button>
      </form>

      <LedgerTable
        columns={[
          {
            header: 'Reg No',
            accessor: 'reg',
            render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
          },
          { header: 'Student Name', accessor: 'name' },
          { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
          {
            header: `Score (${componentType === 'Model' ? 'Max 100' : componentType === 'Assignment' ? 'Max 10' : 'Max 50'})`,
            accessor: 'id',
            render: (s) => {
              const defaultScore = componentType === 'Assignment' ? 9 : componentType === 'Model' ? Math.round(65 + s.sgpa * 3.5) : Math.round(35 + s.sgpa * 1.5);
              const val = getScore(s.id, defaultScore);
              return (
                <input
                  type="number"
                  min="0"
                  max={componentType === 'Model' ? 100 : componentType === 'Assignment' ? 10 : 50}
                  value={val}
                  onChange={(e) => setScore(s.id, Number(e.target.value))}
                  className="field-input text-xs font-mono font-bold w-24 py-1"
                />
              );
            }
          },
          {
            header: 'Estimated Grade',
            accessor: 'sgpa',
            render: (s) => {
              const defaultScore = componentType === 'Assignment' ? 9 : componentType === 'Model' ? Math.round(65 + s.sgpa * 3.5) : Math.round(35 + s.sgpa * 1.5);
              const val = getScore(s.id, defaultScore);
              const max = componentType === 'Model' ? 100 : componentType === 'Assignment' ? 10 : 50;
              const grade = getGradeInfo((val / max) * 100);
              return (
                <Badge variant={grade.grade === 'RA' ? 'fail' : 'pass'}>
                  {grade.grade} ({grade.label})
                </Badge>
              );
            }
          }
        ]}
        data={students}
      />
    </div>
  );
};

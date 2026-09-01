import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const StudentMarksPage = () => {
  const { activeSemester, assessmentMarks } = useAcademic();
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  const filteredMarks = (assessmentMarks || []).filter(m => {
    if (selectedCourse !== 'ALL' && m.courseCode !== selectedCourse) return false;
    return true;
  });

  const exportHeaders = ['Course Code', 'Course Name', 'Component', 'Max Marks', 'Marks Obtained', 'Weightage %', 'Status', 'Faculty Feedback'];
  const exportRows = [];
  (assessmentMarks || []).forEach(c => {
    (c.components || []).forEach(comp => {
      exportRows.push([
        c.courseCode,
        c.courseName,
        comp.title,
        comp.maxMarks,
        comp.marksObtained !== null ? comp.marksObtained : 'Pending Evaluation',
        `${comp.weightage}%`,
        comp.status,
        comp.feedback || '—'
      ]);
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📋</span> CONTINUOUS INTERNAL ASSESSMENT (CIA) BREAKDOWN
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Assessment Marks &amp; Component Breakdown — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Detailed evaluation statements across IA1, IA2, assignments, quizzes, practical labs, and faculty feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename={`bca_assessment_marks_sem${activeSemester}`}
            title={`BCA Semester ${activeSemester} Continuous Assessment Statement`}
            subtitle={`Student: ${user?.name || 'Student'}`}
            headers={exportHeaders}
            rows={exportRows}
          />
        </div>
      </div>

      {/* Course Filter Bar */}
      <div className="card p-4 bg-white flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[var(--slate)] font-bold">FILTER SUBJECT:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="field-input py-1.5 text-xs w-auto min-w-[200px]"
          >
            <option value="ALL">All Subjects &amp; Practical Labs</option>
            {(assessmentMarks || []).map(c => (
              <option key={c.courseCode} value={c.courseCode}>
                {c.courseCode} - {c.courseName}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[var(--slate)] font-semibold">
          Displaying {filteredMarks.length} Subject Ledgers
        </div>
      </div>

      {/* Subject-Wise Assessment Cards */}
      <div className="space-y-6">
        {filteredMarks.length === 0 ? (
          <div className="card p-12 text-center text-xs font-mono text-[var(--slate)] bg-white border border-[var(--rule)] rounded-lg">
            No assessment marks or continuous evaluation ledgers recorded for Semester {activeSemester}.
          </div>
        ) : (
          filteredMarks.map((course) => (
            <div key={course.courseCode} className="card p-6 bg-white shadow-2xs space-y-4">
              {/* Subject Header */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[var(--rule)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-2 py-0.5 rounded border border-[var(--brass)]">
                      {course.courseCode}
                    </span>
                    <span className="text-xs font-mono text-[var(--slate)]">{course.credits} Credits</span>
                  </div>
                  <h4 className="font-display font-bold text-lg text-[var(--ink)]">
                    {course.courseName}
                  </h4>
                  <p className="text-xs font-mono text-[var(--slate)]">
                    Instructor: <strong className="text-[var(--ink)]">{course.facultyName || 'Department Faculty'}</strong>
                  </p>
                </div>

                <div className="bg-[var(--parchment-2)] border border-[var(--rule)] p-3 rounded-lg flex items-center gap-4 text-xs font-mono text-right">
                  <div>
                    <span className="text-[var(--slate)] block text-[10px]">INTERNAL TOTAL (OUT OF 50):</span>
                    <span className="text-lg font-bold text-[var(--brass-2)]">{course.internalTotal ?? 0} / 50</span>
                  </div>
                  <div>
                    <span className="text-[var(--slate)] block text-[10px]">ESTIMATED GRADE:</span>
                    <Badge variant="pass">{course.estimatedGrade || 'PENDING'}</Badge>
                  </div>
                </div>
              </div>

              {/* Components Ledger Table */}
              <LedgerTable
                columns={[
                  {
                    header: 'Component',
                    accessor: 'title',
                    render: (comp) => (
                      <div>
                        <div className="font-bold text-xs text-[var(--ink)]">{comp.title}</div>
                        <span className="text-[10px] font-mono text-[var(--slate)]">Type: {comp.type}</span>
                      </div>
                    )
                  },
                  {
                    header: 'Max Marks',
                    accessor: 'maxMarks',
                    render: (comp) => <span className="font-mono font-semibold">{comp.maxMarks}</span>
                  },
                  {
                    header: 'Obtained Marks',
                    accessor: 'marksObtained',
                    render: (comp) => (
                      <span className="font-mono font-bold text-sm text-[var(--ink)]">
                        {comp.marksObtained !== null ? (
                          <strong className="text-emerald-800">{comp.marksObtained}</strong>
                        ) : (
                          <span className="text-[var(--slate)] font-normal italic">Pending</span>
                        )}
                      </span>
                    )
                  },
                  {
                    header: 'Weightage',
                    accessor: 'weightage',
                    render: (comp) => <span className="font-mono text-xs text-[var(--slate)]">{comp.weightage}%</span>
                  },
                  {
                    header: 'Status',
                    accessor: 'status',
                    render: (comp) => (
                      <Badge variant={comp.status === 'PUBLISHED' ? 'pass' : 'lock'}>
                        {comp.status === 'PUBLISHED' ? 'PUBLISHED ✓' : 'DRAFT / SCHEDULED'}
                      </Badge>
                    )
                  },
                  {
                    header: 'Faculty Remarks & Feedback',
                    accessor: 'feedback',
                    render: (comp) => (
                      <span className="text-xs font-sans text-[var(--slate)] italic">
                        {comp.feedback ? `“${comp.feedback}”` : '—'}
                      </span>
                    )
                  }
                ]}
                data={course.components || []}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from './Modal';

export const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.txt,.rtf,.odt,.csv,.xls,.xlsx,.ods,.ppt,.pptx,.odp,.jpg,.jpeg,.png,.webp,.gif,.mp3,.wav,.mp4,.webm,.zip,.rar,.7z,.json,.xml,.py,.java,.js,.html,.css,.sql';

export const AcademicFileUploadModal = ({ isOpen, onClose, defaultRecordType = 'Assessment', onUploadSuccess }) => {
  const { activeSemester, activeWorkspace, uploadAcademicFiles } = useAcademic();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [recordType, setRecordType] = useState(defaultRecordType);
  const [courseCode, setCourseCode] = useState('ALL');
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('All');
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = (files) => {
    setErrorMessage('');
    const fileArray = Array.from(files);
    if (fileArray.length > 10) {
      setErrorMessage('Maximum 10 files allowed in a single upload.');
      return;
    }

    // Check size limit (25MB)
    for (let f of fileArray) {
      if (f.size > 25 * 1024 * 1024) {
        setErrorMessage(`File "${f.name}" exceeds the 25 MB limit.`);
        return;
      }
    }

    setSelectedFiles(fileArray);
    if (!title && fileArray.length === 1) {
      setTitle(fileArray[0].name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
  };

  const handleDrag = (e, val) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(val);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedFiles.length === 0) {
      setErrorMessage('Please select or drag at least one file to upload.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please provide a title for this academic record.');
      return;
    }

    setIsUploading(true);

    const targetStudent = students.find(s => s.id === studentId || s.reg === studentId);

    const metadata = {
      sem: activeSemester,
      recordType,
      courseCode,
      studentId: studentId || null,
      studentName: targetStudent ? targetStudent.name : 'All Students',
      title,
      description,
      visibility
    };

    const res = uploadAcademicFiles(
      metadata,
      selectedFiles,
      user?.name || 'Administrator',
      user?.role || 'ADMIN'
    );

    setIsUploading(false);

    if (res.success) {
      setSelectedFiles([]);
      setTitle('');
      setDescription('');
      if (onUploadSuccess) onUploadSuccess(res.count);
      onClose();
    } else {
      setErrorMessage(res.message || 'Upload failed.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Upload Academic Evidence & Files — Semester ${activeSemester}`}
      tag="SEMESTER GOVERNANCE"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-mono">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Universal Dropzone */}
        <div
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition ${
            isDragOver ? 'border-[var(--brass)] bg-[var(--brass-soft)]' : 'border-[var(--rule)] bg-[var(--parchment-2)] hover:border-[var(--brass)]'
          }`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS}
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <div className="text-3xl mb-1">📤</div>
          <div className="text-xs font-mono font-bold text-[var(--ink)]">
            Click to Browse or Drag &amp; Drop Academic Files
          </div>
          <div className="text-[11px] text-[var(--slate)] mt-1">
            Supports PDF, Office (Word/Excel/PPT), Images, Media, ZIP, and Code files (Max 25 MB/file, up to 10 files)
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--rule)] text-left">
              <div className="text-[10px] font-mono font-bold text-[var(--brass-2)] uppercase mb-1">
                Selected {selectedFiles.length} File(s):
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="text-xs font-mono text-[var(--ink)] flex items-center justify-between bg-white px-2 py-1 rounded border border-[var(--rule)]">
                    <span className="truncate max-w-md">📄 {f.name}</span>
                    <span className="text-[10px] text-[var(--slate)] shrink-0 font-bold">
                      {(f.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metadata Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">
              Target Semester:
            </label>
            <input
              type="text"
              disabled
              value={`Semester ${activeSemester} (${activeWorkspace?.batch || 'Active'})`}
              className="field-input text-xs bg-[var(--parchment-2)] cursor-not-allowed font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">
              Record Category:
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="field-input text-xs"
            >
              <option value="Attendance">⏱️ Attendance Record / Shortage Letter</option>
              <option value="Assessment">📝 CIA / Assessment Scoresheet / Question Paper</option>
              <option value="Result">🏆 Official Results / University Gazette</option>
              <option value="Activity Portfolio">🎖️ Student Activity / Cert / OD Evidence</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">
              Related Course:
            </label>
            <select
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="field-input text-xs"
            >
              <option value="ALL">All Semester {activeSemester} Courses (Department-Wide)</option>
              {courses.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name || c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">
              Student (Optional / Specific):
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="field-input text-xs"
            >
              <option value="">All Enrolled Students (Course-Level)</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.reg || s.usn})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">
            Record Title: <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. CIA 1 RDBMS Official Score Ledger"
            className="field-input text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">
            Description &amp; Remarks:
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Duly verified by course instructor and HOD for NAAC compliance."
            className="field-input text-xs resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">
              Access &amp; Visibility:
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="field-input text-xs min-h-[40px]"
            >
              <option value="All">All Roles (Admin, Faculty, Students)</option>
              <option value="Faculty & Admin">Faculty &amp; Administrators Only</option>
              <option value="Admin Only">Confidential (Administrator &amp; HOD Only)</option>
            </select>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-end justify-end gap-2 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost border border-[var(--rule)] px-4 py-2 rounded text-xs font-mono min-h-[40px] w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="btn-brass px-5 py-2 rounded text-xs font-mono font-bold shadow-xs flex items-center justify-center gap-1.5 min-h-[40px] w-full sm:w-auto"
            >
              {isUploading ? 'Uploading...' : 'Confirm & Save Upload 📤'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

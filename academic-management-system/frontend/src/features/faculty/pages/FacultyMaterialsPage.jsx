import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export const FacultyMaterialsPage = () => {
  const { activeSemester, activeWorkspace, courseMaterials, uploadCourseMaterial, deleteCourseMaterial } = useAcademic();
  const { user } = useAuth();

  const courses = activeWorkspace?.courses || [];

  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Upload Form
  const [formCourse, setFormCourse] = useState(courses[0]?.code || 'BCA302');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('PDF');
  const [formUnit, setFormUnit] = useState(1);
  const [formSize, setFormSize] = useState('3.2 MB');

  const filteredMaterials = courseMaterials.filter(m => {
    if (selectedCourse !== 'ALL' && m.courseCode !== selectedCourse) return false;
    if (selectedUnit !== 'ALL' && m.unitNumber !== Number(selectedUnit)) return false;
    if (selectedType !== 'ALL' && m.materialType !== selectedType) return false;
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase()) && !m.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    uploadCourseMaterial({
      courseCode: formCourse,
      title: formTitle,
      description: formDesc,
      materialType: formType,
      unitNumber: formUnit,
      fileSize: formSize,
      uploadedBy: user?.name || 'Prof. K. Rao'
    });

    setUploadModalOpen(false);
    setFormTitle('');
    setFormDesc('');
    setActionSuccess('✓ Course study material successfully uploaded and published to students!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this course resource?')) {
      deleteCourseMaterial(id);
      setActionSuccess('✓ Resource removed.');
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📁</span> REPOSITORY &amp; COURSEWARE GOVERNANCE
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Course Study Materials Management — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Unit-wise lecture notes, slide presentations, laboratory manuals, reference e-books, and code samples.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>➕</span> Upload Course Resource
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          {actionSuccess}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card p-4 bg-white flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">COURSE:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="field-input text-xs py-1 min-w-[150px]"
            >
              <option value="ALL">All Courses</option>
              {courses.map(c => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">UNIT:</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="field-input text-xs py-1 min-w-[100px]"
            >
              <option value="ALL">All Units</option>
              <option value="1">Unit 1</option>
              <option value="2">Unit 2</option>
              <option value="3">Unit 3</option>
              <option value="4">Unit 4</option>
              <option value="5">Unit 5</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">TYPE:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="field-input text-xs py-1 min-w-[120px]"
            >
              <option value="ALL">All Types</option>
              <option value="PDF">PDF Document</option>
              <option value="PPT">PPT Slide Deck</option>
              <option value="VIDEO">Video Lecture</option>
              <option value="REFERENCE">Reference Book</option>
              <option value="CODE_SAMPLE">Code Sample</option>
              <option value="LAB_MANUAL">Lab Manual</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[var(--slate)] uppercase mb-1">SEARCH:</label>
          <input
            type="text"
            placeholder="Search topic or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field-input text-xs py-1 min-w-[200px]"
          />
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="card p-5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] shadow-2xs flex flex-col justify-between space-y-3 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-2 py-0.5 rounded border border-[var(--brass)]">
                  {mat.courseCode} • Unit {mat.unitNumber}
                </span>
                <Badge variant={mat.materialType === 'PDF' ? 'ink' : mat.materialType === 'VIDEO' ? 'amber' : 'pass'}>
                  {mat.materialType}
                </Badge>
              </div>

              <h4 className="font-display font-bold text-sm text-[var(--ink)] line-clamp-1">
                {mat.title}
              </h4>
              <p className="text-xs text-[var(--slate)] font-sans line-clamp-2 mt-1">
                {mat.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--rule)]">
              <div className="flex justify-between items-center text-[10px] font-mono text-[var(--slate)]">
                <span>Size: <strong>{mat.fileSize}</strong></span>
                <span>Published: {new Date(mat.publishedAt).toLocaleDateString('en-GB')}</span>
              </div>

              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <button
                  onClick={() => setPreviewMaterial(mat)}
                  className="flex-1 py-1.5 bg-[var(--parchment-2)] hover:bg-[var(--brass-soft)] rounded font-bold text-[var(--ink)] border border-[var(--rule)] transition text-center cursor-pointer"
                >
                  👁️ Preview
                </button>
                <button
                  onClick={() => handleDelete(mat.id)}
                  className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-bold transition text-center cursor-pointer"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setUploadModalOpen(false)}
          title="Upload Course Study Material"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Course *:</label>
                <select
                  value={formCourse}
                  onChange={(e) => setFormCourse(e.target.value)}
                  className="field-input text-xs"
                >
                  {courses.map(c => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Unit Number *:</label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(Number(e.target.value))}
                  className="field-input text-xs font-mono font-bold"
                >
                  <option value={1}>Unit 1</option>
                  <option value={2}>Unit 2</option>
                  <option value={3}>Unit 3</option>
                  <option value={4}>Unit 4</option>
                  <option value={5}>Unit 5</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Resource Title *:</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Unit 3: Multithreading & Concurrency Notes"
                className="field-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Material Type *:</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="field-input text-xs"
                >
                  <option value="PDF">PDF Document / Lecture Notes</option>
                  <option value="PPT">PPT Slide Deck</option>
                  <option value="VIDEO">Recorded Video Lecture</option>
                  <option value="REFERENCE">Reference Textbook</option>
                  <option value="LAB_MANUAL">Laboratory Manual</option>
                  <option value="CODE_SAMPLE">Code Sample / Architecture</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Estimated File Size:</label>
                <input
                  type="text"
                  value={formSize}
                  onChange={(e) => setFormSize(e.target.value)}
                  className="field-input text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Description / Summary:</label>
              <textarea
                rows={3}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Detailed summary of concepts covered in this file..."
                className="field-input text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Upload &amp; Publish →
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewMaterial(null)}
          title={`Resource Viewer — ${previewMaterial.title}`}
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg font-mono space-y-1">
              <div>Course: <strong className="text-[var(--ink)]">{previewMaterial.courseCode}</strong> ({previewMaterial.courseName})</div>
              <div>Unit: <strong>Unit {previewMaterial.unitNumber}</strong> • Format: <strong>{previewMaterial.materialType}</strong></div>
              <div>Uploader: <strong>{previewMaterial.uploadedBy}</strong></div>
            </div>

            <div className="p-6 bg-slate-900 text-white rounded-lg font-mono text-center space-y-2">
              <span className="text-3xl block">📄</span>
              <h4 className="font-bold text-sm text-amber-300">{previewMaterial.title}</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">{previewMaterial.description}</p>
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setPreviewMaterial(null)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Close Viewer
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading: ${previewMaterial.title}`);
                  setPreviewMaterial(null);
                }}
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Download File ({previewMaterial.fileSize}) 📥
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

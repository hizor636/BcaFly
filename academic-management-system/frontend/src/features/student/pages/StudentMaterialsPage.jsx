import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export const StudentMaterialsPage = () => {
  const { activeSemester, activeWorkspace, courseMaterials, toggleBookmarkMaterial } = useAcademic();
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const courses = activeWorkspace?.courses || [];

  const filteredMaterials = courseMaterials.filter(m => {
    if (selectedCourse !== 'ALL' && m.courseCode !== selectedCourse) return false;
    if (selectedUnit !== 'ALL' && String(m.unitNumber) !== selectedUnit) return false;
    if (selectedType !== 'ALL' && m.materialType !== selectedType) return false;
    if (showBookmarksOnly && !m.isBookmarked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        m.courseName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📚</span> OFFICIAL REPOSITORY &amp; COURSEWARE
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Course Study Materials &amp; Lecture Resources
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Unit-wise lecture notes, PPT slide decks, recorded video lectures, reference books, and verified faculty study guides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`px-3.5 py-2 rounded text-xs font-mono font-bold border transition cursor-pointer ${
              showBookmarksOnly ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-white text-[var(--slate)] border-[var(--rule)] hover:border-[var(--brass)]'
            }`}
          >
            ⭐ Bookmarked Resources {showBookmarksOnly && '✓'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 bg-white space-y-3 text-xs font-mono">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="🔍 Search study notes, PPTs, video topics, textbooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field-input text-xs font-sans"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[var(--slate)] font-bold">COURSE:</span>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="field-input py-1.5 text-xs w-auto min-w-[160px]"
              >
                <option value="ALL">All Subjects</option>
                {courses.map(c => (
                  <option key={c.id || c.code} value={c.code}>
                    {c.code} - {c.name || c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[var(--slate)] font-bold">UNIT:</span>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="field-input py-1.5 text-xs w-auto"
              >
                <option value="ALL">All Units</option>
                <option value="1">Unit 1</option>
                <option value="2">Unit 2</option>
                <option value="3">Unit 3</option>
                <option value="4">Unit 4</option>
                <option value="5">Unit 5</option>
              </select>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[var(--slate)] font-bold">TYPE:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="field-input py-1.5 text-xs w-auto"
              >
                <option value="ALL">All Formats</option>
                <option value="PDF">PDF Notes</option>
                <option value="PPT">PPT Slides</option>
                <option value="VIDEO">Video Lecture</option>
                <option value="DOCUMENT">Code / Document</option>
                <option value="REFERENCE">Reference Textbook</option>
                <option value="LINK">External Link</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-xs font-mono text-[var(--slate)]">
            No study materials found matching your criteria.
          </div>
        ) : (
          filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="card p-5 bg-white flex flex-col justify-between hover:border-[var(--brass)] hover:shadow-xs transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-2 py-0.5 rounded border border-[var(--brass)]">
                      {mat.courseCode}
                    </span>
                    {mat.unitNumber && (
                      <span className="font-mono text-[10px] bg-[var(--parchment-2)] px-2 py-0.5 rounded border border-[var(--rule)] font-bold">
                        Unit {mat.unitNumber}
                      </span>
                    )}
                    <Badge variant={mat.materialType === 'PDF' ? 'ink' : mat.materialType === 'PPT' ? 'amber' : mat.materialType === 'VIDEO' ? 'fail' : 'pass'}>
                      {mat.materialType}
                    </Badge>
                  </div>

                  <button
                    onClick={() => toggleBookmarkMaterial(mat.id)}
                    className="text-base p-1 hover:scale-110 transition cursor-pointer"
                    title={mat.isBookmarked ? 'Remove Bookmark' : 'Bookmark Material'}
                  >
                    {mat.isBookmarked ? '⭐' : '☆'}
                  </button>
                </div>

                <h4 className="font-display font-bold text-sm text-[var(--ink)] mb-1.5 line-clamp-2">
                  {mat.title}
                </h4>

                <p className="text-xs text-[var(--slate)] line-clamp-3 leading-relaxed mb-3">
                  {mat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--rule)] text-[11px] font-mono text-[var(--slate)]">
                <div className="flex items-center justify-between mb-2">
                  <span>Size: <strong>{mat.fileSize}</strong></span>
                  <span>Uploaded by: <strong className="text-[var(--ink)]">{mat.uploadedBy}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMaterial(mat)}
                    className="flex-1 py-1.5 bg-[var(--parchment-2)] hover:bg-white border border-[var(--rule)] hover:border-[var(--ink)] rounded font-bold text-[var(--ink)] transition text-center cursor-pointer"
                  >
                    👁️ Quick View
                  </button>
                  <button
                    onClick={() => alert(`Downloading resource: ${mat.title} (${mat.fileSize})`)}
                    className="flex-1 btn-ink py-1.5 rounded font-bold text-center cursor-pointer shadow-2xs"
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewMaterial && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewMaterial(null)}
          title={`Resource Detail — ${previewMaterial.courseCode}`}
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[var(--rule)] font-mono">
              <span className="font-bold text-[var(--brass-2)]">{previewMaterial.courseCode}: {previewMaterial.courseName}</span>
              {previewMaterial.unitNumber && <span>• Unit {previewMaterial.unitNumber}</span>}
              <Badge variant="ink">{previewMaterial.materialType}</Badge>
            </div>

            <div>
              <h3 className="font-display text-base font-bold text-[var(--ink)] mb-2">
                {previewMaterial.title}
              </h3>
              <p className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg text-xs leading-relaxed text-[var(--ink)]">
                {previewMaterial.description}
              </p>
            </div>

            <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg flex items-center justify-between font-mono">
              <div>
                <div className="text-[11px] text-[var(--slate)]">File Spec &amp; Verification</div>
                <div className="font-bold text-[var(--ink)]">Faculty Verified Resource • {previewMaterial.fileSize}</div>
              </div>
              <button
                onClick={() => {
                  alert(`Starting download for: ${previewMaterial.title}`);
                  setPreviewMaterial(null);
                }}
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                📥 Download Resource
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-1.5 bg-[var(--ink)] text-white rounded font-mono font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

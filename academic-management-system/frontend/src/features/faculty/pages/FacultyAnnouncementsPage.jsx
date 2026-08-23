import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export const FacultyAnnouncementsPage = () => {
  const { activeSemester, activeWorkspace, announcements, postFacultyAnnouncement } = useAcademic();
  const { user } = useAuth();

  const courses = activeWorkspace?.courses || [];

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code || 'BCA302');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [audienceType, setAudienceType] = useState('COURSE');
  const [actionSuccess, setActionSuccess] = useState(null);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    postFacultyAnnouncement({
      courseCode: selectedCourse,
      title,
      content,
      priority,
      audienceType,
      authorName: user?.name || 'Prof. K. Rao'
    });

    setPostModalOpen(false);
    setTitle('');
    setContent('');
    setActionSuccess('✓ Official course circular published to student notice boards with notification broadcast!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📢</span> OFFICIAL COURSE COMMUNICATION &amp; CIRCULARS
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Course Announcements &amp; Notice Board
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Broadcast official circulars, test schedules, assignment instructions, and emergency session notices.
          </p>
        </div>

        <button
          onClick={() => setPostModalOpen(true)}
          className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>➕</span> Post Announcement
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          {actionSuccess}
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => {
          const isUrgent = ann.priority === 'URGENT';
          const isImportant = ann.priority === 'IMPORTANT';

          return (
            <div
              key={ann.id}
              className={`card p-6 bg-white border transition space-y-3 ${
                isUrgent ? 'border-red-300 shadow-xs' : isImportant ? 'border-amber-300' : 'border-[var(--rule)]'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[var(--rule)] pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-2 py-0.5 rounded border border-[var(--brass)]">
                      {ann.courseId || `Semester ${activeSemester}`}
                    </span>
                    <Badge variant={isUrgent ? 'fail' : isImportant ? 'amber' : 'pass'}>
                      {ann.priority}
                    </Badge>
                    <span className="font-mono text-xs text-[var(--slate)]">Audience: {ann.audienceType}</span>
                  </div>

                  <h4 className="font-display font-bold text-lg text-[var(--ink)]">
                    {ann.title}
                  </h4>
                </div>

                <div className="text-right font-mono text-xs text-[var(--slate)]">
                  <div>Published: <strong>{new Date(ann.publishedAt).toLocaleDateString('en-GB')}</strong></div>
                  <div>Author: <strong className="text-[var(--ink)]">{ann.authorName}</strong></div>
                </div>
              </div>

              <p className="text-xs text-[var(--slate)] font-sans leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              {ann.attachments && ann.attachments.length > 0 && (
                <div className="pt-2 border-t border-[var(--rule)]/60 flex items-center gap-2 flex-wrap font-mono text-xs">
                  <span className="text-[var(--slate)] font-bold">ATTACHMENTS:</span>
                  {ann.attachments.map((file, idx) => (
                    <span key={idx} className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--ink)] font-bold">
                      📎 {file}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Post Modal */}
      {postModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setPostModalOpen(false)}
          title="Publish Official Course Announcement"
        >
          <form onSubmit={handlePostSubmit} className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Course Target *:</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="field-input text-xs"
                >
                  <option value="">Semester-Wide Circular</option>
                  {courses.map(c => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Priority Level *:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="field-input text-xs font-mono font-bold"
                >
                  <option value="NORMAL">Normal Notice</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent Alert (Red)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Notice Title *:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CIA 2 Schedule & Laboratory Viva Dates Announced"
                className="field-input text-xs"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Circular Content &amp; Instructions *:</label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type official notification body..."
                className="field-input text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Broadcast Notice 📢
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

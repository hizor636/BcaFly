import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export const StudentAnnouncementsPage = () => {
  const { activeSemester, announcements, markAnnouncementRead, markAllAnnouncementsRead } = useAcademic();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const filteredAnnouncements = announcements.filter(item => {
    if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
    if (audienceFilter !== 'ALL' && item.audienceType !== audienceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        (item.authorName && item.authorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unreadCount = announcements.filter(a => !a.isRead).length;

  const handleOpenNotice = (item) => {
    setSelectedAnnouncement(item);
    if (!item.isRead) {
      markAnnouncementRead(item.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📢</span> OFFICIAL DEPARTMENT &amp; COLLEGE BULLETIN
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Announcements &amp; Circulars
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Official department notices, examination schedules, workshop circulars, and academic orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAnnouncementsRead}
              className="btn-brass px-3.5 py-2 rounded text-xs font-mono font-bold shadow-xs cursor-pointer"
            >
              ✓ Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="🔍 Search notices by keyword, title, or circular authority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field-input text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto text-xs font-mono">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[var(--slate)] font-bold">PRIORITY:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="field-input py-1.5 text-xs w-auto"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent (Red)</option>
              <option value="IMPORTANT">Important (Amber)</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[var(--slate)] font-bold">AUDIENCE:</span>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="field-input py-1.5 text-xs w-auto"
            >
              <option value="ALL">All Audiences</option>
              <option value="SEMESTER">Semester 3</option>
              <option value="DEPARTMENT">BCA Department</option>
              <option value="COLLEGE">College-Wide</option>
              <option value="COURSE">Course-Specific</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="card p-12 text-center text-xs font-mono text-[var(--slate)]">
            No announcements match your search or filter criteria.
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenNotice(item)}
              className={`card p-5 cursor-pointer transition relative hover:border-[var(--brass)] hover:shadow-sm ${
                !item.isRead ? 'border-l-4 border-l-[var(--brass)] bg-amber-50/20' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={item.priority === 'URGENT' ? 'fail' : item.priority === 'IMPORTANT' ? 'amber' : 'ink'}>
                    {item.priority}
                  </Badge>
                  <span className="font-mono text-[10px] bg-[var(--parchment-2)] px-2 py-0.5 rounded border border-[var(--rule)] text-[var(--slate)] font-bold">
                    {item.audienceType} LEVEL
                  </span>
                  {item.courseId && (
                    <span className="font-mono text-[10px] bg-[var(--brass-soft)] text-[var(--brass-2)] px-2 py-0.5 rounded border border-[var(--brass)] font-bold">
                      {item.courseId}
                    </span>
                  )}
                  {!item.isRead && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      ● NEW / UNREAD
                    </span>
                  )}
                </div>

                <div className="font-mono text-[11px] text-[var(--slate)]">
                  Published: {new Date(item.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <h4 className="font-display font-bold text-base text-[var(--ink)] mb-1.5">
                {item.title}
              </h4>

              <p className="text-xs text-[var(--slate)] line-clamp-2 leading-relaxed">
                {item.content}
              </p>

              <div className="mt-3 pt-3 border-t border-[var(--rule)]/60 flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--slate)]">
                  Issued by: <strong className="text-[var(--ink)]">{item.authorName || 'BCA Department Coordinator'}</strong>
                </span>

                <div className="flex items-center gap-3">
                  {item.attachments && item.attachments.length > 0 && (
                    <span className="text-[11px] text-[var(--brass-2)] font-bold flex items-center gap-1">
                      📎 {item.attachments.length} Attachment(s)
                    </span>
                  )}
                  <span className="text-[var(--brass-2)] font-bold hover:underline">
                    Read Circular →
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Preview for Full Circular */}
      {selectedAnnouncement && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAnnouncement(null)}
          title="Official Circular Detail"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[var(--rule)]">
              <Badge variant={selectedAnnouncement.priority === 'URGENT' ? 'fail' : selectedAnnouncement.priority === 'IMPORTANT' ? 'amber' : 'ink'}>
                {selectedAnnouncement.priority} PRIORITY
              </Badge>
              <span className="font-mono text-xs text-[var(--slate)]">
                Audience: <strong>{selectedAnnouncement.audienceType}</strong>
              </span>
              <span className="font-mono text-xs text-[var(--slate)]">
                Date: <strong>{new Date(selectedAnnouncement.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg font-bold text-[var(--ink)] mb-2">
                {selectedAnnouncement.title}
              </h3>
              <div className="p-4 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg text-xs leading-relaxed text-[var(--ink)] whitespace-pre-line font-sans">
                {selectedAnnouncement.content}
              </div>
            </div>

            {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
              <div>
                <h5 className="font-mono text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-2">
                  Official Attachments &amp; Enclosures:
                </h5>
                <div className="space-y-2">
                  {selectedAnnouncement.attachments.map((att, idx) => (
                    <div key={idx} className="p-2.5 bg-white border border-[var(--rule)] rounded flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-[var(--ink)]">📄 {att.name || att}</span>
                      <button
                        onClick={() => alert(`Downloading attachment: ${att.name || att}`)}
                        className="btn-ink px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Download PDF 📥
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs font-mono text-[var(--slate)]">
              <span>Authority: {selectedAnnouncement.authorName || 'BCA Department'}</span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-1.5 bg-[var(--ink)] text-white rounded font-bold cursor-pointer"
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

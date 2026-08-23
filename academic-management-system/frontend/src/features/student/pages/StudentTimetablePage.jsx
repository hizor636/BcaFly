import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const StudentTimetablePage = () => {
  const { activeSemester, activeWorkspace, timetableEntries } = useAcademic();
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [viewMode, setViewMode] = useState('weekly'); // 'daily' | 'weekly'
  const [courseFilter, setCourseFilter] = useState('ALL');

  const courses = activeWorkspace?.courses || [];

  // Filter entries for active semester
  const semesterEntries = timetableEntries.filter(
    t => !t.semesterId || t.semesterId === String(activeSemester)
  );

  const filteredEntries = semesterEntries.filter(t => {
    if (viewMode === 'daily' && t.dayOfWeek !== selectedDay) return false;
    if (courseFilter !== 'ALL' && t.courseCode !== courseFilter) return false;
    return true;
  });

  // Group by day for weekly view
  const entriesByDay = DAYS.reduce((acc, day) => {
    acc[day] = semesterEntries.filter(t => t.dayOfWeek === day && (courseFilter === 'ALL' || t.courseCode === courseFilter));
    return acc;
  }, {});

  const exportHeaders = ['Day', 'Time Slot', 'Course Code', 'Course Name', 'Session Type', 'Faculty', 'Room', 'Status'];
  const exportRows = filteredEntries.map(e => [
    e.dayOfWeek,
    `${e.startTime} - ${e.endTime}`,
    e.courseCode,
    e.courseName,
    e.sessionType,
    e.substituteFacultyName || e.facultyName,
    e.room,
    e.status
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🗓️</span> OFFICIAL CLASS SCHEDULE
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Class Timetable — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Weekly lecture schedules, computer laboratory practicals, and substitution notices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename={`bca_timetable_sem${activeSemester}`}
            title={`BCA Semester ${activeSemester} Class Timetable`}
            subtitle="Academic Year 2025–26 (ODD Semester)"
            headers={exportHeaders}
            rows={exportRows}
          />
        </div>
      </div>

      {/* Control Bar: View Switcher & Filters */}
      <div className="card p-4 flex items-center justify-between flex-wrap gap-4 bg-white">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[var(--ink)]">VIEW:</span>
          <div className="inline-flex rounded-md shadow-2xs border border-[var(--rule)] bg-[var(--parchment-2)] p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                viewMode === 'weekly' ? 'bg-white text-[var(--ink)] shadow-2xs' : 'text-[var(--slate)] hover:text-[var(--ink)]'
              }`}
            >
              📅 Weekly Schedule
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                viewMode === 'daily' ? 'bg-white text-[var(--ink)] shadow-2xs' : 'text-[var(--slate)] hover:text-[var(--ink)]'
              }`}
            >
              🕒 Daily View
            </button>
          </div>
        </div>

        {/* Course Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[var(--slate)] font-bold">FILTER SUBJECT:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="field-input py-1.5 text-xs w-auto min-w-[200px]"
          >
            <option value="ALL">All Subjects &amp; Labs</option>
            {courses.map(c => (
              <option key={c.id || c.code} value={c.code}>
                {c.code} - {c.name || c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daily Mode Day Selector */}
      {viewMode === 'daily' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold border transition cursor-pointer ${
                selectedDay === day
                  ? 'bg-[var(--ink)] text-white border-[var(--ink)] shadow-sm'
                  : 'bg-white text-[var(--slate)] border-[var(--rule)] hover:border-[var(--brass)]'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* Weekly View Rendering */}
      {viewMode === 'weekly' ? (
        <div className="space-y-6">
          {DAYS.map(day => {
            const dayEntries = entriesByDay[day] || [];
            return (
              <div key={day} className="card p-5 bg-white">
                <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--brass)]"></span>
                    <h4 className="font-display font-bold text-base text-[var(--ink)]">{day}</h4>
                  </div>
                  <span className="text-xs font-mono text-[var(--slate)]">
                    {dayEntries.length} Sessions
                  </span>
                </div>

                {dayEntries.length === 0 ? (
                  <p className="text-xs font-mono text-[var(--slate)] py-3">No sessions scheduled for {day}.</p>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3.5">
                    {dayEntries.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-lg border transition ${
                          item.status === 'CANCELLED'
                            ? 'bg-red-50/70 border-red-200'
                            : item.status === 'SUBSTITUTED'
                            ? 'bg-amber-50/70 border-amber-300'
                            : item.sessionType === 'LAB'
                            ? 'bg-[var(--parchment-2)] border-[var(--rule)] hover:border-[var(--ink)]'
                            : 'bg-white border-[var(--rule)] hover:border-[var(--brass)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-[var(--ink)] bg-white px-2 py-0.5 rounded border border-[var(--rule)] shadow-2xs">
                            {item.startTime} – {item.endTime}
                          </span>
                          <Badge variant={item.sessionType === 'LAB' ? 'ink' : item.sessionType === 'SEMINAR' ? 'amber' : 'pass'}>
                            {item.sessionType}
                          </Badge>
                        </div>

                        <div className="mb-2">
                          <span className="font-mono text-[11px] font-bold text-[var(--brass-2)]">{item.courseCode}</span>
                          <h5 className="font-bold text-xs text-[var(--ink)] line-clamp-1">{item.courseName}</h5>
                        </div>

                        <div className="text-[11px] font-mono text-[var(--slate)] space-y-0.5 pt-2 border-t border-[var(--rule)]/60">
                          <div className="flex items-center justify-between">
                            <span>Room:</span>
                            <strong className="text-[var(--ink)]">{item.room}</strong>
                          </div>
                          <div className="flex items-center justify-between truncate">
                            <span>Faculty:</span>
                            <span className="text-[var(--ink)] font-semibold truncate max-w-[120px]" title={item.substituteFacultyName || item.facultyName}>
                              {item.substituteFacultyName || item.facultyName}
                            </span>
                          </div>
                        </div>

                        {item.status === 'CANCELLED' && (
                          <div className="mt-2 text-[10px] font-mono font-bold text-red-800 bg-red-100 p-1.5 rounded">
                            ⚠️ Class Cancelled
                          </div>
                        )}
                        {item.status === 'SUBSTITUTED' && (
                          <div className="mt-2 text-[10px] font-mono font-bold text-amber-900 bg-amber-100 p-1.5 rounded">
                            ⚡ Substituted: {item.substituteFacultyName}
                          </div>
                        )}
                        {item.notice && (
                          <div className="mt-2 text-[10px] font-mono text-[var(--slate)] bg-white/90 p-1.5 rounded border border-dashed border-[var(--rule)]">
                            ℹ️ {item.notice}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Daily View Rendering */
        <div className="card p-6 bg-white space-y-4">
          <div className="border-b border-[var(--rule)] pb-3 flex items-center justify-between">
            <h4 className="font-display font-bold text-lg text-[var(--ink)]">
              {selectedDay} Schedule (Semester {activeSemester})
            </h4>
            <span className="font-mono text-xs text-[var(--slate)]">{filteredEntries.length} Sessions</span>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-[var(--slate)]">
              No sessions scheduled for {selectedDay}.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    item.status === 'CANCELLED'
                      ? 'bg-red-50/70 border-red-300'
                      : idx === 0
                      ? 'bg-[var(--parchment-2)] border-[var(--brass)] shadow-2xs'
                      : 'bg-white border-[var(--rule)] hover:border-[var(--brass)]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="bg-white p-2.5 rounded-lg border border-[var(--rule)] text-center min-w-[110px] shadow-2xs">
                      <span className="font-mono text-xs font-bold text-[var(--ink)] block">{item.startTime}</span>
                      <span className="text-[10px] font-mono text-[var(--slate)]">to</span>
                      <span className="font-mono text-xs font-bold text-[var(--ink)] block">{item.endTime}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[var(--brass-2)]">{item.courseCode}</span>
                        <Badge variant={item.sessionType === 'LAB' ? 'ink' : item.sessionType === 'SEMINAR' ? 'amber' : 'pass'}>
                          {item.sessionType}
                        </Badge>
                        {item.status === 'SUBSTITUTED' && <Badge variant="amber">SUBSTITUTE</Badge>}
                        {item.status === 'CANCELLED' && <Badge variant="fail">CANCELLED</Badge>}
                      </div>
                      <h4 className="font-bold text-sm text-[var(--ink)]">{item.courseName}</h4>
                      <p className="text-xs font-mono text-[var(--slate)] mt-0.5">
                        Instructor: <strong className="text-[var(--ink)]">{item.substituteFacultyName || item.facultyName}</strong>
                      </p>
                      {item.notice && (
                        <p className="text-[11px] font-mono text-[var(--slate)] mt-1.5 bg-white px-2 py-1 rounded border border-dashed border-[var(--rule)]">
                          ℹ️ {item.notice}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end justify-between gap-2 shrink-0 font-mono text-xs">
                    <div className="px-3 py-1.5 rounded bg-white border border-[var(--rule)] font-bold text-[var(--ink)]">
                      📍 {item.room}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

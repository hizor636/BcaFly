import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { useNavigate } from 'react-router-dom';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const FacultyTimetablePage = () => {
  const { activeSemester, timetableEntries } = useAcademic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [courseFilter, setCourseFilter] = useState('ALL');

  const facultyId = user?.id || 'FAC02';

  // Filter entries allocated to Prof. K. Rao (FAC02) or his assigned courses (BCA302, BCA305L)
  const facultyEntries = timetableEntries.filter(
    t => t.facultyId === facultyId || t.substituteFacultyId === facultyId || t.courseCode === 'BCA302' || t.courseCode === 'BCA305L'
  );

  const filteredEntries = facultyEntries.filter(t => {
    if (viewMode === 'daily' && t.dayOfWeek !== selectedDay) return false;
    if (courseFilter !== 'ALL' && t.courseCode !== courseFilter) return false;
    return true;
  });

  const entriesByDay = DAYS.reduce((acc, day) => {
    acc[day] = facultyEntries.filter(t => t.dayOfWeek === day && (courseFilter === 'ALL' || t.courseCode === courseFilter));
    return acc;
  }, {});

  const exportHeaders = ['Day', 'Time Slot', 'Course Code', 'Course Name', 'Session Type', 'Room', 'Status'];
  const exportRows = filteredEntries.map(e => [
    e.dayOfWeek,
    `${e.startTime} - ${e.endTime}`,
    e.courseCode,
    e.courseName,
    e.sessionType,
    e.room,
    e.status
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🗓️</span> FACULTY TEACHING ROSTER
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Teaching Timetable &amp; Lecture Schedule
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Weekly classroom lectures, computer lab practical sessions, room allocations, and session attendance triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename={`faculty_timetable_${user?.name || 'prof_rao'}`}
            title={`Faculty Teaching Schedule — ${user?.name || 'Prof. K. Rao'}`}
            subtitle="Department of Computer Applications"
            headers={exportHeaders}
            rows={exportRows}
          />
        </div>
      </div>

      {/* Control Bar: View Switcher & Filters */}
      <div className="card p-4 bg-white flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--ink)]">VIEW:</span>
          <div className="inline-flex rounded-md border border-[var(--rule)] bg-[var(--parchment-2)] p-0.5">
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
              🕒 Daily Schedule
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[var(--slate)] font-bold">COURSE:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="field-input py-1.5 text-xs w-auto min-w-[180px]"
          >
            <option value="ALL">All Assigned Courses</option>
            <option value="BCA302">BCA302 - Java Programming</option>
            <option value="BCA305L">BCA305L - DBMS &amp; Java Lab</option>
          </select>
        </div>
      </div>

      {/* Daily Mode Day Selector */}
      {viewMode === 'daily' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg font-bold border transition cursor-pointer ${
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

      {/* Weekly View Grid */}
      {viewMode === 'weekly' ? (
        <div className="space-y-6">
          {DAYS.map(day => {
            const dayEntries = entriesByDay[day] || [];
            return (
              <div key={day} className="card p-5 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--brass)]"></span>
                    <h4 className="font-display font-bold text-base text-[var(--ink)]">{day}</h4>
                  </div>
                  <span className="text-xs font-mono text-[var(--slate)]">{dayEntries.length} Assigned Sessions</span>
                </div>

                {dayEntries.length === 0 ? (
                  <p className="text-xs font-mono text-[var(--slate)] py-2">No teaching allocations for {day}.</p>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {dayEntries.map(item => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border flex flex-col justify-between space-y-3 ${
                          item.sessionType === 'LAB'
                            ? 'bg-[var(--parchment-2)] border-[var(--rule)] hover:border-[var(--ink)]'
                            : 'bg-white border-[var(--rule)] hover:border-[var(--brass)]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-[var(--ink)] bg-white px-2 py-0.5 rounded border border-[var(--rule)] shadow-2xs">
                              {item.startTime} – {item.endTime}
                            </span>
                            <Badge variant={item.sessionType === 'LAB' ? 'ink' : 'pass'}>
                              {item.sessionType}
                            </Badge>
                          </div>

                          <div className="mb-2">
                            <span className="font-mono text-xs font-bold text-[var(--brass-2)]">{item.courseCode}</span>
                            <h5 className="font-bold text-xs text-[var(--ink)] line-clamp-1">{item.courseName}</h5>
                          </div>

                          <div className="text-[11px] font-mono text-[var(--slate)] flex justify-between pt-2 border-t border-[var(--rule)]/60">
                            <span>Room: <strong className="text-[var(--ink)]">{item.room}</strong></span>
                            <span>Semester {activeSemester} (Sec A)</span>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate('/faculty/attendance')}
                          className="btn-ink w-full py-1.5 rounded font-mono text-xs font-bold shadow-2xs cursor-pointer"
                        >
                          ⏱️ Start Attendance
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Daily View List */
        <div className="card p-6 bg-white space-y-4">
          <div className="border-b border-[var(--rule)] pb-3 flex items-center justify-between">
            <h4 className="font-display font-bold text-lg text-[var(--ink)]">
              {selectedDay} Allocations
            </h4>
            <span className="font-mono text-xs text-[var(--slate)]">{filteredEntries.length} Sessions</span>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-[var(--slate)]">
              No sessions scheduled for {selectedDay}.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-[var(--rule)] bg-white hover:border-[var(--brass)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-[var(--parchment-2)] p-2.5 rounded-lg border border-[var(--rule)] text-center min-w-[110px]">
                      <span className="font-mono text-xs font-bold text-[var(--ink)] block">{item.startTime}</span>
                      <span className="text-[10px] font-mono text-[var(--slate)]">to</span>
                      <span className="font-mono text-xs font-bold text-[var(--ink)] block">{item.endTime}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[var(--brass-2)]">{item.courseCode}</span>
                        <Badge variant={item.sessionType === 'LAB' ? 'ink' : 'pass'}>{item.sessionType}</Badge>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--ink)]">{item.courseName}</h4>
                      <p className="text-xs font-mono text-[var(--slate)] mt-0.5">
                        Location: <strong className="text-[var(--ink)]">{item.room}</strong> • Section A (Enrolled: 9 Students)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/faculty/attendance')}
                    className="btn-ink px-4 py-2 rounded font-mono text-xs font-bold shadow-xs cursor-pointer shrink-0"
                  >
                    ⏱️ Start Attendance
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

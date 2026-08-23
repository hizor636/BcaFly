import React, { useState, useRef, useEffect } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Topbar = ({ title, badge = 'YOUR ASSIGNED SEMESTER WORKSPACE' }) => {
  const { activeSemester, notifications, markNotificationRead, markAllNotificationsRead } = useAcademic();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    }
    setShowNotifs(false);
  };

  return (
    <header className="h-16 px-6 lg:px-8 bg-white border-b border-[var(--rule)] flex items-center justify-between shrink-0 shadow-2xs relative z-30">
      <div className="flex items-center gap-3">
        <h2 className="font-display font-bold text-lg sm:text-xl text-[var(--ink)]">
          {title || `Semester ${activeSemester} Workspace`}
        </h2>
        {badge && <span className="ws-tag hidden md:inline-flex">{badge}</span>}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Academic Term Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--parchment-2)] border border-[var(--rule)] text-xs font-mono text-[var(--ink)]">
          <span className="text-[var(--brass-2)] font-bold">ACADEMIC YEAR:</span> 2025–26
        </div>

        {/* In-app Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 rounded-lg border border-[var(--rule)] bg-white hover:bg-[var(--parchment-2)] flex items-center justify-center text-sm transition cursor-pointer"
            title="Notification Center"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full font-mono text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[var(--rule)] rounded-lg shadow-xl py-2 z-50 text-xs font-sans">
              <div className="px-4 py-2 border-b border-[var(--rule)] flex items-center justify-between">
                <span className="font-mono font-bold text-[var(--ink)] uppercase tracking-wider text-[11px]">
                  Notifications ({unreadCount} New)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-mono text-[var(--brass-2)] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--rule)]">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`p-3 cursor-pointer transition hover:bg-[var(--parchment-2)] flex gap-2.5 ${
                        !notif.isRead ? 'bg-amber-50/50 font-medium' : 'text-[var(--slate)]'
                      }`}
                    >
                      <div className="text-base shrink-0">
                        {notif.type === 'ATTENDANCE' ? '⚠️' : notif.type === 'ASSIGNMENT' ? '📝' : notif.type === 'HELPDESK' ? '💬' : '📢'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--ink)]">{notif.title}</span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[var(--brass)] shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--slate)] mt-0.5 line-clamp-2">{notif.message}</p>
                        <span className="text-[9px] font-mono text-[var(--slate-light)] mt-1 block">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-mono text-[var(--slate)]">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Isolated Security Shield */}
        <button
          className="w-9 h-9 rounded-lg border border-[var(--rule)] bg-white flex items-center justify-center text-xs hover:bg-[var(--parchment-2)] cursor-pointer"
          title="Workspace Verification: Isolated Semester State Active"
          onClick={() => alert(`Semester ${activeSemester} Workspace active with complete data isolation.`)}
        >
          🛡️
        </button>
      </div>
    </header>
  );
};

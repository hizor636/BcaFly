import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MASTER_FACULTY,
  INITIAL_TIMETABLE,
  loadWorkspaceData,
  saveWorkspaceData,
  loadAuditLogs,
  saveAuditLogs,
  loadActivities,
  saveActivities,
  loadAcademicFiles,
  saveAcademicFiles
} from '../services/workspaceStore';

const AcademicContext = createContext(null);

const REJECTED_EXTENSIONS = ['exe', 'msi', 'bat', 'cmd', 'sh', 'apk', 'dmg', 'com', 'scr', 'vbs'];

export const AcademicProvider = ({ children }) => {
  const [activeSemester, setActiveSemester] = useState(3);
  const [semesters, setSemesters] = useState(loadWorkspaceData());
  const [faculty] = useState(MASTER_FACULTY);
  const [auditLogs, setAuditLogs] = useState(loadAuditLogs());
  const [activities, setActivities] = useState(loadActivities());
  const [academicFiles, setAcademicFiles] = useState(loadAcademicFiles());
  const [timetable] = useState(INITIAL_TIMETABLE);

  // Sync state changes to localStorage
  useEffect(() => {
    saveWorkspaceData(semesters);
  }, [semesters]);

  useEffect(() => {
    saveAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    saveAcademicFiles(academicFiles);
  }, [academicFiles]);

  const activeWorkspace = semesters[activeSemester] || semesters[3];

  const logAction = (action, details, actor = 'Administrator', role = 'ADMIN') => {
    const newEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor,
      role: role.toUpperCase(),
      action,
      details
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const addStudent = (semId, student) => {
    const sem = semId || activeSemester;
    setSemesters(prev => {
      const current = prev[sem] || { students: [], courses: [] };
      const newStu = {
        id: student.id || `stu-${Date.now()}`,
        reg: student.reg || student.usn || `1BC24${Math.floor(100 + Math.random() * 900)}`,
        usn: student.usn || student.reg || `1BC24${Math.floor(100 + Math.random() * 900)}`,
        name: student.name,
        section: student.section || 'A',
        batch: student.batch || current.batch || '2024–27',
        attendance: Number(student.attendance) || 90,
        sgpa: Number(student.sgpa) || 8.5,
        cgpa: Number(student.cgpa) || 8.5,
        status: 'Active',
        backlogCount: Number(student.backlogCount) || 0,
        resultStatus: Number(student.backlogCount) > 0 ? 'FAIL' : 'PASS'
      };

      const updated = {
        ...prev,
        [sem]: {
          ...current,
          students: [newStu, ...current.students]
        }
      };
      return updated;
    });

    logAction('Student Enrolled', `Enrolled ${student.name} (${student.reg || 'New'}) into Semester ${sem}.`);
  };

  const addCourse = (semId, course) => {
    const sem = semId || activeSemester;
    setSemesters(prev => {
      const current = prev[sem] || { students: [], courses: [] };
      const newCourse = {
        id: course.id || `c-${Date.now()}`,
        code: course.code,
        name: course.name || course.title,
        title: course.name || course.title,
        type: course.type || 'Core Theory',
        credits: Number(course.credits) || 4,
        facultyId: course.facultyId || 'FAC01',
        room: course.room || 'Room 301'
      };

      return {
        ...prev,
        [sem]: {
          ...current,
          courses: [...current.courses, newCourse]
        }
      };
    });

    logAction('Course Configured', `Added course ${course.code} (${course.name}) to Semester ${sem}.`);
  };

  const updateStudentAttendance = (semId, studentId, newAttendance) => {
    const sem = semId || activeSemester;
    setSemesters(prev => {
      const current = prev[sem];
      if (!current) return prev;
      return {
        ...prev,
        [sem]: {
          ...current,
          students: current.students.map(s => s.id === studentId ? { ...s, attendance: Number(newAttendance) } : s)
        }
      };
    });
  };

  const updateStudentMarks = (semId, studentId, sgpa, resultStatus) => {
    const sem = semId || activeSemester;
    setSemesters(prev => {
      const current = prev[sem];
      if (!current) return prev;
      return {
        ...prev,
        [sem]: {
          ...current,
          students: current.students.map(s => s.id === studentId ? { ...s, sgpa: Number(sgpa), resultStatus } : s)
        }
      };
    });
  };

  const submitActivity = (activity) => {
    const newAct = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      sem: Number(activity.sem) || activeSemester,
      studentId: activity.studentId,
      studentName: activity.studentName,
      reg: activity.reg || activity.usn,
      title: activity.title,
      org: activity.org,
      date: activity.date || new Date().toISOString().split('T')[0],
      category: activity.category || 'Certification',
      od: Boolean(activity.od),
      status: 'PENDING',
      skills: activity.skills || ''
    };

    setActivities(prev => [newAct, ...prev]);
    logAction('Activity Submitted', `${activity.studentName} submitted ${activity.title} (${activity.category}).`, activity.studentName, 'STUDENT');
    return newAct;
  };

  const verifyActivity = (activityId, status, remarks = '') => {
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, status, remarks } : a));
    logAction('Activity Verified', `Activity ${activityId} marked as ${status}. ${remarks}`);
  };

  const uploadAcademicFiles = (metadata, files, uploaderName = 'Administrator', uploaderRole = 'ADMIN') => {
    if (!files || files.length === 0) return { success: false, message: 'No files provided.' };
    if (files.length > 10) return { success: false, message: 'Maximum 10 files allowed per upload.' };

    const newRecords = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop().toLowerCase();

      // Check for rejected extensions
      if (REJECTED_EXTENSIONS.includes(ext)) {
        return { success: false, message: `Executable or script file type (.${ext}) is strictly prohibited for security.` };
      }

      // Check max size: 25 MB = 25 * 1024 * 1024 bytes
      if (file.size > 25 * 1024 * 1024) {
        return { success: false, message: `File "${file.name}" exceeds the maximum 25 MB limit.` };
      }

      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const record = {
        id: `FILE-${Math.floor(1000 + Math.random() * 9000)}`,
        fileName: file.name,
        storedName: `sem${activeSemester}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
        ext: ext.toUpperCase(),
        size: sizeStr,
        sizeBytes: file.size,
        mimeType: file.type || 'application/octet-stream',
        sem: Number(metadata.sem) || activeSemester,
        courseCode: metadata.courseCode || 'ALL',
        studentId: metadata.studentId || null,
        studentName: metadata.studentName || 'All Students',
        recordType: metadata.recordType || 'Assessment',
        title: metadata.title || file.name,
        description: metadata.description || '',
        uploadedBy: uploaderName,
        uploaderRole: uploaderRole.toUpperCase(),
        uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        visibility: metadata.visibility || 'All'
      };

      newRecords.push(record);
    }

    setAcademicFiles(prev => [...newRecords, ...prev]);
    logAction(
      'Academic Files Uploaded',
      `Uploaded ${newRecords.length} file(s) for Semester ${activeSemester} under [${metadata.recordType}].`,
      uploaderName,
      uploaderRole
    );

    return { success: true, count: newRecords.length };
  };

  const deleteAcademicFile = (fileId) => {
    const target = academicFiles.find(f => f.id === fileId);
    setAcademicFiles(prev => prev.filter(f => f.id !== fileId));
    if (target) {
      logAction('Academic File Deleted', `Removed file "${target.fileName}" (${target.title}) from Semester ${target.sem}.`);
    }
  };

  return (
    <AcademicContext.Provider
      value={{
        activeSemester,
        setActiveSemester,
        semesters,
        activeWorkspace,
        faculty,
        auditLogs,
        activities,
        academicFiles,
        timetable,
        addStudent,
        addCourse,
        updateStudentAttendance,
        updateStudentMarks,
        submitActivity,
        verifyActivity,
        uploadAcademicFiles,
        deleteAcademicFile,
        logAction
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MASTER_FACULTY,
  loadWorkspaceData,
  saveWorkspaceData,
  loadAuditLogs,
  saveAuditLogs,
  loadActivities,
  saveActivities,
  loadAcademicFiles,
  saveAcademicFiles,
  loadTimetableEntries,
  saveTimetableEntries,
  loadAnnouncements,
  saveAnnouncements,
  loadAssignments,
  saveAssignments,
  loadSubmissions,
  saveSubmissions,
  loadCourseMaterials,
  saveCourseMaterials,
  loadDetailedAttendance,
  saveDetailedAttendance,
  loadAssessmentMarks,
  saveAssessmentMarks,
  loadExamResults,
  saveExamResults,
  loadHelpdeskTickets,
  saveHelpdeskTickets,
  loadNotifications,
  saveNotifications,
  loadDocumentRequests,
  saveDocumentRequests,
  loadLabExperiments,
  saveLabExperiments,
  loadAttendanceSessions,
  saveAttendanceSessions,
  loadStudentRiskCases,
  saveStudentRiskCases,
  loadFacultyAllocations,
  saveFacultyAllocations,
  loadBacklogRecords,
  saveBacklogRecords
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
  const [timetableEntries, setTimetableEntries] = useState(loadTimetableEntries());
  const [announcements, setAnnouncements] = useState(loadAnnouncements());
  const [assignments, setAssignments] = useState(loadAssignments());
  const [submissions, setSubmissions] = useState(loadSubmissions());
  const [courseMaterials, setCourseMaterials] = useState(loadCourseMaterials());
  const [detailedAttendance, setDetailedAttendance] = useState(loadDetailedAttendance());
  const [assessmentMarks, setAssessmentMarks] = useState(loadAssessmentMarks());
  const [examResults, setExamResults] = useState(loadExamResults());
  const [helpdeskTickets, setHelpdeskTickets] = useState(loadHelpdeskTickets());
  const [notifications, setNotifications] = useState(loadNotifications());
  const [documentRequests, setDocumentRequests] = useState(loadDocumentRequests());
  const [labExperiments, setLabExperiments] = useState(loadLabExperiments());
  const [attendanceSessions, setAttendanceSessions] = useState(loadAttendanceSessions());
  const [studentRiskCases, setStudentRiskCases] = useState(loadStudentRiskCases());
  const [facultyAllocations, setFacultyAllocations] = useState(loadFacultyAllocations());
  const [backlogRecords, setBacklogRecords] = useState(loadBacklogRecords());

  // Sync state changes to localStorage
  useEffect(() => { saveWorkspaceData(semesters); }, [semesters]);
  useEffect(() => { saveAuditLogs(auditLogs); }, [auditLogs]);
  useEffect(() => { saveActivities(activities); }, [activities]);
  useEffect(() => { saveAcademicFiles(academicFiles); }, [academicFiles]);
  useEffect(() => { saveTimetableEntries(timetableEntries); }, [timetableEntries]);
  useEffect(() => { saveAnnouncements(announcements); }, [announcements]);
  useEffect(() => { saveAssignments(assignments); }, [assignments]);
  useEffect(() => { saveSubmissions(submissions); }, [submissions]);
  useEffect(() => { saveCourseMaterials(courseMaterials); }, [courseMaterials]);
  useEffect(() => { saveDetailedAttendance(detailedAttendance); }, [detailedAttendance]);
  useEffect(() => { saveAssessmentMarks(assessmentMarks); }, [assessmentMarks]);
  useEffect(() => { saveExamResults(examResults); }, [examResults]);
  useEffect(() => { saveHelpdeskTickets(helpdeskTickets); }, [helpdeskTickets]);
  useEffect(() => { saveNotifications(notifications); }, [notifications]);
  useEffect(() => { saveDocumentRequests(documentRequests); }, [documentRequests]);
  useEffect(() => { saveLabExperiments(labExperiments); }, [labExperiments]);
  useEffect(() => { saveAttendanceSessions(attendanceSessions); }, [attendanceSessions]);
  useEffect(() => { saveStudentRiskCases(studentRiskCases); }, [studentRiskCases]);
  useEffect(() => { saveFacultyAllocations(facultyAllocations); }, [facultyAllocations]);
  useEffect(() => { saveBacklogRecords(backlogRecords); }, [backlogRecords]);

  const activeWorkspace = semesters[activeSemester] || semesters[3];

  const logAction = (action, details, actor = 'Dr. A. Sharma', role = 'HOD') => {
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

      return {
        ...prev,
        [sem]: {
          ...current,
          students: [newStu, ...current.students]
        }
      };
    });

    logAction('Student Enrolled', `Enrolled ${student.name} (${student.reg || 'New'}) into Semester ${sem}.`);
  };

  const addCourse = (semId, course) => {
    const sem = semId || activeSemester;
    const courseCode = (course.code || '').trim().toUpperCase();
    const courseTitle = course.name || course.title || 'Untitled Course';
    const courseId = course.id || courseCode || `c-${Date.now()}`;

    setSemesters(prev => {
      const current = prev[sem] || { students: [], courses: [] };
      const newCourse = {
        id: courseId,
        code: courseCode,
        name: courseTitle,
        title: courseTitle,
        type: course.type || 'Core Theory',
        credits: Number(course.credits) || 4,
        facultyId: course.facultyId || 'FAC01',
        room: course.room || course.classroomSlot || 'Room 301'
      };

      return {
        ...prev,
        [sem]: {
          ...current,
          courses: [...current.courses, newCourse]
        }
      };
    });

    logAction('Course Configured', `Added course ${courseCode} (${courseTitle}) to Semester ${sem}.`);
  };

  const updateCourse = (semId, courseId, updatedCourse) => {
    const sem = semId || activeSemester;
    const courseCode = (updatedCourse.code || '').trim().toUpperCase();
    const courseTitle = updatedCourse.name || updatedCourse.title || 'Untitled Course';

    setSemesters(prev => {
      const current = prev[sem];
      if (!current) return prev;
      return {
        ...prev,
        [sem]: {
          ...current,
          courses: current.courses.map(c => {
            if (c.id === courseId || c.code === courseId) {
              return {
                ...c,
                ...updatedCourse,
                code: courseCode || c.code,
                name: courseTitle,
                title: courseTitle,
                type: updatedCourse.type || c.type,
                credits: Number(updatedCourse.credits) || c.credits,
                facultyId: updatedCourse.facultyId || c.facultyId,
                room: updatedCourse.room || updatedCourse.classroomSlot || c.room
              };
            }
            return c;
          })
        }
      };
    });

    logAction('Course Updated', `Updated course ${courseCode || courseId} in Semester ${sem}.`);
  };

  const deleteCourse = (semId, courseId) => {
    const sem = semId || activeSemester;
    let deletedTitle = courseId;
    setSemesters(prev => {
      const current = prev[sem];
      if (!current) return prev;
      const target = current.courses.find(c => c.id === courseId || c.code === courseId);
      if (target) deletedTitle = `${target.code} (${target.name || target.title})`;
      return {
        ...prev,
        [sem]: {
          ...current,
          courses: current.courses.filter(c => c.id !== courseId && c.code !== courseId)
        }
      };
    });

    logAction('Course Deleted', `Deleted course ${deletedTitle} from Semester ${sem}.`);
  };

  const bulkDeleteCourses = (semId, courseIds) => {
    const sem = semId || activeSemester;
    const idsSet = new Set(courseIds);
    setSemesters(prev => {
      const current = prev[sem];
      if (!current) return prev;
      return {
        ...prev,
        [sem]: {
          ...current,
          courses: current.courses.filter(c => !idsSet.has(c.id) && !idsSet.has(c.code))
        }
      };
    });

    logAction('Bulk Courses Deleted', `Removed ${courseIds.length} courses from Semester ${sem}.`);
  };

  const importCourses = (semId, coursesList, options = {}) => {
    const sem = semId || activeSemester;
    const { overwriteDuplicates = false } = options;

    setSemesters(prev => {
      const current = prev[sem] || { students: [], courses: [] };
      let updatedCourses = [...current.courses];

      coursesList.forEach(raw => {
        const code = (raw.code || raw.courseCode || '').trim().toUpperCase();
        const title = raw.name || raw.title || raw.courseTitle || 'Untitled Subject';
        const type = raw.type || raw.courseType || 'Core Theory';
        const credits = Number(raw.credits) || 4;
        const facultyId = raw.facultyId || raw.assignedFaculty || 'FAC01';
        const room = raw.room || raw.classroomSlot || 'Room 301';

        const existingIdx = updatedCourses.findIndex(c => (c.code || '').toUpperCase() === code);

        const newEntry = {
          id: raw.id || `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          code,
          name: title,
          title,
          type,
          credits,
          facultyId,
          room
        };

        if (existingIdx >= 0) {
          if (overwriteDuplicates) {
            updatedCourses[existingIdx] = { ...updatedCourses[existingIdx], ...newEntry };
          }
        } else {
          updatedCourses.push(newEntry);
        }
      });

      return {
        ...prev,
        [sem]: {
          ...current,
          courses: updatedCourses
        }
      };
    });

    logAction('Courses Imported', `Imported ${coursesList.length} subjects into Semester ${sem}.`);
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

  // Timetable query
  const getTimetableForDate = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDay = days[d.getDay()];
    return timetableEntries.filter(t => t.dayOfWeek === currentDay && (!t.semesterId || t.semesterId === String(activeSemester)));
  };

  // HOD Approval Action (Activity/OD, Attendance, Marks, Revaluation)
  const hodApproveRequest = (type, requestId, decision, remarks = '') => {
    if (type === 'ACTIVITY' || type === 'OD') {
      const isApprove = decision === 'HOD_APPROVED' || decision === 'APPROVED';
      setActivities(prev => prev.map(a => a.id === requestId ? {
        ...a,
        status: isApprove ? 'HOD_APPROVED' : 'HOD_REJECTED',
        hodRemarks: remarks,
        approvedAt: new Date().toISOString()
      } : a));

      logAction('HOD Activity Decision', `Sanctioned activity #${requestId}: ${decision}. Remarks: ${remarks}`, 'Dr. A. Sharma', 'HOD');
    } else if (type === 'ATTENDANCE_CORRECTION') {
      setDetailedAttendance(prev => ({
        ...prev,
        correctionRequests: (prev.correctionRequests || []).map(r => r.id === requestId ? {
          ...r,
          status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
          hodRemarks: remarks,
          reviewedBy: 'Dr. A. Sharma (HOD)'
        } : r)
      }));

      logAction('HOD Attendance Correction', `Decision on attendance appeal #${requestId}: ${decision}.`, 'Dr. A. Sharma', 'HOD');
    }
  };

  // HOD Student-at-Risk Management
  const assignStudentMentor = (caseId, mentorFacultyId, mentorName, interventionPlan) => {
    setStudentRiskCases(prev => prev.map(c => c.id === caseId ? {
      ...c,
      assignedMentorId: mentorFacultyId,
      mentorName,
      interventionPlan,
      status: 'MENTOR_ASSIGNED',
      updatedAt: new Date().toISOString()
    } : c));

    logAction('Mentor Assigned to At-Risk Student', `Assigned mentor ${mentorName} to case #${caseId}. Plan: ${interventionPlan}`, 'Dr. A. Sharma', 'HOD');
  };

  const updateStudentRiskStatus = (caseId, status, notes = '') => {
    setStudentRiskCases(prev => prev.map(c => c.id === caseId ? {
      ...c,
      status,
      interventionPlan: notes ? `${c.interventionPlan || ''} | Note: ${notes}` : c.interventionPlan,
      updatedAt: new Date().toISOString()
    } : c));

    logAction('Student Risk Status Updated', `Case #${caseId} updated to ${status}.`, 'Dr. A. Sharma', 'HOD');
  };

  // HOD Backlog Management
  const updateBacklogRemedialPlan = (backlogId, { mentorFacultyId, mentorName, remedialPlan, status = 'IN_PROGRESS' }) => {
    setBacklogRecords(prev => prev.map(b => b.id === backlogId ? {
      ...b,
      mentorFacultyId: mentorFacultyId || b.mentorFacultyId,
      mentorName: mentorName || b.mentorName,
      remedialPlan: remedialPlan || b.remedialPlan,
      status,
      updatedAt: new Date().toISOString()
    } : b));

    logAction('Backlog Remedial Plan Assigned', `Backlog record #${backlogId} updated: Mentor ${mentorName}. Plan: "${remedialPlan}"`, 'Dr. A. Sharma', 'HOD');
  };

  // HOD Faculty Allocations & Workload
  const allocateFacultyToCourse = (courseCode, facultyId, weeklyHours = 4, allocationType = 'THEORY') => {
    const targetFac = faculty.find(f => f.id === facultyId) || { name: 'Faculty' };
    const courseObj = activeWorkspace?.courses?.find(c => c.code === courseCode) || { name: courseCode };

    setFacultyAllocations(prev => {
      const existing = prev.filter(a => a.courseCode !== courseCode);
      const newAlloc = {
        id: `alloc-${Date.now()}`,
        facultyId,
        facultyName: targetFac.name,
        role: targetFac.role,
        courseCode,
        courseName: courseObj.name || courseObj.title || courseCode,
        allocationType,
        weeklyHours: Number(weeklyHours),
        status: 'ACTIVE'
      };
      return [newAlloc, ...existing];
    });

    // Also update course object facultyId in workspace
    setSemesters(prev => {
      const sem = activeSemester;
      const current = prev[sem];
      if (!current) return prev;
      return {
        ...prev,
        [sem]: {
          ...current,
          courses: current.courses.map(c => c.code === courseCode ? { ...c, facultyId } : c)
        }
      };
    });

    logAction('Faculty Allocation Updated', `Allocated ${targetFac.name} to teach ${courseCode} (${weeklyHours} hrs/week).`, 'Dr. A. Sharma', 'HOD');
  };

  // HOD Timetable Publishing
  const publishTimetableByHod = (semesterId) => {
    const sem = semesterId || activeSemester;
    logAction('Timetable Published by HOD', `Officially sanctioned and published Semester ${sem} master timetable.`, 'Dr. A. Sharma', 'HOD');

    const notif = {
      id: `notif-${Date.now()}`,
      title: 'Semester Timetable Approved & Published',
      message: `Head of Department has approved the official timetable for Semester ${sem}.`,
      type: 'TIMETABLE',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student/timetable'
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: `Semester ${sem} Timetable published successfully.` };
  };

  // Faculty Attendance Sessions
  const saveAttendanceSession = ({ courseCode, courseName, date, period, startTime, endTime, presentCount, absentCount, status = 'LOCKED', studentRecords = [] }) => {
    const newSession = {
      id: `sess-${Date.now()}`,
      courseCode,
      courseName: courseName || courseCode,
      semesterId: activeSemester,
      section: 'A',
      date,
      period: Number(period) || 1,
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      status,
      presentCount,
      absentCount,
      submittedAt: new Date().toISOString()
    };

    setAttendanceSessions(prev => [newSession, ...prev]);

    if (studentRecords && studentRecords.length > 0) {
      setSemesters(prev => {
        const sem = activeSemester;
        const current = prev[sem];
        if (!current) return prev;
        return {
          ...prev,
          [sem]: {
            ...current,
            students: current.students.map(s => {
              const rec = studentRecords.find(r => r.studentId === s.id);
              if (rec) {
                const isPres = rec.status === 'Present' || rec.status === 'PRESENT';
                const currentAtt = s.attendance || 85;
                const newAtt = isPres ? Math.min(100, currentAtt + 1) : Math.max(40, currentAtt - 2);
                return { ...s, attendance: newAtt };
              }
              return s;
            })
          }
        };
      });
    }

    logAction(
      'Attendance Session Saved',
      `Recorded session for ${courseCode} on ${date} (Period ${period}): ${presentCount} Present, ${absentCount} Absent.`,
      'Faculty Instructor',
      'FACULTY'
    );

    return newSession;
  };

  // Faculty Attendance Correction Review
  const reviewAttendanceCorrection = (requestId, { status, remarks = '', facultyName = 'Prof. K. Rao' }) => {
    setDetailedAttendance(prev => ({
      ...prev,
      correctionRequests: (prev.correctionRequests || []).map(r => r.id === requestId ? {
        ...r,
        status,
        facultyRemarks: remarks,
        reviewedAt: new Date().toISOString(),
        reviewedBy: facultyName
      } : r)
    }));

    logAction(
      'Attendance Correction Decision',
      `Correction request #${requestId} marked as ${status}. Remarks: ${remarks}`,
      facultyName,
      'FACULTY'
    );
  };

  // Faculty Assessment Management
  const createAssessment = ({ courseCode, title, type, maxMarks = 50, weightage = 20 }) => {
    const newComponent = {
      id: `m-${Date.now()}`,
      type,
      title,
      marksObtained: null,
      maxMarks: Number(maxMarks),
      weightage: Number(weightage),
      status: 'DRAFT',
      feedback: 'Assessment created and scheduled.'
    };

    setAssessmentMarks(prev => prev.map(c => {
      if (c.courseCode === courseCode) {
        return {
          ...c,
          components: [...c.components, newComponent]
        };
      }
      return c;
    }));

    logAction(
      'Assessment Created',
      `Created ${type} (${title}) for course ${courseCode} (Max Marks: ${maxMarks}).`,
      'Faculty Instructor',
      'FACULTY'
    );

    return newComponent;
  };

  const saveAssessmentMarksEntry = (courseCode, componentType, marksMap, isPublish = false, feedbackMap = {}) => {
    setAssessmentMarks(prev => prev.map(c => {
      if (c.courseCode === courseCode) {
        const updatedComps = c.components.map(comp => {
          if (comp.type === componentType || comp.title.includes(componentType)) {
            return {
              ...comp,
              status: isPublish ? 'PUBLISHED' : 'DRAFT'
            };
          }
          return comp;
        });

        return {
          ...c,
          components: updatedComps
        };
      }
      return c;
    }));

    if (isPublish) {
      const notif = {
        id: `notif-${Date.now()}`,
        title: 'New Assessment Marks Published',
        message: `Marks for ${courseCode} (${componentType}) have been published by the instructor.`,
        type: 'MARKS',
        timestamp: new Date().toISOString(),
        isRead: false,
        link: '/student/marks'
      };
      setNotifications(prev => [notif, ...prev]);
    }

    logAction(
      isPublish ? 'Assessment Marks Published' : 'Assessment Marks Draft Saved',
      `${isPublish ? 'Published' : 'Saved draft'} marks for ${courseCode} (${componentType}).`,
      'Faculty Instructor',
      'FACULTY'
    );
  };

  // Faculty Assignment Creation & Evaluation
  const createAssignment = ({ courseCode, title, description, instructions, maxMarks = 20, dueAt, allowLate = true, allowResubmission = true, attachments = [], createdBy = 'Prof. K. Rao' }) => {
    const courseObj = activeWorkspace?.courses?.find(c => c.code === courseCode) || { name: courseCode };
    const newAsg = {
      id: `asg-${Date.now()}`,
      courseId: courseCode,
      courseCode,
      courseName: courseObj.name || courseObj.title || courseCode,
      title,
      description,
      instructions,
      maxMarks: Number(maxMarks),
      assignedAt: new Date().toISOString(),
      dueAt: dueAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      allowLateSubmission: Boolean(allowLate),
      allowResubmission: Boolean(allowResubmission),
      attachments: attachments.length > 0 ? attachments : [`${courseCode}_Specs.pdf`],
      createdBy,
      status: 'PUBLISHED'
    };

    setAssignments(prev => [newAsg, ...prev]);

    const notif = {
      id: `notif-${Date.now()}`,
      title: 'New Assignment Assigned',
      message: `Assignment: "${title}" posted for ${courseCode}. Due on ${new Date(newAsg.dueAt).toLocaleDateString('en-GB')}.`,
      type: 'ASSIGNMENT',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student/assignments'
    };
    setNotifications(prev => [notif, ...prev]);

    logAction(
      'Assignment Created',
      `Assigned "${title}" in course ${courseCode} (Max Marks: ${maxMarks}).`,
      createdBy,
      'FACULTY'
    );

    return newAsg;
  };

  const gradeAssignmentSubmission = (submissionId, { marksObtained, feedback = '', status = 'GRADED', gradedBy = 'Prof. K. Rao' }) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          marksObtained: Number(marksObtained),
          feedback,
          status,
          gradedAt: new Date().toISOString(),
          gradedBy
        };
      }
      return s;
    }));

    logAction(
      'Assignment Evaluated',
      `Graded submission #${submissionId} with score ${marksObtained}. Feedback: "${feedback}"`,
      gradedBy,
      'FACULTY'
    );
  };

  const remindPendingAssignmentStudents = (assignmentId) => {
    const asg = assignments.find(a => a.id === assignmentId);
    const notif = {
      id: `notif-${Date.now()}`,
      title: 'Assignment Deadline Reminder',
      message: `Reminder from instructor: "${asg?.title || 'Assignment'}" is due soon. Please submit before deadline.`,
      type: 'ASSIGNMENT',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student/assignments'
    };
    setNotifications(prev => [notif, ...prev]);

    logAction(
      'Assignment Reminder Dispatched',
      `Sent deadline reminder for assignment "${asg?.title}".`,
      'Faculty Instructor',
      'FACULTY'
    );

    return { success: true, message: 'Deadline reminder sent to all enrolled students.' };
  };

  // Faculty Course Materials Upload & Management
  const uploadCourseMaterial = ({ courseCode, title, description, materialType = 'PDF', unitNumber = 1, url = '#', fileSize = '2.5 MB', uploadedBy = 'Prof. K. Rao', isVisible = true }) => {
    const courseObj = activeWorkspace?.courses?.find(c => c.code === courseCode) || { name: courseCode };
    const newMat = {
      id: `mat-${Date.now()}`,
      courseId: courseCode,
      courseCode,
      courseName: courseObj.name || courseObj.title || courseCode,
      title,
      description,
      materialType,
      unitNumber: Number(unitNumber),
      url,
      fileSize,
      uploadedBy,
      publishedAt: new Date().toISOString(),
      isVisible,
      isBookmarked: false
    };

    setCourseMaterials(prev => [newMat, ...prev]);

    const notif = {
      id: `notif-${Date.now()}`,
      title: 'New Study Material Published',
      message: `Unit ${unitNumber} resource: "${title}" uploaded for ${courseCode}.`,
      type: 'MATERIAL',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student/materials'
    };
    setNotifications(prev => [notif, ...prev]);

    logAction(
      'Course Material Uploaded',
      `Uploaded ${materialType} "${title}" (Unit ${unitNumber}) for course ${courseCode}.`,
      uploadedBy,
      'FACULTY'
    );

    return newMat;
  };

  const deleteCourseMaterial = (materialId) => {
    const target = courseMaterials.find(m => m.id === materialId);
    setCourseMaterials(prev => prev.filter(m => m.id !== materialId));
    if (target) {
      logAction('Course Material Removed', `Removed material "${target.title}" from ${target.courseCode}.`, 'Prof. K. Rao', 'FACULTY');
    }
  };

  // Faculty Announcements
  const postFacultyAnnouncement = ({ courseCode, title, content, priority = 'NORMAL', audienceType = 'COURSE', attachments = [], authorName = 'Prof. K. Rao' }) => {
    const newAnn = {
      id: `ann-${Date.now()}`,
      title,
      content,
      authorId: 'FAC02',
      authorName,
      audienceType,
      semesterId: String(activeSemester),
      courseId: courseCode,
      priority,
      attachments: attachments.length > 0 ? attachments : [],
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: false
    };

    setAnnouncements(prev => [newAnn, ...prev]);

    const notif = {
      id: `notif-${Date.now()}`,
      title: `Notice from ${authorName}`,
      message: `${title}: ${content.substring(0, 80)}...`,
      type: 'ANNOUNCEMENT',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student/announcements'
    };
    setNotifications(prev => [notif, ...prev]);

    logAction(
      'Course Announcement Published',
      `Posted ${priority} notice "${title}" for ${courseCode || 'Semester ' + activeSemester}.`,
      authorName,
      'FACULTY'
    );

    return newAnn;
  };

  // Faculty Lab Experiment Management (BCA305L)
  const gradeLabExperiment = (experimentId, studentId, { observationMarks, vivaMarks, practicalMarks, feedback = '', status = 'VERIFIED' }) => {
    const totalMarks = (Number(observationMarks) || 0) + (Number(vivaMarks) || 0) + (Number(practicalMarks) || 0);

    setLabExperiments(prev => prev.map(exp => {
      if (exp.id === experimentId) {
        const existingSubs = exp.submissions || [];
        const filtered = existingSubs.filter(s => s.studentId !== studentId);
        const targetStudent = activeWorkspace?.students?.find(s => s.id === studentId) || { name: 'Student', reg: 'BCS23CA001' };

        const updatedSub = {
          studentId,
          studentName: targetStudent.name,
          reg: targetStudent.reg || targetStudent.usn,
          githubUrl: '',
          status,
          observationMarks: Number(observationMarks),
          vivaMarks: Number(vivaMarks),
          practicalMarks: Number(practicalMarks),
          totalMarks,
          feedback,
          gradedAt: new Date().toISOString()
        };

        return {
          ...exp,
          submissions: [updatedSub, ...filtered]
        };
      }
      return exp;
    }));

    logAction(
      'Lab Practical Graded',
      `Graded Lab Experiment #${experimentId} for student ${studentId}: Total ${totalMarks} Marks.`,
      'Prof. K. Rao',
      'FACULTY'
    );
  };

  // Student Requests / Helpdesk Query Resolution by Faculty
  const resolveStudentRequest = (ticketId, { replyMessage, status = 'RESOLVED', facultyName = 'Prof. K. Rao' }) => {
    const newReply = {
      id: `rep-${Date.now()}`,
      author: facultyName,
      role: 'FACULTY',
      message: replyMessage,
      timestamp: new Date().toISOString()
    };

    setHelpdeskTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status,
          replies: [...(t.replies || []), newReply]
        };
      }
      return t;
    }));

    const notif = {
      id: `notif-${Date.now()}`,
      title: 'Faculty Response on Ticket #' + ticketId,
      message: `${facultyName} replied: "${replyMessage.substring(0, 70)}..."`,
      type: 'HELPDESK',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student/helpdesk'
    };
    setNotifications(prev => [notif, ...prev]);

    logAction(
      'Student Query Resolved',
      `Faculty replied and set ticket #${ticketId} to ${status}.`,
      facultyName,
      'FACULTY'
    );
  };

  // Student Announcements
  const markAnnouncementRead = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const markAllAnnouncementsRead = () => {
    setAnnouncements(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  // Student Submissions
  const submitAssignment = ({ assignmentId, studentId, studentName, submissionText, submissionLinks, uploadedFiles, isLate = false }) => {
    const newSub = {
      id: `sub-${Date.now()}`,
      assignmentId,
      studentId: studentId || 'student-s3-001',
      studentName: studentName || 'Rahul Kumar',
      submissionText: submissionText || '',
      submissionLinks: submissionLinks || [],
      uploadedFiles: uploadedFiles || [],
      submittedAt: new Date().toISOString(),
      status: isLate ? 'LATE' : 'SUBMITTED',
      marksObtained: null,
      feedback: null
    };

    setSubmissions(prev => {
      const filtered = prev.filter(s => !(s.assignmentId === assignmentId && s.studentId === newSub.studentId));
      return [newSub, ...filtered];
    });

    logAction('Assignment Submitted', `${studentName} submitted assignment ${assignmentId}.`, studentName, 'STUDENT');

    const targetAsg = assignments.find(a => a.id === assignmentId);
    const notif = {
      id: `notif-${Date.now()}`,
      title: 'Assignment Submitted Successfully',
      message: `Your submission for "${targetAsg?.title || 'Assignment'}" has been recorded.`,
      type: 'ASSIGNMENT',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student/assignments'
    };
    setNotifications(prev => [notif, ...prev]);

    return newSub;
  };

  const saveAssignmentDraft = ({ assignmentId, studentId, studentName, submissionText, submissionLinks, uploadedFiles }) => {
    const draftSub = {
      id: `sub-draft-${Date.now()}`,
      assignmentId,
      studentId: studentId || 'student-s3-001',
      studentName: studentName || 'Rahul Kumar',
      submissionText: submissionText || '',
      submissionLinks: submissionLinks || [],
      uploadedFiles: uploadedFiles || [],
      submittedAt: new Date().toISOString(),
      status: 'DRAFT',
      marksObtained: null,
      feedback: null
    };

    setSubmissions(prev => {
      const filtered = prev.filter(s => !(s.assignmentId === assignmentId && s.studentId === draftSub.studentId));
      return [draftSub, ...filtered];
    });

    return draftSub;
  };

  // Course Materials bookmarking
  const toggleBookmarkMaterial = (materialId) => {
    setCourseMaterials(prev => prev.map(m => m.id === materialId ? { ...m, isBookmarked: !m.isBookmarked } : m));
  };

  // Student Attendance Correction Request
  const submitAttendanceCorrection = ({ courseCode, date, period, reason, studentId = 'student-s3-001', studentName = 'Rahul Kumar' }) => {
    const newReq = {
      id: `cr-${Math.floor(100 + Math.random() * 900)}`,
      studentId,
      studentName,
      courseCode,
      date,
      period: Number(period) || 1,
      reason,
      status: 'UNDER_REVIEW',
      submittedAt: new Date().toISOString(),
      facultyRemarks: 'Received request; checking course register.'
    };

    setDetailedAttendance(prev => ({
      ...prev,
      correctionRequests: [newReq, ...(prev.correctionRequests || [])]
    }));

    logAction('Attendance Correction Requested', `${studentName} filed correction for ${courseCode} on ${date}.`, studentName, 'STUDENT');
    return newReq;
  };

  // Student Revaluation Request
  const submitRevaluationRequest = ({ semester, subjectCode, reason, studentId = 'student-s3-001', studentName = 'Rahul Kumar' }) => {
    logAction('Revaluation Requested', `${studentName} requested challenge revaluation for ${subjectCode} (Sem ${semester}). Reason: ${reason}`, studentName, 'STUDENT');
    const notif = {
      id: `notif-${Date.now()}`,
      title: 'Revaluation Request Acknowledged',
      message: `Your revaluation request for ${subjectCode} (Semester ${semester}) has been submitted to the Controller of Examinations.`,
      type: 'RESULT',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: '/student/results'
    };
    setNotifications(prev => [notif, ...prev]);
    return { success: true, message: 'Revaluation request submitted successfully.' };
  };

  // Activity / OD Claims
  const submitActivity = (activity) => {
    const newAct = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      sem: Number(activity.sem) || activeSemester,
      studentId: activity.studentId || 'student-s3-001',
      studentName: activity.studentName || 'Rahul Kumar',
      reg: activity.reg || activity.usn || 'BCS23CA001',
      title: activity.title,
      org: activity.org,
      location: activity.location || 'Campus / External',
      date: activity.date || new Date().toISOString().split('T')[0],
      endDate: activity.endDate || activity.date || new Date().toISOString().split('T')[0],
      category: activity.category || 'Certification',
      od: Boolean(activity.od),
      status: 'SUBMITTED',
      description: activity.description || '',
      learningOutcome: activity.learningOutcome || '',
      evidenceFiles: activity.evidenceFiles || ['Certificate_Evidence.pdf'],
      facultyRemarks: '',
      hodRemarks: '',
      attendanceCreditDays: activity.od ? (activity.attendanceCreditDays || 1) : 0,
      skills: activity.skills || '',
      createdAt: new Date().toISOString()
    };

    setActivities(prev => [newAct, ...prev]);
    logAction('Activity / OD Submitted', `${newAct.studentName} submitted ${newAct.title} (${newAct.category}).`, newAct.studentName, 'STUDENT');
    return newAct;
  };

  const verifyActivity = (activityId, status, remarks = '', attendanceCreditDays = 1) => {
    setActivities(prev => prev.map(a => a.id === activityId ? {
      ...a,
      status,
      facultyRemarks: remarks,
      attendanceCreditDays: Number(attendanceCreditDays)
    } : a));
    logAction('Activity Verified by Faculty', `Activity ${activityId} decision: ${status}. ${remarks}`, 'Prof. K. Rao', 'FACULTY');
  };

  const hodApproveActivity = (activityId, status, remarks = '', attendanceCreditDays = 1) => {
    setActivities(prev => prev.map(a => a.id === activityId ? {
      ...a,
      status,
      hodRemarks: remarks,
      attendanceCreditDays: Number(attendanceCreditDays)
    } : a));
    logAction('Activity Approved by HOD', `Activity ${activityId} HOD decision: ${status}. ${remarks}`, 'Dr. A. Sharma', 'HOD');
  };

  // Helpdesk & Ticketing
  const createHelpdeskTicket = ({ category, subject, description, priority = 'MEDIUM', attachments = [], studentId = 'student-s3-001', studentName = 'Rahul Kumar', reg = 'BCS23CA001' }) => {
    const newTicket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId,
      studentName,
      reg,
      category,
      subject,
      description,
      priority,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      resolutionDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      attachments,
      replies: [
        {
          id: `rep-${Date.now()}`,
          author: studentName,
          role: 'STUDENT',
          message: description,
          timestamp: new Date().toISOString()
        }
      ]
    };

    setHelpdeskTickets(prev => [newTicket, ...prev]);
    logAction('Helpdesk Ticket Raised', `Ticket #${newTicket.id} [${category}] created by ${studentName}.`, studentName, 'STUDENT');
    return newTicket;
  };

  const replyHelpdeskTicket = (ticketId, { message, author = 'Rahul Kumar', role = 'STUDENT' }) => {
    const newReply = {
      id: `rep-${Date.now()}`,
      author,
      role: role.toUpperCase(),
      message,
      timestamp: new Date().toISOString()
    };

    setHelpdeskTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: role.toUpperCase() === 'STUDENT' && t.status === 'RESOLVED' ? 'REOPENED' : t.status,
          replies: [...(t.replies || []), newReply]
        };
      }
      return t;
    }));

    logAction('Helpdesk Reply', `Reply added on ticket #${ticketId} by ${author}.`, author, role);
    return newReply;
  };

  const updateTicketStatus = (ticketId, status) => {
    setHelpdeskTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    logAction('Ticket Status Updated', `Ticket #${ticketId} status changed to ${status}.`);
  };

  // Document Requests
  const requestDocument = ({ type, purpose, studentId = 'student-s3-001', studentName = 'Rahul Kumar' }) => {
    const newDoc = {
      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      studentId,
      studentName,
      type,
      purpose,
      status: 'IN_PROCESS',
      requestedAt: new Date().toISOString().split('T')[0],
      issuedAt: null,
      downloadUrl: null
    };

    setDocumentRequests(prev => [newDoc, ...prev]);
    logAction('Official Document Requested', `${studentName} requested "${type}" for "${purpose}".`, studentName, 'STUDENT');
    return newDoc;
  };

  // Notifications
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const uploadAcademicFiles = (metadata, files, uploaderName = 'Administrator', uploaderRole = 'ADMIN') => {
    if (!files || files.length === 0) return { success: false, message: 'No files provided.' };
    if (files.length > 10) return { success: false, message: 'Maximum 10 files allowed per upload.' };

    const newRecords = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop().toLowerCase();

      if (REJECTED_EXTENSIONS.includes(ext)) {
        return { success: false, message: `Executable or script file type (.${ext}) is strictly prohibited for security.` };
      }

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

  const timetable = {
    1: [
      { day: 'Monday', slot1: 'BCA101 (C Prog)', slot2: 'BCA102 (Discrete Math)', slot3: 'BCA103 (Digital Logic)', slot4: 'BCA105L (C Lab)', slot5: 'BCA105L (C Lab)' },
      { day: 'Tuesday', slot1: 'BCA102 (Discrete Math)', slot2: 'BCA104 (Pro Comm)', slot3: 'BCA101 (C Prog)', slot4: 'Library / Mentoring', slot5: 'Sports' },
      { day: 'Wednesday', slot1: 'BCA103 (Digital Logic)', slot2: 'BCA101 (C Prog)', slot3: 'BCA102 (Discrete Math)', slot4: 'BCA104 (Pro Comm)', slot5: 'Remedial' },
      { day: 'Thursday', slot1: 'BCA104 (Pro Comm)', slot2: 'BCA103 (Digital Logic)', slot3: 'BCA101 (C Prog)', slot4: 'BCA105L (C Lab)', slot5: 'BCA105L (C Lab)' },
      { day: 'Friday', slot1: 'BCA101 (C Prog)', slot2: 'BCA102 (Discrete Math)', slot3: 'BCA104 (Pro Comm)', slot4: 'Club Activity', slot5: 'Placement Training' }
    ],
    2: [
      { day: 'Monday', slot1: 'BCA201 (Data Structures)', slot2: 'BCA202 (DBMS)', slot3: 'BCA203 (Maths II)', slot4: 'BCA205L (DS Lab)', slot5: 'BCA205L (DS Lab)' },
      { day: 'Tuesday', slot1: 'BCA202 (DBMS)', slot2: 'BCA204 (Env Studies)', slot3: 'BCA201 (Data Structures)', slot4: 'Library', slot5: 'Seminar' },
      { day: 'Wednesday', slot1: 'BCA203 (Maths II)', slot2: 'BCA201 (Data Structures)', slot3: 'BCA202 (DBMS)', slot4: 'BCA204 (Env Studies)', slot5: 'Sports' },
      { day: 'Thursday', slot1: 'BCA204 (Env Studies)', slot2: 'BCA203 (Maths II)', slot3: 'BCA201 (Data Structures)', slot4: 'BCA205L (DS Lab)', slot5: 'BCA205L (DS Lab)' },
      { day: 'Friday', slot1: 'BCA201 (Data Structures)', slot2: 'BCA202 (DBMS)', slot3: 'BCA204 (Env Studies)', slot4: 'Club Activity', slot5: 'Placement Training' }
    ],
    3: [
      { day: 'Monday', slot1: 'BCA301 (RDBMS)', slot2: 'BCA302 (Java OOP)', slot3: 'BCA303 (Comp Networks)', slot4: 'BCA305L (DBMS/Java Lab)', slot5: 'BCA305L (DBMS/Java Lab)' },
      { day: 'Tuesday', slot1: 'BCA302 (Java OOP)', slot2: 'BCA304 (OS Principles)', slot3: 'BCA301 (RDBMS)', slot4: 'SEM-301 (Library/Seminar)', slot5: 'Mentoring' },
      { day: 'Wednesday', slot1: 'BCA303 (Comp Networks)', slot2: 'BCA301 (RDBMS)', slot3: 'BCA304 (OS Principles)', slot4: 'BCA302 (Java OOP)', slot5: 'Sports' },
      { day: 'Thursday', slot1: 'BCA304 (OS Principles)', slot2: 'BCA303 (Comp Networks)', slot3: 'BCA302 (Java OOP)', slot4: 'BCA305L (Java Lab)', slot5: 'BCA305L (Java Lab)' },
      { day: 'Friday', slot1: 'BCA301 (RDBMS)', slot2: 'BCA304 (OS Principles)', slot3: 'BCA303 (Comp Networks)', slot4: 'CRT-301 (Placement)', slot5: 'CRT-301 (Placement)' }
    ],
    4: [
      { day: 'Monday', slot1: 'BCA401 (Software Eng)', slot2: 'BCA402 (Python Data)', slot3: 'BCA403 (Web Tech)', slot4: 'BCA405L (Web/Python Lab)', slot5: 'BCA405L (Web/Python Lab)' },
      { day: 'Tuesday', slot1: 'BCA402 (Python Data)', slot2: 'BCA404 (Optimization)', slot3: 'BCA401 (Software Eng)', slot4: 'Library', slot5: 'Mentoring' },
      { day: 'Wednesday', slot1: 'BCA403 (Web Tech)', slot2: 'BCA401 (Software Eng)', slot3: 'BCA404 (Optimization)', slot4: 'BCA402 (Python Data)', slot5: 'Sports' },
      { day: 'Thursday', slot1: 'BCA404 (Optimization)', slot2: 'BCA403 (Web Tech)', slot3: 'BCA401 (Software Eng)', slot4: 'BCA405L (Lab)', slot5: 'BCA405L (Lab)' },
      { day: 'Friday', slot1: 'BCA401 (Software Eng)', slot2: 'BCA402 (Python Data)', slot3: 'BCA404 (Optimization)', slot4: 'Club Activity', slot5: 'Placement Training' }
    ],
    5: [
      { day: 'Monday', slot1: 'BCA501 (Cloud Computing)', slot2: 'BCA502 (Mobile Apps)', slot3: 'BCA503E (AI Systems)', slot4: 'BCA505P (Mini Project)', slot5: 'BCA505P (Mini Project)' },
      { day: 'Tuesday', slot1: 'BCA502 (Mobile Apps)', slot2: 'BCA504 (Info Security)', slot3: 'BCA501 (Cloud Computing)', slot4: 'Seminar', slot5: 'Mentoring' },
      { day: 'Wednesday', slot1: 'BCA503E (AI Systems)', slot2: 'BCA501 (Cloud Computing)', slot3: 'BCA504 (Info Security)', slot4: 'BCA502 (Mobile Apps)', slot5: 'Project Work' },
      { day: 'Thursday', slot1: 'BCA504 (Info Security)', slot2: 'BCA503E (AI Systems)', slot3: 'BCA501 (Cloud Computing)', slot4: 'BCA505P (Project Lab)', slot5: 'BCA505P (Project Lab)' },
      { day: 'Friday', slot1: 'BCA501 (Cloud Computing)', slot2: 'BCA502 (Mobile Apps)', slot3: 'BCA504 (Info Security)', slot4: 'Industry Connect', slot5: 'Placement Prep' }
    ],
    6: [
      { day: 'Monday', slot1: 'BCA601 (Full Stack)', slot2: 'BCA602E (Machine Learning)', slot3: 'BCA603 (Cyber Law)', slot4: 'BCA604I (Capstone Project)', slot5: 'BCA604I (Capstone Project)' },
      { day: 'Tuesday', slot1: 'BCA602E (Machine Learning)', slot2: 'BCA603 (Cyber Law)', slot3: 'BCA601 (Full Stack)', slot4: 'Incubation Lab', slot5: 'Viva Prep' },
      { day: 'Wednesday', slot1: 'BCA603 (Cyber Law)', slot2: 'BCA601 (Full Stack)', slot3: 'BCA602E (Machine Learning)', slot4: 'BCA604I (Internship)', slot5: 'Industry Mentoring' },
      { day: 'Thursday', slot1: 'BCA601 (Full Stack)', slot2: 'BCA602E (Machine Learning)', slot3: 'BCA603 (Cyber Law)', slot4: 'BCA604I (Capstone Lab)', slot5: 'BCA604I (Capstone Lab)' },
      { day: 'Friday', slot1: 'BCA601 (Full Stack)', slot2: 'BCA602E (Machine Learning)', slot3: 'BCA605 (Viva Voce)', slot4: 'Placement Drive', slot5: 'Placement Drive' }
    ]
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
        timetableEntries,
        announcements,
        assignments,
        submissions,
        courseMaterials,
        detailedAttendance,
        assessmentMarks,
        examResults,
        helpdeskTickets,
        notifications,
        documentRequests,
        labExperiments,
        attendanceSessions,
        studentRiskCases,
        facultyAllocations,
        backlogRecords,
        addStudent,
        addCourse,
        updateCourse,
        deleteCourse,
        bulkDeleteCourses,
        importCourses,
        updateStudentAttendance,
        updateStudentMarks,
        getTimetableForDate,
        hodApproveRequest,
        assignStudentMentor,
        updateStudentRiskStatus,
        updateBacklogRemedialPlan,
        allocateFacultyToCourse,
        publishTimetableByHod,
        saveAttendanceSession,
        reviewAttendanceCorrection,
        createAssessment,
        saveAssessmentMarksEntry,
        createAssignment,
        gradeAssignmentSubmission,
        remindPendingAssignmentStudents,
        uploadCourseMaterial,
        deleteCourseMaterial,
        postFacultyAnnouncement,
        gradeLabExperiment,
        resolveStudentRequest,
        markAnnouncementRead,
        markAllAnnouncementsRead,
        submitAssignment,
        saveAssignmentDraft,
        toggleBookmarkMaterial,
        submitAttendanceCorrection,
        submitRevaluationRequest,
        submitActivity,
        verifyActivity,
        hodApproveActivity,
        createHelpdeskTicket,
        replyHelpdeskTicket,
        updateTicketStatus,
        requestDocument,
        markNotificationRead,
        markAllNotificationsRead,
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

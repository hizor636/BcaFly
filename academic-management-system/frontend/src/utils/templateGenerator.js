import * as XLSX from 'xlsx';

/**
 * Universal Academic Document Template Definitions & Generator
 */
export const TEMPLATE_SCHEMAS = {
  STUDENTS: {
    category: 'STUDENTS',
    title: 'Students Nominal Roll',
    filename: 'BcaFly_Students_Nominal_Roll_Template',
    description: 'Student registration details, USN, cohort section, batch, and contact details.',
    headers: ['USN', 'FullName', 'Section', 'Batch', 'Email', 'Phone', 'AttendancePercentage', 'SGPA', 'Standing'],
    sampleRows: [
      ['1BC24001', 'Aakash Singh', 'A', '2024–2027', 'aakash.singh@bcafly.edu', '+91 98765 00001', 92, 8.85, 'PASS'],
      ['1BC24002', 'Bhavana M', 'A', '2024–2027', 'bhavana.m@bcafly.edu', '+91 98765 00002', 88, 8.40, 'PASS'],
      ['1BC24003', 'Chetan Kumar', 'B', '2024–2027', 'chetan.k@bcafly.edu', '+91 98765 00003', 78, 7.60, 'PASS']
    ]
  },
  COURSES: {
    category: 'COURSES',
    title: 'Course Curriculum & Syllabus Catalog',
    filename: 'BcaFly_Course_Curriculum_Template',
    description: 'Course codes, subjects, credit weights, lecture/lab types, classrooms, and allocated faculty.',
    headers: ['CourseCode', 'CourseTitle', 'Credits', 'CourseType', 'ClassroomSlot', 'AssignedFacultyCode', 'MaxInternalMarks', 'PassMarks'],
    sampleRows: [
      ['BCA301', 'Database Management Systems', 4, 'Core Theory', 'Room 301', 'FAC01', 50, 20],
      ['BCA302', 'Java Programming & OOP', 4, 'Core Theory', 'Room 302', 'FAC02', 50, 20],
      ['BCA303', 'Operating Systems Principles', 4, 'Core Theory', 'Room 303', 'FAC03', 50, 20],
      ['BCA304', 'Computer Networks & Arch', 4, 'Core Theory', 'Room 304', 'FAC04', 50, 20],
      ['BCA305L', 'DBMS & Java Practical Laboratory', 2, 'Core Practical', 'Database Lab', 'FAC02', 50, 25]
    ]
  },
  FACULTY: {
    category: 'FACULTY',
    title: 'Faculty Directory & Allocations',
    filename: 'BcaFly_Faculty_Directory_Template',
    description: 'Faculty employee codes, designations, departments, contact emails, and assigned course codes.',
    headers: ['FacultyCode', 'FullName', 'Designation', 'Department', 'Email', 'Phone', 'AssignedCourseCode', 'TeachingLoadCredits'],
    sampleRows: [
      ['FAC01', 'Dr. Anand Sharma', 'Professor & HOD', 'BCA', 'anand.sharma@bcafly.edu', '+91 98765 11101', 'BCA301', 4],
      ['FAC02', 'Prof. Kavitha Rao', 'Associate Professor', 'BCA', 'kavitha.rao@bcafly.edu', '+91 98765 11102', 'BCA302', 6],
      ['FAC03', 'Dr. S. Nair', 'Associate Professor', 'BCA', 's.nair@bcafly.edu', '+91 98765 11103', 'BCA303', 4],
      ['FAC04', 'Prof. M. Varma', 'Assistant Professor', 'BCA', 'm.varma@bcafly.edu', '+91 98765 11104', 'BCA304', 4]
    ]
  },
  TIMETABLE: {
    category: 'TIMETABLE',
    title: 'Weekly Timetable Matrix',
    filename: 'BcaFly_Timetable_Schedule_Template',
    description: 'Weekly schedule grid mapping day, period slot, course, room, and faculty.',
    headers: ['DayOfWeek', 'PeriodNumber', 'CourseCode', 'RoomCode', 'FacultyCode', 'StartTime', 'EndTime', 'SessionType'],
    sampleRows: [
      ['Monday', 1, 'BCA301', 'Room 301', 'FAC01', '09:00 AM', '10:00 AM', 'LECTURE'],
      ['Monday', 2, 'BCA302', 'Room 302', 'FAC02', '10:00 AM', '11:00 AM', 'LECTURE'],
      ['Monday', 3, 'BCA303', 'Room 303', 'FAC03', '11:15 AM', '12:15 PM', 'LECTURE'],
      ['Monday', 4, 'BCA305L', 'Database Lab', 'FAC02', '01:15 PM', '03:15 PM', 'LAB']
    ]
  },
  ATTENDANCE: {
    category: 'ATTENDANCE',
    title: 'Attendance Register Records',
    filename: 'BcaFly_Attendance_Register_Template',
    description: 'Session-wise attendance register entries mapping students to course sessions.',
    headers: ['SessionDate', 'CourseCode', 'PeriodNumber', 'USN', 'Status', 'TopicCovered', 'Remarks'],
    sampleRows: [
      ['2026-08-10', 'BCA301', 1, '1BC24001', 'PRESENT', 'ER Modeling & Relational Schema', 'Attentive'],
      ['2026-08-10', 'BCA301', 1, '1BC24002', 'PRESENT', 'ER Modeling & Relational Schema', 'Active'],
      ['2026-08-10', 'BCA301', 1, '1BC24003', 'ABSENT', 'ER Modeling & Relational Schema', 'Medical Leave']
    ]
  },
  MARKS: {
    category: 'MARKS',
    title: 'Continuous Internal Evaluation (CIE) Marks',
    filename: 'BcaFly_Internal_Marks_Template',
    description: 'Internal assessment scores (CIA-1, CIA-2, Assignment, Model Exam).',
    headers: ['CourseCode', 'USN', 'EvaluationComponent', 'MarksObtained', 'MaxMarks', 'Remarks'],
    sampleRows: [
      ['BCA301', '1BC24001', 'CIA-1', 46, 50, 'Excellent'],
      ['BCA301', '1BC24001', 'CIA-2', 48, 50, 'Outstanding'],
      ['BCA301', '1BC24001', 'Assignment', 10, 10, 'On-time submit'],
      ['BCA301', '1BC24002', 'CIA-1', 42, 50, 'Good'],
      ['BCA301', '1BC24002', 'CIA-2', 44, 50, 'Very Good']
    ]
  },
  RESULTS: {
    category: 'RESULTS',
    title: 'End-Semester Exam Results & SGPA',
    filename: 'BcaFly_Exam_Results_Template',
    description: 'Official university end-term results with internal, external, total marks, letter grades, and credits.',
    headers: ['USN', 'CourseCode', 'InternalMarks', 'ExternalMarks', 'TotalMarks', 'Grade', 'GradePoints', 'Credits', 'ResultStatus'],
    sampleRows: [
      ['1BC24001', 'BCA301', 48, 45, 93, 'O', 10.0, 4, 'PASS'],
      ['1BC24001', 'BCA302', 45, 46, 91, 'O', 10.0, 4, 'PASS'],
      ['1BC24001', 'BCA303', 44, 43, 87, 'A+', 9.0, 4, 'PASS'],
      ['1BC24002', 'BCA301', 42, 42, 84, 'A+', 9.0, 4, 'PASS']
    ]
  }
};

/**
 * Download sample workbook or CSV for a given category
 */
export const downloadTemplateFile = (categoryKey, format = 'xlsx') => {
  const schema = TEMPLATE_SCHEMAS[categoryKey];
  if (!schema) return;

  const data = [schema.headers, ...schema.sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Auto-width columns
  const colWidths = schema.headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...schema.sampleRows.map(r => String(r[i] || '').length));
    return { wch: Math.max(maxLen + 4, 14) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, schema.category);

  const filename = `${schema.filename}.${format === 'csv' ? 'csv' : 'xlsx'}`;
  XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
};

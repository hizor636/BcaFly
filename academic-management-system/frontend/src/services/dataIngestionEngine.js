import * as XLSX from 'xlsx';

/**
 * Universal Data Ingestion & Schema Normalization Engine
 */

// Field Aliases dictionary for intelligent fuzzy column resolution
const FIELD_ALIASES = {
  // Student fields
  reg: ['usn', 'reg', 'regno', 'reg_no', 'registerno', 'registernumber', 'rollno', 'roll_no', 'studentid', 'student_id'],
  name: ['name', 'fullname', 'full_name', 'studentname', 'student_name', 'facultyname', 'faculty_name'],
  section: ['section', 'sec', 'class_section', 'cohort'],
  batch: ['batch', 'academic_batch', 'cohort_year', 'admission_batch'],
  email: ['email', 'emailid', 'email_address', 'mail'],
  phone: ['phone', 'phonenumber', 'phone_number', 'mobile', 'contact'],
  attendance: ['attendance', 'attendancepercentage', 'attendance_pct', 'attendance_percentage', 'att_pct'],
  sgpa: ['sgpa', 'current_sgpa', 'gpa', 'current_gpa'],
  cgpa: ['cgpa', 'cumulative_gpa', 'overall_cgpa'],
  standing: ['standing', 'status', 'enrolment_status', 'result_status', 'academic_standing'],

  // Course fields
  code: ['code', 'coursecode', 'course_code', 'subjectcode', 'subject_code', 'sub_code'],
  title: ['title', 'coursetitle', 'course_title', 'subjecttitle', 'subject_name', 'subject'],
  credits: ['credits', 'credit_hours', 'credit', 'teaching_credits'],
  courseType: ['coursetype', 'course_type', 'type', 'category'],
  classroom: ['classroom', 'room', 'roomcode', 'room_code', 'classroomslot', 'classroom_slot', 'venue'],
  assignedFacultyCode: ['assignedfacultycode', 'facultycode', 'faculty_code', 'assigned_faculty_id', 'faculty_id', 'faculty'],
  maxInternalMarks: ['maxinternalmarks', 'max_internal_marks', 'maxmarks', 'max_marks'],
  passMarks: ['passmarks', 'pass_marks', 'min_pass_marks', 'pass_internal_marks'],

  // Timetable fields
  day: ['day', 'dayofweek', 'day_of_week', 'weekday'],
  period: ['period', 'periodnumber', 'period_number', 'slot', 'period_slot'],
  startTime: ['starttime', 'start_time', 'time_start', 'from_time'],
  endTime: ['endtime', 'end_time', 'time_end', 'to_time'],
  sessionType: ['sessiontype', 'session_type', 'lecture_type', 'mode'],

  // Marks & Results fields
  component: ['component', 'evaluationcomponent', 'evaluation_component', 'testname', 'test_name', 'assessment_name'],
  marksObtained: ['marksobtained', 'marks_obtained', 'marks', 'score', 'scored_marks'],
  internalMarks: ['internalmarks', 'internal_marks', 'cia_marks', 'cie_marks'],
  externalMarks: ['externalmarks', 'external_marks', 'ese_marks', 'see_marks'],
  totalMarks: ['totalmarks', 'total_marks', 'total_score'],
  grade: ['grade', 'letter_grade', 'final_grade'],
  gradePoints: ['gradepoints', 'grade_points', 'gp']
};

/**
 * Normalize an arbitrary header string
 */
export const normalizeHeader = (header) => {
  if (!header) return '';
  const clean = String(header).toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [standardField, aliases] of Object.entries(FIELD_ALIASES)) {
    if (clean === standardField.toLowerCase() || aliases.includes(clean)) {
      return standardField;
    }
  }
  return clean;
};

/**
 * Parse raw file content (File object) into JSON array
 */
export const parseRawDocument = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          resolve(Array.isArray(json) ? json : [json]);
        } catch (err) {
          reject(new Error("Invalid JSON file formatting."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read JSON document."));
      reader.readAsText(file);
      return;
    }

    // Excel or CSV reader
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(rawJson);
      } catch (err) {
        reject(new Error(`Failed to parse spreadsheet: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read spreadsheet file."));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Process and validate ingested document data based on Academic Category
 */
export const processDocumentData = (category, rawRows, targetSemester = 1) => {
  if (!rawRows || rawRows.length === 0) {
    return {
      category,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      duplicateRows: 0,
      columnsMapped: [],
      errors: [{ rowNumber: 0, field: 'FILE', reason: 'Document contains no rows.', severity: 'CRITICAL' }],
      parsedData: []
    };
  }

  // 1. Map columns using normalized headers
  const rawHeaders = Object.keys(rawRows[0]);
  const columnsMapped = rawHeaders.map(h => ({
    original: h,
    mappedTo: normalizeHeader(h)
  }));

  const parsedData = [];
  const errors = [];
  const seenKeys = new Set();
  let duplicateCount = 0;

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // 1-based + 1 for header row
    const normalized = {};

    // Remap row fields
    for (const [key, value] of Object.entries(row)) {
      const standardKey = normalizeHeader(key);
      normalized[standardKey] = typeof value === 'string' ? value.trim() : value;
    }

    let isRowValid = true;

    // Category-specific validations and transformations
    switch (category) {
      case 'STUDENTS': {
        const reg = String(normalized.reg || normalized.usn || '').toUpperCase();
        const name = String(normalized.name || '');

        if (!reg) {
          errors.push({ rowNumber: rowNum, field: 'USN / Register Number', value: '', reason: 'USN is required.', severity: 'ERROR' });
          isRowValid = false;
        } else if (seenKeys.has(reg)) {
          duplicateCount++;
          errors.push({ rowNumber: rowNum, field: 'USN', value: reg, reason: `Duplicate USN (${reg}) found in spreadsheet.`, severity: 'WARNING' });
        } else {
          seenKeys.add(reg);
        }

        if (!name) {
          errors.push({ rowNumber: rowNum, field: 'FullName', value: '', reason: 'Student full name is required.', severity: 'ERROR' });
          isRowValid = false;
        }

        const attendance = Number(normalized.attendance) || 85;
        const sgpa = Number(normalized.sgpa) || 8.0;

        normalized.id = `stu-${targetSemester}-${reg.toLowerCase().replace(/[^a-z0-9]/g, '') || rowNum}`;
        normalized.reg = reg;
        normalized.usn = reg;
        normalized.name = name;
        normalized.section = normalized.section || 'A';
        normalized.batch = normalized.batch || '2026–2029';
        normalized.attendance = Math.min(100, Math.max(0, attendance));
        normalized.attendancePercentage = normalized.attendance;
        normalized.sgpa = Math.min(10, Math.max(0, sgpa));
        normalized.cgpa = Number(normalized.cgpa) || normalized.sgpa;
        normalized.standing = normalized.standing || 'PASS';
        normalized.status = 'ACTIVE';
        normalized.semester = Number(targetSemester);
        break;
      }

      case 'COURSES': {
        const code = String(normalized.code || '').toUpperCase();
        const title = String(normalized.title || '');
        const credits = Number(normalized.credits) || 4;

        if (!code) {
          errors.push({ rowNumber: rowNum, field: 'CourseCode', value: '', reason: 'Course Code is required.', severity: 'ERROR' });
          isRowValid = false;
        } else if (seenKeys.has(code)) {
          duplicateCount++;
          errors.push({ rowNumber: rowNum, field: 'CourseCode', value: code, reason: `Duplicate course code (${code}) in spreadsheet.`, severity: 'WARNING' });
        } else {
          seenKeys.add(code);
        }

        if (!title) {
          errors.push({ rowNumber: rowNum, field: 'CourseTitle', value: '', reason: 'Course Title is required.', severity: 'ERROR' });
          isRowValid = false;
        }

        normalized.id = `crs-${targetSemester}-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        normalized.code = code;
        normalized.title = title;
        normalized.credits = Math.min(10, Math.max(1, credits));
        normalized.courseType = normalized.courseType || (code.endsWith('L') ? 'Core Practical' : 'Core Theory');
        normalized.type = normalized.courseType;
        normalized.classroom = normalized.classroom || (code.endsWith('L') ? 'Computer Lab' : `Room 30${(index % 4) + 1}`);
        normalized.room = normalized.classroom;
        normalized.assignedFaculty = normalized.assignedFacultyCode || normalized.name || 'Unassigned';
        normalized.semester = Number(targetSemester);
        break;
      }

      case 'FACULTY': {
        const code = String(normalized.assignedFacultyCode || normalized.code || `FAC0${rowNum}`).toUpperCase();
        const name = String(normalized.name || '');

        if (!name) {
          errors.push({ rowNumber: rowNum, field: 'FullName', value: '', reason: 'Faculty name is required.', severity: 'ERROR' });
          isRowValid = false;
        }

        normalized.id = `fac-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        normalized.facultyCode = code;
        normalized.name = name;
        normalized.designation = normalized.designation || 'Assistant Professor';
        normalized.department = normalized.department || 'BCA';
        normalized.email = normalized.email || `${name.toLowerCase().replace(/\s+/g, '.')}@bcafly.edu`;
        normalized.assignedCourse = normalized.code || normalized.assignedCourseCode || '—';
        normalized.teachingCredits = Number(normalized.credits) || 4;
        break;
      }

      case 'TIMETABLE': {
        const day = String(normalized.day || 'Monday');
        const period = Number(normalized.period) || 1;
        const code = String(normalized.code || '').toUpperCase();

        if (!code) {
          errors.push({ rowNumber: rowNum, field: 'CourseCode', value: '', reason: 'Course Code is required for timetable slot.', severity: 'ERROR' });
          isRowValid = false;
        }

        const slotKey = `${day}-${period}`;
        if (seenKeys.has(slotKey)) {
          duplicateCount++;
          errors.push({ rowNumber: rowNum, field: 'Period Slot', value: slotKey, reason: `Conflicting timetable slot for ${day} Period ${period}.`, severity: 'WARNING' });
        } else {
          seenKeys.add(slotKey);
        }

        normalized.id = `tt-${targetSemester}-${day.slice(0, 3).toLowerCase()}-p${period}`;
        normalized.day = day;
        normalized.period = period;
        normalized.periodNumber = period;
        normalized.courseCode = code;
        normalized.room = normalized.classroom || 'Room 301';
        normalized.startTime = normalized.startTime || (period === 1 ? '09:00 AM' : period === 2 ? '10:00 AM' : period === 3 ? '11:15 AM' : '01:15 PM');
        normalized.endTime = normalized.endTime || (period === 1 ? '10:00 AM' : period === 2 ? '11:00 AM' : period === 3 ? '12:15 PM' : '02:15 PM');
        normalized.sessionType = normalized.sessionType || (code.endsWith('L') ? 'LAB' : 'LECTURE');
        normalized.semester = Number(targetSemester);
        break;
      }

      case 'ATTENDANCE': {
        const date = String(normalized.day || normalized.date || new Date().toISOString().split('T')[0]);
        const code = String(normalized.code || '').toUpperCase();
        const reg = String(normalized.reg || normalized.usn || '').toUpperCase();
        const status = String(normalized.standing || normalized.status || 'PRESENT').toUpperCase();

        if (!reg || !code) {
          errors.push({ rowNumber: rowNum, field: 'USN / CourseCode', value: `${reg}/${code}`, reason: 'Both USN and Course Code are required.', severity: 'ERROR' });
          isRowValid = false;
        }

        normalized.id = `att-log-${Date.now()}-${rowNum}`;
        normalized.date = date;
        normalized.courseCode = code;
        normalized.reg = reg;
        normalized.status = ['PRESENT', 'ABSENT', 'OD', 'LATE'].includes(status) ? status : 'PRESENT';
        normalized.period = Number(normalized.period) || 1;
        break;
      }

      case 'MARKS': {
        const code = String(normalized.code || '').toUpperCase();
        const reg = String(normalized.reg || normalized.usn || '').toUpperCase();
        const marks = Number(normalized.marksObtained ?? normalized.marks);
        const maxMarks = Number(normalized.maxInternalMarks ?? normalized.maxMarks ?? 50);

        if (!reg || !code) {
          errors.push({ rowNumber: rowNum, field: 'USN / CourseCode', value: `${reg}/${code}`, reason: 'USN and Course Code are required for marks entry.', severity: 'ERROR' });
          isRowValid = false;
        }
        if (isNaN(marks) || marks < 0 || marks > maxMarks) {
          errors.push({ rowNumber: rowNum, field: 'MarksObtained', value: String(marks), reason: `Marks must be between 0 and max marks (${maxMarks}).`, severity: 'ERROR' });
          isRowValid = false;
        }

        normalized.id = `mark-${targetSemester}-${code}-${reg}-${normalized.component || 'CIA1'}`;
        normalized.courseCode = code;
        normalized.reg = reg;
        normalized.component = normalized.component || 'CIA-1';
        normalized.marks = marks;
        normalized.maxMarks = maxMarks;
        normalized.percentage = Math.round((marks / maxMarks) * 100);
        break;
      }

      case 'RESULTS': {
        const reg = String(normalized.reg || normalized.usn || '').toUpperCase();
        const code = String(normalized.code || '').toUpperCase();
        const internal = Number(normalized.internalMarks ?? 40);
        const external = Number(normalized.externalMarks ?? 45);
        const total = internal + external;

        if (!reg || !code) {
          errors.push({ rowNumber: rowNum, field: 'USN / CourseCode', value: `${reg}/${code}`, reason: 'USN and Course Code are required for results.', severity: 'ERROR' });
          isRowValid = false;
        }

        let grade = normalized.grade;
        let gp = normalized.gradePoints;
        if (!grade) {
          if (total >= 90) { grade = 'O'; gp = 10; }
          else if (total >= 80) { grade = 'A+'; gp = 9; }
          else if (total >= 70) { grade = 'A'; gp = 8; }
          else if (total >= 60) { grade = 'B+'; gp = 7; }
          else if (total >= 50) { grade = 'B'; gp = 6; }
          else if (total >= 40) { grade = 'C'; gp = 5; }
          else { grade = 'F'; gp = 0; }
        }

        normalized.id = `res-${targetSemester}-${reg}-${code}`;
        normalized.reg = reg;
        normalized.courseCode = code;
        normalized.internalMarks = internal;
        normalized.externalMarks = external;
        normalized.totalMarks = total;
        normalized.grade = grade;
        normalized.gradePoints = gp ?? 8.0;
        normalized.credits = Number(normalized.credits) || 4;
        normalized.resultStatus = total >= 40 ? 'PASS' : 'FAIL';
        break;
      }

      default:
        break;
    }

    if (isRowValid) {
      parsedData.push(normalized);
    }
  });

  return {
    category,
    totalRows: rawRows.length,
    validRows: parsedData.length,
    invalidRows: errors.filter(e => e.severity === 'ERROR' || e.severity === 'CRITICAL').length,
    duplicateRows: duplicateCount,
    columnsMapped,
    errors,
    parsedData
  };
};

/**
 * Generate complete BCA official university starter dataset for all 6 semesters
 */
export const generateUniversityStarterDataset = () => {
  const dataset = {};

  const semCourseConfigs = {
    1: [
      { code: 'BCA101', title: 'Programming Fundamentals in C', credits: 4, type: 'Core Theory', room: 'Room 101' },
      { code: 'BCA102', title: 'Discrete Mathematics for Computing', credits: 4, type: 'Core Theory', room: 'Room 102' },
      { code: 'BCA103', title: 'Digital Logic & Computer Systems', credits: 4, type: 'Core Theory', room: 'Room 103' },
      { code: 'BCA104', title: 'Professional English & Technical Writing', credits: 3, type: 'Ability Enhancement', room: 'Room 104' },
      { code: 'BCA105L', title: 'C Programming Laboratory', credits: 2, type: 'Core Practical', room: 'Computer Lab 1' }
    ],
    2: [
      { code: 'BCA201', title: 'Data Structures with C++', credits: 4, type: 'Core Theory', room: 'Room 201' },
      { code: 'BCA202', title: 'Computer Architecture & Microprocessors', credits: 4, type: 'Core Theory', room: 'Room 202' },
      { code: 'BCA203', title: 'Linear Algebra & Numerical Methods', credits: 4, type: 'Core Theory', room: 'Room 203' },
      { code: 'BCA204', title: 'Environmental Science & Sustainability', credits: 3, type: 'Ability Enhancement', room: 'Room 204' },
      { code: 'BCA205L', title: 'Data Structures Laboratory', credits: 2, type: 'Core Practical', room: 'Computer Lab 2' }
    ],
    3: [
      { code: 'BCA301', title: 'Relational Database Management Systems', credits: 4, type: 'Core Theory', room: 'Room 301' },
      { code: 'BCA302', title: 'Java Programming & Object Orientation', credits: 4, type: 'Core Theory', room: 'Room 302' },
      { code: 'BCA303', title: 'Computer Networks & Internet Protocols', credits: 4, type: 'Core Theory', room: 'Room 303' },
      { code: 'BCA304', title: 'Operating Systems Principles', credits: 4, type: 'Core Theory', room: 'Room 304' },
      { code: 'BCA305L', title: 'DBMS & Java Practical Laboratory', credits: 2, type: 'Core Practical', room: 'Database Lab' }
    ],
    4: [
      { code: 'BCA401', title: 'Web Application Development (Full-Stack)', credits: 4, type: 'Core Theory', room: 'Room 401' },
      { code: 'BCA402', title: 'Software Engineering & Agile Methodologies', credits: 4, type: 'Core Theory', room: 'Room 402' },
      { code: 'BCA403', title: 'Design & Analysis of Algorithms', credits: 4, type: 'Core Theory', room: 'Room 403' },
      { code: 'BCA404', title: 'Probability, Statistics & Analytics', credits: 3, type: 'Allied Theory', room: 'Room 404' },
      { code: 'BCA405L', title: 'Full-Stack Web Development Lab', credits: 2, type: 'Core Practical', room: 'Web Dev Lab' }
    ],
    5: [
      { code: 'BCA501', title: 'Cloud Computing Architecture & DevOps', credits: 4, type: 'Core Theory', room: 'Room 501' },
      { code: 'BCA502', title: 'Python Programming & Data Science', credits: 4, type: 'Core Theory', room: 'Room 502' },
      { code: 'BCA503', title: 'Information & Cyber Security', credits: 4, type: 'Core Theory', room: 'Room 503' },
      { code: 'BCA504', title: 'Artificial Intelligence & Machine Learning', credits: 4, type: 'Elective Theory', room: 'Room 504' },
      { code: 'BCA505L', title: 'Cloud Computing & Python Lab', credits: 2, type: 'Core Practical', room: 'AI & Cloud Lab' }
    ],
    6: [
      { code: 'BCA601', title: 'Mobile Application Development (Flutter)', credits: 4, type: 'Core Theory', room: 'Room 601' },
      { code: 'BCA602', title: 'Big Data Technologies & Analytics', credits: 4, type: 'Core Theory', room: 'Room 602' },
      { code: 'BCA603', title: 'Software Testing & Quality Assurance', credits: 3, type: 'Core Theory', room: 'Room 603' },
      { code: 'BCA604P', title: 'Capstone Industry Major Project', credits: 6, type: 'Capstone Project', room: 'Project Lab' }
    ]
  };

  const sampleNames = [
    'Aakash Singh', 'Bhavana M', 'Chetan Kumar', 'Deepika Ramesh', 'Eshwar Prasad',
    'Farhan Akhtar', 'Gowri Shankar', 'Harini Krishnan', 'Indrajit Sen', 'Jaya Lakshmi'
  ];

  for (let sem = 1; sem <= 6; sem++) {
    const semKey = String(sem);
    const prefix = `1BC${27 - sem}`; // e.g. Sem 1 -> 1BC26, Sem 6 -> 1BC21
    const courses = semCourseConfigs[sem] || [];

    const students = sampleNames.map((name, idx) => {
      const num = String(idx + 1).padStart(3, '0');
      const usn = `${prefix}${num}`;
      const baseAtt = 80 + ((idx * 3) % 18);
      const baseSgpa = 7.5 + ((idx * 0.25) % 2.3);

      return {
        id: `stu-s${sem}-${num}`,
        name,
        reg: usn,
        usn,
        section: idx < 5 ? 'A' : 'B',
        batch: `202${6 - Math.floor((sem - 1) / 2)}–202${9 - Math.floor((sem - 1) / 2)}`,
        attendance: baseAtt,
        attendancePercentage: baseAtt,
        sgpa: Number(baseSgpa.toFixed(2)),
        cgpa: Number(baseSgpa.toFixed(2)),
        standing: 'PASS',
        status: 'ACTIVE',
        semester: sem,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@bcafly.edu`,
        phone: `+91 98765 ${String(sem * 1000 + idx).padStart(5, '0')}`
      };
    });

    dataset[semKey] = {
      sem,
      courses,
      students,
      term: sem % 2 === 1 ? `2026–27 ODD` : `2026–27 EVEN`,
      status: 'ACTIVE'
    };
  }

  return dataset;
};

import * as XLSX from 'xlsx';

/**
 * Standard Header Mapping Dictionary
 * Maps normalized header variations to system fields.
 */
export const HEADER_MAPPING_DICTIONARY = {
  // Course Code
  'course code': 'courseCode',
  'coursecode': 'courseCode',
  'course_code': 'courseCode',
  'subject code': 'courseCode',
  'subjectcode': 'courseCode',
  'subject_code': 'courseCode',
  'code': 'courseCode',
  'sub code': 'courseCode',
  'subcode': 'courseCode',
  'paper code': 'courseCode',
  'course id': 'courseCode',
  'courseid': 'courseCode',
  'subject id': 'courseCode',

  // Course Title
  'course title': 'courseTitle',
  'coursetitle': 'courseTitle',
  'course_title': 'courseTitle',
  'subject name': 'courseTitle',
  'subjectname': 'courseTitle',
  'subject_name': 'courseTitle',
  'subject title': 'courseTitle',
  'subjecttitle': 'courseTitle',
  'course name': 'courseTitle',
  'coursename': 'courseTitle',
  'title': 'courseTitle',
  'subject': 'courseTitle',
  'name': 'courseTitle',
  'paper title': 'courseTitle',
  'paper name': 'courseTitle',

  // Course Type
  'course type': 'courseType',
  'coursetype': 'courseType',
  'course_type': 'courseType',
  'subject type': 'courseType',
  'subjecttype': 'courseType',
  'subject_type': 'courseType',
  'type': 'courseType',
  'category': 'courseType',
  'paper type': 'courseType',

  // Credits
  'credits': 'credits',
  'credit': 'credits',
  'total credits': 'credits',
  'total credit': 'credits',
  'credit hours': 'credits',
  'credithours': 'credits',
  'cr': 'credits',
  'units': 'credits',

  // Assigned Faculty
  'assigned faculty': 'assignedFaculty',
  'assignedfaculty': 'assignedFaculty',
  'assigned_faculty': 'assignedFaculty',
  'faculty': 'assignedFaculty',
  'faculty name': 'assignedFaculty',
  'faculty id': 'assignedFaculty',
  'facultyid': 'assignedFaculty',
  'instructor': 'assignedFaculty',
  'instructor name': 'assignedFaculty',
  'teacher': 'assignedFaculty',
  'prof': 'assignedFaculty',
  'professor': 'assignedFaculty',

  // Classroom Slot
  'classroom slot': 'classroomSlot',
  'classroomslot': 'classroomSlot',
  'classroom_slot': 'classroomSlot',
  'room slot': 'classroomSlot',
  'roomslot': 'classroomSlot',
  'room': 'classroomSlot',
  'slot': 'classroomSlot',
  'class room': 'classroomSlot',
  'classroom': 'classroomSlot',
  'venue': 'classroomSlot',
  'location': 'classroomSlot',
  'lab room': 'classroomSlot'
};

export const SYSTEM_FIELDS = [
  { key: 'courseCode', label: 'Course Code', required: true, example: 'BCA306' },
  { key: 'courseTitle', label: 'Course Title', required: true, example: 'Cloud Computing' },
  { key: 'courseType', label: 'Course Type', required: false, example: 'Core Theory' },
  { key: 'credits', label: 'Credits', required: false, example: '4' },
  { key: 'assignedFaculty', label: 'Assigned Faculty', required: false, example: 'Dr. A. Sharma / FAC01' },
  { key: 'classroomSlot', label: 'Classroom Slot', required: false, example: 'Room 301' }
];

export const VALID_COURSE_TYPES = [
  'Core Theory',
  'Laboratory',
  'Discipline Elective',
  'Ability Enhancement',
  'Major Capstone'
];

/**
 * Normalize raw header string
 */
export function normalizeHeader(header) {
  if (!header || typeof header !== 'string') return '';
  return header.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Match a raw header against dictionary
 */
export function matchHeaderToField(header) {
  const norm = normalizeHeader(header);
  if (HEADER_MAPPING_DICTIONARY[norm]) {
    return HEADER_MAPPING_DICTIONARY[norm];
  }
  // Try compact without space
  const noSpace = norm.replace(/\s+/g, '');
  if (HEADER_MAPPING_DICTIONARY[noSpace]) {
    return HEADER_MAPPING_DICTIONARY[noSpace];
  }
  return null;
}

/**
 * Resolve faculty from string (ID or Name match)
 */
export function resolveFaculty(val, facultyList = []) {
  if (!val) return 'FAC01';
  const str = String(val).trim().toLowerCase();
  
  // Exact ID match
  const byId = facultyList.find(f => f.id.toLowerCase() === str);
  if (byId) return byId.id;

  // Name match
  const byName = facultyList.find(f => f.name.toLowerCase().includes(str) || str.includes(f.name.toLowerCase()));
  if (byName) return byName.id;

  // If starts with FAC
  const facCode = String(val).trim().toUpperCase();
  if (facCode.startsWith('FAC')) return facCode;

  return 'FAC01';
}

/**
 * Normalize course type string
 */
export function normalizeCourseType(val) {
  if (!val) return 'Core Theory';
  const str = String(val).trim().toLowerCase();
  if (str.includes('lab') || str.includes('practical')) return 'Laboratory';
  if (str.includes('elective')) return 'Discipline Elective';
  if (str.includes('ability') || str.includes('enhancement') || str.includes('skill')) return 'Ability Enhancement';
  if (str.includes('capstone') || str.includes('project') || str.includes('internship')) return 'Major Capstone';
  return 'Core Theory';
}

/**
 * Parse CSV or Excel file and return mapped rows with validation
 */
export async function parseCourseFile(file, existingCourses = [], facultyList = []) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Read first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Parse rows as raw array of arrays
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded file contains no data.');
  }

  // Find header row (first row with at least 1 non-empty cell)
  let headerRowIndex = 0;
  while (headerRowIndex < rawRows.length && (!rawRows[headerRowIndex] || rawRows[headerRowIndex].filter(c => String(c).trim()).length === 0)) {
    headerRowIndex++;
  }

  if (headerRowIndex >= rawRows.length) {
    throw new Error('No valid header row found in the document.');
  }

  const rawHeaders = rawRows[headerRowIndex].map(h => String(h || '').trim());
  const headerMapping = {}; // colIdx -> systemField
  const detectedHeaders = {}; // systemField -> originalHeader
  const unknownHeaders = [];

  rawHeaders.forEach((header, idx) => {
    if (!header) return;
    const mappedField = matchHeaderToField(header);
    if (mappedField) {
      headerMapping[idx] = mappedField;
      if (!detectedHeaders[mappedField]) {
        detectedHeaders[mappedField] = header;
      }
    } else {
      unknownHeaders.push({ index: idx, header });
    }
  });

  // Check required fields mapping
  const mappedFieldsSet = new Set(Object.values(headerMapping));
  const missingRequired = SYSTEM_FIELDS.filter(f => f.required && !mappedFieldsSet.has(f.key));

  const existingCodesSet = new Set(
    existingCourses.map(c => (c.code || '').trim().toUpperCase())
  );

  const seenInFileCodes = new Set();
  const processedRows = [];

  let readyCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.filter(c => String(c).trim() !== '').length === 0) {
      continue; // Skip blank rows
    }

    const rowData = {
      rowIndex: r + 1,
      courseCode: '',
      courseTitle: '',
      courseType: 'Core Theory',
      credits: 4,
      assignedFaculty: 'FAC01',
      classroomSlot: 'Room 301',
      unmappedValues: {},
      errors: [],
      warnings: [],
      status: 'ready', // 'ready' | 'warning' | 'error'
      isExistingDuplicate: false,
      isFileDuplicate: false
    };

    // Extract values according to mapped columns
    row.forEach((cellVal, colIdx) => {
      const valStr = String(cellVal !== undefined && cellVal !== null ? cellVal : '').trim();
      const field = headerMapping[colIdx];
      if (field) {
        if (field === 'courseCode') rowData.courseCode = valStr.toUpperCase();
        else if (field === 'courseTitle') rowData.courseTitle = valStr;
        else if (field === 'courseType') rowData.courseType = normalizeCourseType(valStr);
        else if (field === 'credits') {
          const num = Number(valStr);
          rowData.credits = isNaN(num) || num <= 0 ? 4 : num;
          if (isNaN(num) && valStr !== '') {
            rowData.warnings.push(`Non-numeric credit "${valStr}" defaulted to 4.`);
          }
        }
        else if (field === 'assignedFaculty') rowData.assignedFaculty = resolveFaculty(valStr, facultyList);
        else if (field === 'classroomSlot') rowData.classroomSlot = valStr || 'Room 301';
      } else {
        const rawHead = rawHeaders[colIdx] || `Col_${colIdx + 1}`;
        if (valStr) {
          rowData.unmappedValues[rawHead] = valStr;
        }
      }
    });

    // Fallbacks if not set
    if (!rowData.courseType) rowData.courseType = 'Core Theory';
    if (!rowData.classroomSlot) rowData.classroomSlot = 'Room 301';
    if (!rowData.assignedFaculty) rowData.assignedFaculty = 'FAC01';

    // Validation checks
    if (!rowData.courseCode) {
      rowData.errors.push('Missing Course Code.');
    }
    if (!rowData.courseTitle) {
      rowData.errors.push('Missing Course Title.');
    }

    // Check duplicate in file
    if (rowData.courseCode) {
      if (seenInFileCodes.has(rowData.courseCode)) {
        rowData.errors.push(`Duplicate Course Code in file: ${rowData.courseCode}`);
        rowData.isFileDuplicate = true;
      } else {
        seenInFileCodes.add(rowData.courseCode);
      }

      // Check conflict with existing workspace courses
      if (existingCodesSet.has(rowData.courseCode)) {
        rowData.warnings.push(`Course Code already exists in Semester (${rowData.courseCode}). Ingestion will update this course.`);
        rowData.isExistingDuplicate = true;
        duplicateCount++;
      }
    }

    // Determine status
    if (rowData.errors.length > 0) {
      rowData.status = 'error';
      errorCount++;
    } else if (rowData.warnings.length > 0) {
      rowData.status = 'warning';
      warningCount++;
    } else {
      rowData.status = 'ready';
      readyCount++;
    }

    processedRows.push(rowData);
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    sheetName: firstSheetName,
    rawHeaders,
    headerMapping,
    detectedHeaders,
    unknownHeaders,
    mappedFields: Array.from(mappedFieldsSet),
    missingRequiredFields: missingRequired.map(f => f.label),
    rows: processedRows,
    stats: {
      totalRows: processedRows.length,
      readyCount,
      warningCount,
      errorCount,
      duplicateCount,
      validCount: readyCount + warningCount
    }
  };
}

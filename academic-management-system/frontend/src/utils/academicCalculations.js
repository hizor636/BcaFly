/**
 * Academic calculation utilities for BcaFly
 * Handles grade points, SGPA/CGPA, attendance thresholds, and assessment totals.
 */

export const GRADE_SCALE = [
  { min: 90, grade: 'O', point: 10, label: 'Outstanding' },
  { min: 80, grade: 'A+', point: 9, label: 'Excellent' },
  { min: 70, grade: 'A', point: 8, label: 'Very Good' },
  { min: 60, grade: 'B+', point: 7, label: 'Good' },
  { min: 50, grade: 'B', point: 6, label: 'Above Average' },
  { min: 40, grade: 'C', point: 5, label: 'Pass' },
  { min: 0, grade: 'RA', point: 0, label: 'Re-Appear / Arrear' }
];

export function getGradeInfo(marks) {
  const score = Math.round(Number(marks) || 0);
  const matched = GRADE_SCALE.find(g => score >= g.min) || GRADE_SCALE[GRADE_SCALE.length - 1];
  return matched;
}

export function calculateInternalTotal(cia1, cia2, model, assignment = 10) {
  // CIA1 (out of 50) -> 15%
  // CIA2 (out of 50) -> 15%
  // Model (out of 100) -> 10%
  // Assignment -> 10%
  const c1Scaled = (Math.min(50, Math.max(0, Number(cia1) || 0)) / 50) * 15;
  const c2Scaled = (Math.min(50, Math.max(0, Number(cia2) || 0)) / 50) * 15;
  const modelScaled = (Math.min(100, Math.max(0, Number(model) || 0)) / 100) * 10;
  const assignScaled = Math.min(10, Math.max(0, Number(assignment) || 0));

  const total = Math.round((c1Scaled + c2Scaled + modelScaled + assignScaled) * 10) / 10;
  return total;
}

export function calculateAttendancePercentage(present, total) {
  if (!total || total <= 0) return 100;
  return Math.round(((Number(present) || 0) / total) * 100);
}

export function getAttendanceStatus(percentage) {
  if (percentage >= 75) {
    return { status: 'Eligible', badgeClass: 'b-pass', label: 'Eligible (≥ 75%)' };
  } else if (percentage >= 65) {
    return { status: 'Condonation', badgeClass: 'b-amber', label: 'Condonation Needed (65–74%)' };
  } else {
    return { status: 'Debarred', badgeClass: 'b-fail', label: 'Debarred (< 65%)' };
  }
}

export function calculateSGPA(courseResults) {
  if (!courseResults || courseResults.length === 0) return 0;
  let totalCredits = 0;
  let totalPoints = 0;

  courseResults.forEach(res => {
    const credits = Number(res.credits) || 3;
    const gradeInfo = getGradeInfo(res.totalMarks || res.score || 0);
    totalCredits += credits;
    totalPoints += (credits * gradeInfo.point);
  });

  if (totalCredits === 0) return 0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

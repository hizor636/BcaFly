"""
BcaFly Python Worker — Core Algorithms
Attendance percentage, defaulter detection, and risk scoring.
"""


def attendance_status(attended: int, total: int, threshold: float = 75.0):
    """Calculate attendance status for a student-subject pair."""
    if total == 0:
        return "NO_DATA", 0.0

    percentage = round((attended / total) * 100, 2)

    if percentage < threshold:
        return "SHORTAGE", percentage

    return "ELIGIBLE", percentage


def validate_marks(obtained_marks, maximum_marks):
    """Validate internal marks before saving."""
    if obtained_marks is None:
        return False, "Marks cannot be empty"

    if obtained_marks < 0:
        return False, "Marks cannot be negative"

    if obtained_marks > maximum_marks:
        return False, "Marks cannot exceed maximum marks"

    return True, "Valid marks"


def calculate_grade(percentage: float):
    """Calculate grade and grade point from percentage. Admin-configurable."""
    if percentage >= 90:
        return "O", 10
    if percentage >= 80:
        return "A+", 9
    if percentage >= 70:
        return "A", 8
    if percentage >= 60:
        return "B+", 7
    if percentage >= 50:
        return "B", 6
    if percentage >= 40:
        return "C", 5
    return "F", 0


def calculate_risk_score(
    attendance_pct: float,
    marks_below_pass: bool = False,
    exam_absent: bool = False,
    failed_subjects: int = 0,
    threshold: float = 75.0,
):
    """
    Calculate academic risk score for a student.
    0–29 = Low Risk, 30–59 = Medium Risk, 60+ = High Risk
    """
    score = 0

    if attendance_pct < 60:
        score += 60
    elif attendance_pct < threshold:
        score += 40

    if marks_below_pass:
        score += 30

    if exam_absent:
        score += 50

    score += failed_subjects * 40

    if score <= 29:
        level = "LOW"
    elif score <= 59:
        level = "MEDIUM"
    else:
        level = "HIGH"

    return score, level

"""
BcaFly Attendance Shortage & Risk Score Automation Job
Calculates attendance percentages from PostgreSQL attendance records and updates risk status.
"""
import psycopg
from app.config import DB_CONFIG
from app.algorithms.attendance import attendance_status, calculate_risk_score


def run_attendance_alerts():
    print("[BcaFly Job] Starting Attendance Alerts & Risk Analysis...")
    conn = psycopg.connect(**DB_CONFIG)
    cur = conn.cursor()

    # Get all students
    cur.execute("""
        SELECT sp.id, u.name, sp.reg_no, sp.attendance_pct
        FROM student_profiles sp
        JOIN users u ON sp.user_id = u.id
    """)
    students = cur.fetchall()

    defaulters = []

    for student_id, name, reg_no, recorded_pct in students:
        # Calculate actual sessions
        cur.execute("""
            SELECT 
                COUNT(sa.id) as total_sessions,
                COUNT(CASE WHEN sa.is_present = true OR sa.is_od = true THEN 1 END) as attended_sessions
            FROM student_attendance sa
            WHERE sa.student_id = %s
        """, (student_id,))
        row = cur.fetchone()
        total = row[0] if row else 0
        attended = row[1] if row else 0

        if total > 0:
            status, pct = attendance_status(attended, total, threshold=75.0)
        else:
            status, pct = "ELIGIBLE", float(recorded_pct or 75.0)

        # Calculate risk score
        risk_score, risk_level = calculate_risk_score(pct, threshold=75.0)

        # Update student profile
        cur.execute("""
            UPDATE student_profiles
            SET attendance_pct = %s, risk_status = %s
            WHERE id = %s
        """, (pct, risk_level, student_id))

        if pct < 75.0:
            defaulters.append({
                "student_id": student_id,
                "name": name,
                "reg_no": reg_no,
                "attendance_pct": pct,
                "risk_level": risk_level
            })

    conn.commit()
    cur.close()
    conn.close()

    print(f"[BcaFly Job] Processed {len(students)} students. Found {len(defaulters)} attendance shortage cases.")
    return defaulters


if __name__ == "__main__":
    run_attendance_alerts()

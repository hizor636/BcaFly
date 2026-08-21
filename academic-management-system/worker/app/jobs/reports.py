"""
BcaFly PDF & Excel Report Generator
Generates PDF Department Reports, Marks Cards, and Excel Exports using ReportLab and pandas.
"""
import os
import psycopg
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.config import DB_CONFIG, REPORT_DIR, EXPORT_DIR


def generate_department_pdf_report(semester_id=None):
    os.makedirs(REPORT_DIR, exist_ok=True)
    pdf_path = os.path.join(REPORT_DIR, "BcaFly_Department_Report.pdf")

    conn = psycopg.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute("""
        SELECT sp.reg_no, u.name, s.name as section, sp.cgpa, sp.attendance_pct, sp.risk_status
        FROM student_profiles sp
        JOIN users u ON sp.user_id = u.id
        LEFT JOIN sections s ON sp.section_id = s.id
        ORDER BY sp.reg_no
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor("#2B2118"),
        spaceAfter=6
    )

    sub_style = ParagraphStyle(
        'SubStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor("#786F65"),
        spaceAfter=15
    )

    elements = [
        Paragraph("BcaFly — BCA Department Performance Report", title_style),
        Paragraph("Self-Hosted Academic Management Report • Generated automatically", sub_style),
        Spacer(1, 10)
    ]

    table_data = [["Reg No", "Student Name", "Sec", "CGPA", "Attendance %", "Risk Status"]]
    for r in rows:
        table_data.append([str(r[0]), str(r[1]), str(r[2] or "A"), f"{r[3]:.2f}" if r[3] else "0.00", f"{r[4]:.1f}%" if r[4] else "0.0%", str(r[5])])

    t = Table(table_data, colWidths=[80, 160, 45, 60, 90, 85])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F5E8C9")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#4A3A28")),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (3, 0), (4, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E9DEC9")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#FDFBF7")]),
    ]))

    elements.append(t)
    doc.build(elements)
    print(f"[BcaFly Reports] PDF report generated at: {pdf_path}")
    return pdf_path


def generate_student_excel_export():
    os.makedirs(EXPORT_DIR, exist_ok=True)
    excel_path = os.path.join(EXPORT_DIR, "BcaFly_Student_Master.xlsx")

    conn = psycopg.connect(**DB_CONFIG)
    df = pd.read_sql_query("""
        SELECT sp.reg_no, u.name as student_name, u.email, s.name as section, 
               sp.cgpa, sp.attendance_pct, sp.risk_status
        FROM student_profiles sp
        JOIN users u ON sp.user_id = u.id
        LEFT JOIN sections s ON sp.section_id = s.id
    """, conn)
    conn.close()

    df.to_excel(excel_path, index=False, engine='openpyxl')
    print(f"[BcaFly Reports] Excel export created at: {excel_path}")
    return excel_path


if __name__ == "__main__":
    generate_department_pdf_report()
    generate_student_excel_export()

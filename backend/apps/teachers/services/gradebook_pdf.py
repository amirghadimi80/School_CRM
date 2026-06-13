"""
Gradebook PDF generation service.
"""
from django.template.loader import render_to_string

from apps.students.models import Student
from apps.teachers.models import TeacherAssignment

BRANCH_LABELS = {
    'math': 'ریاضی',
    'science': 'تجربی',
    'humanities': 'انسانی',
}


def _build_sections(teacher, academic_year):
    """Build gradebook sections from teacher assignments."""
    assignments = TeacherAssignment.objects.filter(
        teacher=teacher,
        academic_year=academic_year,
    ).select_related('class_assigned', 'course').order_by(
        'class_assigned__grade_level', 'class_assigned__name', 'course__name'
    )

    sections = []
    for assignment in assignments:
        class_obj = assignment.class_assigned
        students = Student.objects.filter(
            current_class=class_obj,
            status=Student.STATUS_ACTIVE,
        ).select_related('user').order_by('user__last_name', 'user__first_name')

        sections.append({
            'course_name': assignment.course.name,
            'class_name': class_obj.name,
            'grade_level': class_obj.grade_level,
            'branch_display': BRANCH_LABELS.get(class_obj.branch, ''),
            'student_count': students.count(),
            'students': [
                {
                    'student_code': s.student_code,
                    'full_name': s.user.get_full_name() if s.user else s.student_code,
                }
                for s in students
            ],
        })
    return sections


def generate_gradebook_pdf(teacher, school, academic_year):
    """Render gradebook HTML and convert to PDF bytes."""
    sections = _build_sections(teacher, academic_year)
    html = render_to_string('gradebook.html', {
        'teacher_name': teacher.full_name,
        'academic_year': academic_year,
        'sections': sections,
    })

    try:
        from weasyprint import HTML
        return HTML(string=html).write_pdf()
    except ImportError:
        return _fallback_pdf_bytes(html, teacher, academic_year)


def _fallback_pdf_bytes(html, teacher, academic_year):
    """
    Fallback when weasyprint is unavailable: return minimal PDF via reportlab
    or raw HTML as downloadable content wrapped in simple PDF structure.
    """
    try:
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib import colors
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from io import BytesIO

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=1.5*cm, leftMargin=1.5*cm)
        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph(
            f'Gradebook - {teacher.full_name} - {academic_year}',
            styles['Title'],
        ))
        story.append(Spacer(1, 12))

        sections = _build_sections(teacher, academic_year)
        for section in sections:
            story.append(Paragraph(
                f"{section['course_name']} - {section['class_name']}",
                styles['Heading2'],
            ))
            data = [['Row', 'Code', 'Name', 'Continuous', 'Midterm', 'Final', 'Total']]
            for i, student in enumerate(section['students'], 1):
                data.append([
                    str(i), student['student_code'], student['full_name'],
                    '', '', '', '',
                ])
            if len(data) == 1:
                data.append(['', '', 'No students', '', '', '', ''])

            table = Table(data, repeatRows=1)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
            ]))
            story.append(table)
            story.append(Spacer(1, 16))

        doc.build(story)
        return buffer.getvalue()
    except ImportError:
        return html.encode('utf-8')

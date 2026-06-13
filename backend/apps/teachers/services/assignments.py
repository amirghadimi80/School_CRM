"""
Teacher assignment helpers.
"""
from apps.schools.models import Curriculum


def get_curriculum_for_class(class_obj, school):
    """Return curriculum entries for a class's grade level and branch."""
    branch = class_obj.branch if int(class_obj.grade_level) >= 10 else None
    return Curriculum.objects.filter(
        school=school,
        grade_level=class_obj.grade_level,
        branch=branch,
    ).select_related('course').order_by('course__name')


def get_academic_year(school, override=None):
    """Resolve academic year string from school or override."""
    if override:
        return override
    return school.current_academic_year or ''


def build_assignment_rows(class_obj, school, academic_year):
    """Build assignment rows with curriculum courses and current teachers."""
    from apps.teachers.models import TeacherAssignment

    curriculum = get_curriculum_for_class(class_obj, school)
    existing = {
        a.course_id: a
        for a in TeacherAssignment.objects.filter(
            class_assigned=class_obj,
            academic_year=academic_year,
        ).select_related('teacher', 'course')
    }

    rows = []
    for entry in curriculum:
        assignment = existing.get(entry.course_id)
        rows.append({
            'course_id': entry.course_id,
            'course_name': entry.course.name,
            'course_code': entry.course.code,
            'weekly_hours': entry.weekly_hours,
            'teacher_id': assignment.teacher_id if assignment else None,
            'teacher_name': assignment.teacher.full_name if assignment else None,
            'is_assigned': assignment is not None,
        })
    return rows


def get_assignment_status(class_obj, school, academic_year):
    """Return assignment completion status for a class."""
    rows = build_assignment_rows(class_obj, school, academic_year)
    total = len(rows)
    assigned = sum(1 for r in rows if r['is_assigned'])
    missing = [r['course_name'] for r in rows if not r['is_assigned']]
    return {
        'total_courses': total,
        'assigned_count': assigned,
        'is_complete': total > 0 and assigned == total,
        'missing_courses': missing,
    }

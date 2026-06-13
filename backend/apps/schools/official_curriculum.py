"""
Official Iranian high school curriculum templates (grades 10-12).
Each entry: (course_code, is_specialized, weekly_hours)
"""
from typing import Optional

# grade_level, branch -> list of (code, is_specialized, weekly_hours)
HIGH_SCHOOL_TEMPLATES: dict[tuple[str, str], list[tuple[str, bool, int]]] = {
    # پایه دهم ریاضی
    ('10', 'math'): [
        ('MA-M10', True, 3),
        ('GE-M10', True, 3),
        ('CH-M10', True, 3),
        ('PH-M10', True, 3),
        ('FA-10', False, 3),
        ('NG-10', False, 2),
        ('DN-10', False, 2),
        ('AR-10', False, 2),
        ('EN-10', False, 3),
        ('JG-M10', False, 2),
        ('HI-H10', False, 2),
        ('AD-10', False, 1),
    ],
    # پایه دهم تجربی
    ('10', 'science'): [
        ('FA-10', False, 3),
        ('NG-10', False, 2),
        ('DN-10', False, 2),
        ('AR-10', False, 2),
        ('EN-10', False, 3),
        ('ENW-10', False, 1),
        ('GE-S10', False, 2),
        ('TS-10', False, 1),
        ('AD-10', False, 1),
        ('KA-10', False, 1),
        ('MA-S10', True, 3),
        ('PH-S10', True, 3),
        ('CH-S10', True, 3),
        ('BI-S10', True, 3),
        ('LB-S10', True, 1),
    ],
    # پایه دهم انسانی
    ('10', 'humanities'): [
        ('FA-10', False, 3),
        ('NG-10', False, 2),
        ('DN-10', False, 2),
        ('AR-10', False, 2),
        ('EN-10', False, 3),
        ('ENW-10', False, 1),
        ('TS-10', False, 1),
        ('AD-10', False, 1),
        ('KA-10', False, 1),
        ('RM-H10', True, 3),
        ('AD-H10', True, 3),
        ('HI-H10', True, 2),
        ('JG-H10', True, 2),
        ('EC-H10', True, 2),
        ('LG-H10', True, 2),
        ('SO-H10', True, 2),
    ],
    # پایه یازدهم ریاضی
    ('11', 'math'): [
        ('FA-11', False, 3),
        ('NG-11', False, 2),
        ('DN-11', False, 2),
        ('AR-11', False, 2),
        ('EN-11', False, 3),
        ('ENW-11', False, 1),
        ('HT-11', False, 2),
        ('EH-11', False, 1),
        ('GS-11', False, 2),
        ('HS-M11', True, 3),
        ('GE-M11', True, 3),
        ('ST-M11', True, 2),
        ('PH-M11', True, 3),
        ('CH-M11', True, 3),
    ],
    # پایه یازدهم تجربی
    ('11', 'science'): [
        ('FA-11', False, 3),
        ('NG-11', False, 2),
        ('DN-11', False, 2),
        ('AR-11', False, 2),
        ('EN-11', False, 3),
        ('ENW-11', False, 1),
        ('HT-11', False, 2),
        ('EH-11', False, 1),
        ('MA-S11', True, 3),
        ('PH-S11', True, 3),
        ('CH-S11', True, 3),
        ('BI-S11', True, 3),
        ('GS-11', True, 2),
        ('LB-S11', True, 1),
    ],
    # پایه یازدهم انسانی
    ('11', 'humanities'): [
        ('FA-11', False, 3),
        ('NG-11', False, 2),
        ('DN-11', False, 2),
        ('AR-11', False, 2),
        ('EN-11', False, 3),
        ('ENW-11', False, 1),
        ('EH-11', False, 1),
        ('RM-H11', True, 3),
        ('AD-H11', True, 3),
        ('HI-H11', True, 2),
        ('JG-H11', True, 2),
        ('FL-H11', True, 2),
        ('SO-H11', True, 2),
        ('PS-H11', True, 2),
    ],
    # پایه دوازدهم ریاضی
    ('12', 'math'): [
        ('FA-12', False, 3),
        ('NG-12', False, 2),
        ('DN-12', False, 2),
        ('AR-12', False, 2),
        ('EN-12', False, 3),
        ('ENW-12', False, 1),
        ('ID-12', False, 2),
        ('HE-12', False, 1),
        ('HS-M12', True, 3),
        ('GE-M12', True, 3),
        ('DM-M12', True, 2),
        ('PH-M12', True, 3),
        ('CH-M12', True, 3),
    ],
    # پایه دوازدهم تجربی
    ('12', 'science'): [
        ('FA-12', False, 3),
        ('NG-12', False, 2),
        ('DN-12', False, 2),
        ('AR-12', False, 2),
        ('EN-12', False, 3),
        ('ENW-12', False, 1),
        ('ID-12', False, 2),
        ('HE-12', False, 1),
        ('MA-S12', True, 3),
        ('PH-S12', True, 3),
        ('CH-S12', True, 3),
        ('BI-S12', True, 3),
    ],
    # پایه دوازدهم انسانی
    ('12', 'humanities'): [
        ('FA-12', False, 3),
        ('NG-12', False, 2),
        ('DN-12', False, 2),
        ('AR-12', False, 2),
        ('EN-12', False, 3),
        ('ENW-12', False, 1),
        ('HE-12', False, 1),
        ('RM-H12', True, 3),
        ('AD-H12', True, 3),
        ('HI-H12', True, 2),
        ('JG-H12', True, 2),
        ('SO-H12', True, 2),
        ('FL-H12', True, 2),
    ],
}


def get_official_template(grade_level: str, branch: Optional[str]) -> list[dict]:
    """Return official curriculum template items for grade/branch."""
    if int(grade_level) < 10 or not branch:
        return []

    key = (grade_level, branch)
    template = HIGH_SCHOOL_TEMPLATES.get(key, [])
    return [
        {
            'course_code': code,
            'is_specialized': is_spec,
            'weekly_hours': hours,
        }
        for code, is_spec, hours in template
    ]


def ensure_official_curriculum(school, grade_level: str, branch: Optional[str]) -> dict:
    """
    Ensure school's curriculum has all official courses for grade/branch.
    Adds missing entries only; does not remove user additions.
    """
    from apps.classes.models import Course
    from apps.schools.models import Curriculum

    template = get_official_template(grade_level, branch)
    if not template:
        return {'created': 0, 'skipped': 0, 'missing_courses': [], 'entries': []}

    branch_value = branch if int(grade_level) >= 10 else None
    created = 0
    skipped = 0
    missing_courses = []
    entries = []

    for item in template:
        course = Course.objects.filter(
            code=item['course_code'],
            school__isnull=True,
            is_active=True,
        ).first()
        if not course:
            missing_courses.append(item['course_code'])
            continue

        obj, was_created = Curriculum.objects.get_or_create(
            school=school,
            grade_level=grade_level,
            branch=branch_value,
            course=course,
            defaults={
                'weekly_hours': item['weekly_hours'],
                'is_specialized': item['is_specialized'],
            },
        )
        if was_created:
            created += 1
        else:
            skipped += 1
        entries.append(obj)

    return {
        'created': created,
        'skipped': skipped,
        'missing_courses': missing_courses,
        'total': len(template),
    }

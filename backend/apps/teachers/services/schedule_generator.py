"""
Schedule generation service.
"""
from apps.schools.models import (
    Curriculum, Period, TeacherAvailability, GeneratedSchedule,
)
from apps.teachers.models import TeacherAssignment
from apps.teachers.services.assignments import get_assignment_status, get_curriculum_for_class


def validate_schedule_prerequisites(class_obj, school, academic_year):
    """
    Validate all prerequisites before generating a class schedule.
    Returns (errors, warnings) lists.
    """
    errors = []
    warnings = []

    if int(class_obj.grade_level) >= 10 and not class_obj.branch:
        errors.append('رشته کلاس مشخص نشده است.')

    curriculum = list(get_curriculum_for_class(class_obj, school))
    if not curriculum:
        errors.append('برنامه درسی برای این پایه و رشته تعریف نشده است.')

    status = get_assignment_status(class_obj, school, academic_year)
    if not status['is_complete']:
        missing = '، '.join(status['missing_courses'])
        errors.append(f'{len(status["missing_courses"])} درس بدون معلم: {missing}')

    periods = Period.objects.filter(school=school)
    if not periods.exists():
        errors.append('زنگ‌های مدرسه تنظیم نشده است.')

    assignments = TeacherAssignment.objects.filter(
        class_assigned=class_obj,
        academic_year=academic_year,
    ).select_related('teacher')
    teachers_without_availability = []
    for assignment in assignments:
        if not TeacherAvailability.objects.filter(teacher=assignment.teacher).exists():
            teachers_without_availability.append(assignment.teacher.full_name)

    if teachers_without_availability:
        names = '، '.join(teachers_without_availability)
        errors.append(f'معلمان بدون زمان‌بندی: {names}')

    return errors, warnings


def _teacher_available(teacher, day, period_number, availability_cache):
    """Check if teacher is available on a given day/period."""
    day_avail = availability_cache.get((teacher.id, day), [])
    return period_number in day_avail


def _build_availability_cache(teachers):
    """Build lookup cache for teacher availability."""
    cache = {}
    for avail in TeacherAvailability.objects.filter(teacher__in=teachers):
        cache[(avail.teacher_id, avail.day_of_week)] = avail.periods or []
    return cache


def generate_class_schedule(class_obj, school, academic_year, regenerate=False):
    """
    Generate weekly schedule for a single class.
    Returns dict with generated count, schedules, unplaced_hours, warnings.
    """
    errors, warnings = validate_schedule_prerequisites(class_obj, school, academic_year)
    if errors:
        return {'success': False, 'errors': errors, 'warnings': warnings}

    if regenerate:
        GeneratedSchedule.objects.filter(
            class_assigned=class_obj,
            academic_year=academic_year,
        ).delete()

    curriculum = list(
        get_curriculum_for_class(class_obj, school).order_by('-weekly_hours')
    )
    periods = list(Period.objects.filter(school=school).order_by('period_number'))
    days = range(6)

    assignment_map = {
        a.course_id: a
        for a in TeacherAssignment.objects.filter(
            class_assigned=class_obj,
            academic_year=academic_year,
        ).select_related('teacher')
    }

    teachers = [a.teacher for a in assignment_map.values()]
    availability_cache = _build_availability_cache(teachers)

    generated = []
    unplaced_hours = []

    for entry in curriculum:
        assignment = assignment_map.get(entry.course_id)
        if not assignment:
            unplaced_hours.append({
                'course': entry.course.name,
                'remaining': entry.weekly_hours,
            })
            continue

        teacher = assignment.teacher
        hours_needed = entry.weekly_hours

        for day in days:
            if hours_needed <= 0:
                break
            for period in periods:
                if hours_needed <= 0:
                    break

                class_slot_taken = GeneratedSchedule.objects.filter(
                    class_assigned=class_obj,
                    day_of_week=day,
                    period=period,
                    academic_year=academic_year,
                    is_active=True,
                ).exists()
                if class_slot_taken:
                    continue

                if not _teacher_available(teacher, day, period.period_number, availability_cache):
                    continue

                teacher_conflict = GeneratedSchedule.objects.filter(
                    teacher=teacher,
                    day_of_week=day,
                    period=period,
                    academic_year=academic_year,
                    is_active=True,
                ).exists()
                if teacher_conflict:
                    continue

                schedule = GeneratedSchedule.objects.create(
                    class_assigned=class_obj,
                    course=entry.course,
                    teacher=teacher,
                    day_of_week=day,
                    period=period,
                    academic_year=academic_year,
                )
                generated.append(schedule)
                hours_needed -= 1

        if hours_needed > 0:
            unplaced_hours.append({
                'course': entry.course.name,
                'remaining': hours_needed,
            })
            warnings.append(
                f'{hours_needed} زنگ {entry.course.name} جا مانده — زمان آزاد معلم کافی نیست.'
            )

    from apps.schools.serializers import GeneratedScheduleSerializer
    serializer = GeneratedScheduleSerializer(generated, many=True)

    return {
        'success': True,
        'generated': len(generated),
        'schedules': serializer.data,
        'unplaced_hours': unplaced_hours,
        'warnings': warnings,
        'status': 'partial' if unplaced_hours else 'complete',
    }

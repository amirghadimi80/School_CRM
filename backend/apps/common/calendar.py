"""Calendar helpers.

Schedule rows store day_of_week as Saturday=0 … Friday=6.
datetime.date.weekday() is Monday=0 … Sunday=6.
"""


def iran_weekday(value):
    """Return the Iranian week index for a date (Saturday=0 … Friday=6)."""
    return (value.weekday() + 2) % 7

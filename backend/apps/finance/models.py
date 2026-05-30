"""
Finance and payment models.
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class FeeType(BaseModel):
    """
    Types of fees/charges (tuition, registration, etc.).
    """
    name = models.CharField(max_length=255, verbose_name=_('Fee Name'))
    code = models.CharField(max_length=50, verbose_name=_('Fee Code'))
    
    # Category
    CATEGORY_TUITION = 'tuition'
    CATEGORY_REGISTRATION = 'registration'
    CATEGORY_EXAM = 'exam'
    CATEGORY_BOOKS = 'books'
    CATEGORY_UNIFORM = 'uniform'
    CATEGORY_TRANSPORT = 'transport'
    CATEGORY_ACTIVITY = 'activity'
    CATEGORY_OTHER = 'other'
    
    CATEGORY_CHOICES = [
        (CATEGORY_TUITION, _('Tuition')),
        (CATEGORY_REGISTRATION, _('Registration')),
        (CATEGORY_EXAM, _('Exam Fee')),
        (CATEGORY_BOOKS, _('Books & Materials')),
        (CATEGORY_UNIFORM, _('Uniform')),
        (CATEGORY_TRANSPORT, _('Transportation')),
        (CATEGORY_ACTIVITY, _('Activities')),
        (CATEGORY_OTHER, _('Other')),
    ]
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default=CATEGORY_TUITION,
        verbose_name=_('Category')
    )
    
    default_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_('Default Amount (Toman)')
    )
    
    description = models.TextField(blank=True, verbose_name=_('Description'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    is_recurring = models.BooleanField(
        default=False,
        verbose_name=_('Is Recurring'),
        help_text=_('e.g., monthly tuition')
    )
    
    class Meta:
        verbose_name = _('Fee Type')
        verbose_name_plural = _('Fee Types')
        unique_together = ['school', 'code']
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class Invoice(BaseModel):
    """
    Invoice for a student.
    """
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='invoices',
        verbose_name=_('Student')
    )
    
    # Invoice details
    invoice_number = models.CharField(
        max_length=50,
        verbose_name=_('Invoice Number'),
        db_index=True
    )
    fee_type = models.ForeignKey(
        FeeType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
        verbose_name=_('Fee Type')
    )
    
    # Amounts
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_('Amount (Toman)')
    )
    discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_('Discount (Toman)')
    )
    tax = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_('Tax (Toman)')
    )
    
    @property
    def total_amount(self):
        return self.amount - self.discount + self.tax
    
    # Dates
    issue_date = models.DateField(verbose_name=_('Issue Date'))
    due_date = models.DateField(verbose_name=_('Due Date'))
    
    # Status
    STATUS_PENDING = 'pending'
    STATUS_PAID = 'paid'
    STATUS_PARTIAL = 'partial'
    STATUS_OVERDUE = 'overdue'
    STATUS_CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (STATUS_PENDING, _('Pending')),
        (STATUS_PAID, _('Paid')),
        (STATUS_PARTIAL, _('Partially Paid')),
        (STATUS_OVERDUE, _('Overdue')),
        (STATUS_CANCELLED, _('Cancelled')),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        verbose_name=_('Status')
    )
    
    # Paid amount tracking
    paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_('Paid Amount')
    )
    
    # Description
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    class Meta:
        verbose_name = _('Invoice')
        verbose_name_plural = _('Invoices')
        ordering = ['-issue_date']
        unique_together = ['school', 'invoice_number']
        indexes = [
            models.Index(fields=['school', 'status']),
            models.Index(fields=['student', 'status']),
            models.Index(fields=['due_date', 'status']),
        ]
    
    def __str__(self):
        return f"{self.invoice_number} - {self.student.student_code} - {self.total_amount} Toman"
    
    @property
    def remaining_amount(self):
        return self.total_amount - self.paid_amount
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        return self.due_date < timezone.now().date() and self.status != self.STATUS_PAID


class Payment(BaseModel):
    """
    Payment received for an invoice.
    """
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name=_('Invoice')
    )
    
    # Payment details
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_('Amount (Toman)')
    )
    
    # Method
    METHOD_CASH = 'cash'
    METHOD_CARD = 'card'
    METHOD_TRANSFER = 'transfer'
    METHOD_CHECK = 'check'
    METHOD_ONLINE = 'online'
    METHOD_OTHER = 'other'
    
    METHOD_CHOICES = [
        (METHOD_CASH, _('Cash')),
        (METHOD_CARD, _('Card Terminal')),
        (METHOD_TRANSFER, _('Bank Transfer')),
        (METHOD_CHECK, _('Check')),
        (METHOD_ONLINE, _('Online Payment')),
        (METHOD_OTHER, _('Other')),
    ]
    
    method = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES,
        default=METHOD_CASH,
        verbose_name=_('Payment Method')
    )
    
    # Transaction details
    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Transaction ID')
    )
    reference_number = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Reference Number')
    )
    
    # Date
    payment_date = models.DateField(verbose_name=_('Payment Date'))
    
    # Who received
    received_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_payments',
        verbose_name=_('Received By')
    )
    
    # Receipt
    receipt_number = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('Receipt Number')
    )
    
    # Notes
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    class Meta:
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Payment {self.amount} Toman - {self.invoice.invoice_number}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update invoice paid amount
        total_paid = Payment.objects.filter(invoice=self.invoice).aggregate(
            models.Sum('amount')
        )['amount__sum'] or 0
        self.invoice.paid_amount = total_paid
        
        # Update invoice status
        if self.invoice.paid_amount >= self.invoice.total_amount:
            self.invoice.status = Invoice.STATUS_PAID
        elif self.invoice.paid_amount > 0:
            self.invoice.status = Invoice.STATUS_PARTIAL
        else:
            self.invoice.status = Invoice.STATUS_PENDING
        
        self.invoice.save(update_fields=['paid_amount', 'status'])


class Discount(BaseModel):
    """
    Discount rules for students.
    """
    name = models.CharField(max_length=255, verbose_name=_('Discount Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Discount type
    TYPE_PERCENTAGE = 'percentage'
    TYPE_FIXED = 'fixed'
    
    TYPE_CHOICES = [
        (TYPE_PERCENTAGE, _('Percentage')),
        (TYPE_FIXED, _('Fixed Amount')),
    ]
    
    discount_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default=TYPE_PERCENTAGE,
        verbose_name=_('Discount Type')
    )
    
    value = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name=_('Value'),
        help_text=_('Percentage (e.g., 10.00) or fixed amount')
    )
    
    # Applicable fee types
    applicable_fees = models.ManyToManyField(
        FeeType,
        blank=True,
        verbose_name=_('Applicable Fee Types')
    )
    
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    class Meta:
        verbose_name = _('Discount')
        verbose_name_plural = _('Discounts')
    
    def __str__(self):
        return f"{self.name} - {self.value}{'%' if self.discount_type == self.TYPE_PERCENTAGE else ' Toman'}"


class StudentDiscount(BaseModel):
    """
    Applied discounts for specific students.
    """
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='discounts',
        verbose_name=_('Student')
    )
    discount = models.ForeignKey(
        Discount,
        on_delete=models.CASCADE,
        related_name='student_discounts',
        verbose_name=_('Discount')
    )
    
    reason = models.TextField(blank=True, verbose_name=_('Reason'))
    valid_from = models.DateField(verbose_name=_('Valid From'))
    valid_until = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('Valid Until')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    class Meta:
        verbose_name = _('Student Discount')
        verbose_name_plural = _('Student Discounts')
        unique_together = ['student', 'discount']
    
    def __str__(self):
        return f"{self.student.student_code} - {self.discount.name}"

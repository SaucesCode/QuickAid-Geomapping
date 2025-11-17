from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone
from opencage.geocoder import OpenCageGeocode
import os
import uuid

OPENCAGE_API_KEY = os.environ.get('OPENCAGE_API_KEY')

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    last_active = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ref_code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return self.username

class Region(models.Model):
    name = models.CharField(max_length=255)
    psgc_code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name

class Province(models.Model):
    name = models.CharField(max_length=255)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    psgc_code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name


class City(models.Model):
    name = models.CharField(max_length=255)
    province = models.ForeignKey(Province, on_delete=models.CASCADE)
    psgc_code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name


class Barangay(models.Model):
    name = models.CharField(max_length=255)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    psgc_code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name

class BackgroundInfo(models.Model):
    SEX_CHOICES = [('Male', 'Male'), ('Female', 'Female')]
    #
    first_name = models.CharField(max_length=100)
    middle_initial = models.CharField(max_length=20, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=10, blank=True, null=True)
    birthday = models.DateField()
    street_address = models.CharField(max_length=255)
    barangay = models.ForeignKey(Barangay, on_delete=models.CASCADE)
    sex = models.CharField(max_length=10, choices=SEX_CHOICES)
    civil_status = models.CharField(max_length=20)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def application_count(self):
        return self.applicant_set.count()

    def application_history(self):
        return self.applicant_set.order_by('-date_filled')
    class Meta:
        unique_together = ("first_name", "last_name", "birthday")

class Applicant(models.Model):
    ASSISTANCE_TYPES = [
        ('Medical', 'Medical'),
        ('Burial', 'Burial'),
        ('Educational', 'Educational'),
    ]

    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    background_info = models.ForeignKey(BackgroundInfo, on_delete=models.CASCADE)
    contact_number = models.CharField(max_length=15)
    valid_id_presented = models.CharField(max_length=255)
    other_valid_id = models.CharField(max_length=255, blank=True, null=True)
    applicant_type = models.CharField(max_length=20, choices=[('Self', 'Self'), ('Representative', 'Representative')], default='Self')
    type_of_assistance = models.CharField(max_length=50, choices=ASSISTANCE_TYPES)
    longitude = models.FloatField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    date_filled = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)


    def save(self, *args, **kwargs):
        if not self.latitude or not self.longitude:
            location_query = f"{self.background_info.barangay.name}, {self.background_info.barangay.city.name}, {self.background_info.barangay.city.province.name}"
            self.latitude, self.longitude = self.get_coordinates(location_query)
        super().save(*args, **kwargs)

    def get_coordinates(self, address):
        geocoder = OpenCageGeocode(OPENCAGE_API_KEY)
        result = geocoder.geocode(address)
        if result and len(result):
            return result[0]['geometry']['lat'], result[0]['geometry']['lng']
        return None, None

    def __str__(self):
        return f"{self.background_info.first_name} {self.background_info.last_name} - {self.type_of_assistance}"

class Representative(models.Model):
    applicant = models.OneToOneField(Applicant, on_delete=models.CASCADE)
    background_info = models.ForeignKey(BackgroundInfo, on_delete=models.CASCADE)
    relationship = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.background_info.first_name} - Representative of {self.applicant}"
    
class ApplicantHistory(models.Model):
    background_info = models.ForeignKey(BackgroundInfo, on_delete=models.CASCADE, related_name="histories")
    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name="history_entry")
    type_of_assistance = models.CharField(max_length=50)
    date_applied = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.background_info} applied for {self.type_of_assistance} on {self.date_applied}"
    
class Approval(models.Model):
    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name="approvals")
    batch = models.ForeignKey("ApprovalBatch", on_delete=models.CASCADE, related_name="approvals", null=True, blank=True)
    approved_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="approvals"
    )
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Approval for {self.applicant} at {self.approved_at}"

class ApprovalBatch(models.Model):
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="approval_batches"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255)
    total_processed = models.IntegerField(default=0)
    total_approved = models.IntegerField(default=0)
    total_already_approved = models.IntegerField(default=0)
    total_not_found = models.IntegerField(default=0)

    def __str__(self):
        return f"Batch {self.id} by {self.uploaded_by} on {self.uploaded_at}"


class StaffActivityLog(models.Model):
    ACTION_TYPES = [
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('CREATE', 'Create Application'),
        ('UPDATE', 'Update Application'),
        ('ARCHIVE', 'Archive Application'),
        ('RESTORE', 'Restore Application'),
        ('DELETE', 'Delete Application'),
        ('PASSWORD', 'Change Password'),
        ('PROFILE', 'Update Profile'),
    ]

    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    details = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.staff.username} - {self.action} - {self.timestamp}"

class SupportMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({'Resolved' if self.is_resolved else 'Pending'})"


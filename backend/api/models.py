from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from opencage.geocoder import OpenCageGeocode

OPENCAGE_API_KEY = "97bff458c2874bbdb716af30af9607cc"

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    last_active = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    middle_initial = models.CharField(max_length=5, blank=True, null=True)
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

class Applicant(models.Model):
    ASSISTANCE_TYPES = [
        ('Medical', 'Medical'),
        ('Burial', 'Burial'),
        ('Educational', 'Educational'),
    ]

    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    background_info = models.ForeignKey(BackgroundInfo, on_delete=models.CASCADE)
    contact_number = models.CharField(max_length=15)
    valid_id_presented = models.CharField(max_length=255)
    other_valid_id = models.CharField(max_length=255, blank=True, null=True)
    applicant_type = models.CharField(max_length=20, choices=[('Self', 'Self'), ('Representative', 'Representative')], default='Self')
    type_of_assistance = models.CharField(max_length=50, choices=ASSISTANCE_TYPES)
    longitude = models.FloatField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    date_filled = models.DateTimeField(auto_now_add=True)
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

    def __str__(self):
        return f"{self.background_info.first_name} - Representative of {self.applicant}"



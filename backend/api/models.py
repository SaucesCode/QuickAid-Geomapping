from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
# from geopy.geocoders import Nominatim
from opencage.geocoder import OpenCageGeocode
import random

OPENCAGE_API_KEY = "97bff458c2874bbdb716af30af9607cc" 


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')

class Applicant(models.Model):
    ASSISTANCE_TYPES = [
        ('Medical', 'Medical'),
        ('Burial', 'Burial'),
        ('Educational', 'Educational'),
    ]

    CIVIL_STATUS = [
        ('Single', 'Single'), ('Married', 'Married'), ('Widowed', 'Widowed'),
        ('Separated', 'Separated'), ('Divorced', 'Divorced')
    ]

    GENDER_CHOICES = [('Male', 'Male'), ('Female', 'Female')]

    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # 🟢 Basic Info 1.0
    first_name = models.CharField(max_length=100)
    middle_initial = models.CharField(max_length=5, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=10, blank=True, null=True)
    contact_number = models.CharField(max_length=15)

    purok = models.CharField(max_length=255)
    barangay = models.CharField(max_length=100)
    city_municipality = models.CharField(max_length=100)
    province = models.CharField(max_length=100)

    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    # 🟢 Basic Info 1.1
    birthday = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    civil_status = models.CharField(max_length=20, choices=CIVIL_STATUS)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # 🟢 Valid ID & Beneficiary
    valid_id_presented = models.CharField(max_length=255)
    other_valid_id = models.CharField(max_length=255, blank=True, null=True)
    applicant_type = models.CharField(max_length=20, choices=[('Self', 'Self'), ('Representative', 'Representative')], default='Self')

    # Representative fields (if applicant is a representative)
    rep_first_name = models.CharField(max_length=100, blank=True, null=True)
    rep_last_name = models.CharField(max_length=100, blank=True, null=True)
    rep_middle_initial = models.CharField(max_length=5, blank=True, null=True)
    rep_suffix = models.CharField(max_length=10, blank=True, null=True)
    rep_address = models.TextField(blank=True, null=True)
    rep_birthday = models.DateField(blank=True, null=True)
    rep_gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    rep_civil_status = models.CharField(max_length=20, choices=CIVIL_STATUS, blank=True, null=True)
    rep_occupation = models.CharField(max_length=100, blank=True, null=True)
    rep_monthly_income = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    rep_relationship = models.CharField(max_length=100, blank=True, null=True)

    # 🟢 Assistance Details
    type_of_assistance = models.CharField(max_length=50, choices=ASSISTANCE_TYPES)

    date_filled = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)


    def save(self, *args, **kwargs):
        if not self.latitude or not self.longitude:
            location_query = f"{self.barangay}, {self.city_municipality}, {self.province}"
            self.latitude, self.longitude = self.get_coordinates(location_query)
        super().save(*args, **kwargs)


    # def get_coordinates(self, address):
    #     geolocator = Nominatim(user_agent="quickaid-geomapping")
    #     location = geolocator.geocode(address)

    #     if location:
    #         jitter_lat = random.uniform(-0.0010, 0.0010)
    #         jitter_lng = random.uniform(-0.0010, 0.0010)
    #         return location.latitude + jitter_lat, location.longitude + jitter_lng
    #     return None, None

    def get_coordinates(self, address):
        geocoder = OpenCageGeocode(OPENCAGE_API_KEY)
        result = geocoder.geocode(address)

        if result and len(result):
            return result[0]['geometry']['lat'], result[0]['geometry']['lng']
        return None, None

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.type_of_assistance}"



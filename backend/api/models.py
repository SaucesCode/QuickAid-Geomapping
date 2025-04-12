from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from geopy.geocoders import Nominatim


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('staff', 'Staff'),
        ('project_maker', 'Project Maker'),
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

    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # 🟢 Basic Info 1.0
    first_name = models.CharField(max_length=100)
    middle_initial = models.CharField(max_length=5, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=10, blank=True, null=True)
    contact_number = models.CharField(max_length=15)

    purok = models.CharField(max_length=255)  # ✅ Still saved but not used for geocoding
    barangay = models.CharField(max_length=100)
    city_municipality = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    # 🟢 Basic Info 1.1
    birthday = models.DateField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')])
    civil_status = models.CharField(max_length=20, choices=CIVIL_STATUS)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # 🟢 Valid ID & Beneficiary
    valid_id_presented = models.CharField(max_length=255)
    beneficiary_name = models.CharField(max_length=255)

    # 🟢 Assistance Details
    type_of_assistance = models.CharField(max_length=50, choices=ASSISTANCE_TYPES)
    justification = models.TextField()

    date_filled = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.latitude or not self.longitude:  # Only fetch if not already set
            # 🌍 Only use barangay, city, and province for geocoding (NOT purok_street)
            location_query = f"{self.barangay}, {self.city_municipality}, {self.province}"
            self.latitude, self.longitude = self.get_coordinates(location_query)

        super().save(*args, **kwargs)  # Save to DB

    def get_coordinates(self, address):
        geolocator = Nominatim(user_agent="quickaid-geomapping")
        location = geolocator.geocode(address)

        if location:
            return location.latitude, location.longitude  # ✅ Return coordinates
        return None, None  # ❌ No coordinates found

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.type_of_assistance}"


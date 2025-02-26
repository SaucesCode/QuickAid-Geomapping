from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
import requests
from geopy.geocoders import Nominatim
import googlemaps


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('staff', 'Staff'),
        ('project_maker', 'Project Maker'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')



class Applicant(models.Model):
    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Personal Information
    first_name = models.CharField(max_length=100)
    middle_initial = models.CharField(max_length=5, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')])
    contact_number = models.CharField(max_length=15)

    # Address
    purok_street = models.CharField(max_length=255)
    barangay = models.CharField(max_length=100)
    city_municipality = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    # Assistance Details
    type_of_assistance = models.CharField(max_length=255)
    justification = models.TextField()
    
    date_filled = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.latitude or not self.longitude:  # Only fetch if not already set
            full_address = f"{self.purok_street}, {self.barangay}, {self.city_municipality}, {self.province}"
            self.latitude, self.longitude = self.get_coordinates(full_address)

        super().save(*args, **kwargs)  # Save to DB


    def get_coordinates(self, address):
        geolocator = Nominatim(user_agent="quickaid-geomapping")  # Unique user-agent required
        location = geolocator.geocode(address)

        if location:
            return location.latitude, location.longitude  # ✅ Return coordinates
        return None, None  # ❌ No coordinates found


    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.type_of_assistance}"


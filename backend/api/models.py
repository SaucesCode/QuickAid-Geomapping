from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('staff', 'Staff'),
        ('project_maker', 'Project Maker'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')

class Applicant(models.Model):
    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # Link to CustomUser
    full_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=20)
    address = models.TextField()
    date_filled = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} (Added by {self.staff.username} on {self.date_filled})"
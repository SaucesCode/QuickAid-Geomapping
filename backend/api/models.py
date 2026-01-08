import os
import uuid
import json
import random
import hashlib
import requests
from django.core.cache import cache
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone


cache_key = "applicant_locations"
cache.delete(cache_key)

import hashlib

def sanitize_cache_key(key):
    """
    Sanitize cache keys to ensure compatibility with all cache backends.
    """
    # Use a hash for long or unsafe keys
    if len(key) > 200 or any(c in key for c in " ,:"):
        return hashlib.md5(key.encode()).hexdigest()
    return key


def load_barangay_coordinates():
    """
    Load barangay coordinates from JSON file.
    Cached for performance.
    """
    cache_key = "barangay_coordinates_data"
    cached = cache.get(cache_key)
    
    if cached:
        return cached
    
    # Path to your JSON file (adjust as needed)
    json_path = os.path.join(settings.BASE_DIR, 'utils', 'barangays_geocoded.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Create a lookup dictionary for fast access
        # Format: {city_code: {barangay_code: {name, coordinates}}}
        lookup = {}
        for city in data:
            city_code = city['cityCode']
            lookup[city_code] = {}
            
            for barangay in city['barangays']:
                brgy_code = barangay['code']
                lookup[city_code][brgy_code] = {
                    'name': barangay['name'],
                    'coordinates': barangay.get('coordinates')
                }
        
        # Cache for 7 days (since this data rarely changes)
        cache.set(cache_key, lookup, timeout=60 * 60 * 24 * 7)
        print(f"Loaded {len(lookup)} cities with barangay coordinates")
        
        return lookup
    
    except FileNotFoundError:
        print(f"ERROR: barangays_geocoded.json not found at {json_path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in barangays_geocoded.json: {e}")
        return {}


def json_geocode(barangay_code, city_code, retries=3):
    """
    Get coordinates from local JSON file with random offset applied.
    Returns unique coordinates for each call.
    
    Args:
        barangay_code: PSGC code of the barangay (e.g., "045624002")
        city_code: PSGC code of the city (e.g., "045624000")
        retries: Not used, kept for compatibility
    
    Returns:
        tuple: (latitude, longitude) or (None, None) if not found
    """
    # Load barangay data
    barangay_data = load_barangay_coordinates()
    
    # Look up the barangay
    city_data = barangay_data.get(city_code, {})
    barangay_info = city_data.get(barangay_code)
    
    if not barangay_info or not barangay_info.get('coordinates'):
        print(f"WARNING: No coordinates found for barangay {barangay_code} in city {city_code}")
        return None, None
    
    coords = barangay_info['coordinates']
    base_lat = coords['lat']
    base_lng = coords['lng']
    
    # Apply random offset to avoid exact duplicates
    # ~200m radius (0.002 degrees ≈ 220m at equator)
    lat_offset = random.uniform(-0.001, 0.001)
    lng_offset = random.uniform(-0.001, 0.001)
    
    lat = base_lat + lat_offset
    lng = base_lng + lng_offset
    
    print(f"DEBUG JSON GEOCODE: {barangay_info['name']} → "
          f"Base=({base_lat:.6f}, {base_lng:.6f}) → "
          f"Offset=({lat:.6f}, {lng:.6f})")
    
    return lat, lng

def photon_geocode_base(address, retries=3):
    """
    Get base coordinates from Photon (with caching).
    Returns the raw coordinates WITHOUT offset.
    """
    sanitized_key = sanitize_cache_key(f"geo_base_{address}")
    cached = cache.get(sanitized_key)
    if cached:
        print(f"DEBUG: Using cached base coords for {address}")
        return cached

    url = "https://photon.komoot.io/api/"
    params = {
        "q": address,
        "limit": 1
    }
    headers = {
        "User-Agent": "DSWD-Application-System/1.0 (contact@yourdomain.com)"
    }

    for attempt in range(retries):
        try:
            response = requests.get(url, params=params, headers=headers, timeout=15)
            data = response.json()

            if data and "features" in data and len(data["features"]) > 0:
                coordinates = data["features"][0]["geometry"]["coordinates"]
                lat, lng = coordinates[1], coordinates[0]

                # Cache BASE coordinates for 30 days
                cache.set(sanitized_key, (lat, lng), timeout=60 * 60 * 24 * 30)
                print(f"DEBUG: Cached base coords: ({lat:.6f}, {lng:.6f})")

                return lat, lng

        except requests.exceptions.Timeout:
            print(f"Photon timeout: {address} (Attempt {attempt + 1}/{retries})")
        except Exception as e:
            print(f"Photon error: {e}")
            break

    return None, None


def photon_geocode(address, retries=3):
    """
    Get coordinates with random offset applied.
    Each call returns UNIQUE coordinates.
    """
    # Get base coordinates (cached)
    base_lat, base_lng = photon_geocode_base(address, retries)
    
    if base_lat is None or base_lng is None:
        return None, None
    
    # Apply random offset (NOT cached)
    lat_offset = random.uniform(-0.002, 0.002)
    lng_offset = random.uniform(-0.002, 0.002)
    
    lat = base_lat + lat_offset
    lng = base_lng + lng_offset
    
    print(f"DEBUG OFFSET: Base=({base_lat:.6f}, {base_lng:.6f}) → "
          f"Offset=({lat:.6f}, {lng:.6f}) [Δlat={lat_offset:.6f}, Δlng={lng_offset:.6f}]")
    
    return lat, lng



class AnalyticsSummaryCache(models.Model):
    """Pre-computed analytics for faster dashboard loading"""
    cache_key = models.CharField(max_length=255, unique=True)
    data = models.JSONField()
    computed_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        indexes = [
            models.Index(fields=['cache_key', 'expires_at']),
        ]

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
    IDENTITY_STATUS_CHOICES = [
        ('NEW', 'New'),
        ('VERIFIED', 'Verified'),
        ('SUSPICIOUS', 'Suspicious'),
        ('REVIEWED', 'Reviewed'),
        ('BLOCKED', 'Blocked'),
    ]

    identity_status = models.CharField(
        max_length=20,
        choices=IDENTITY_STATUS_CHOICES,
        default='NEW',
        db_index=True
    )

    identity_notes = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        # Add these indexes for faster queries
        indexes = [
            models.Index(fields=['latitude', 'longitude'], name='lat_lng_idx'),
            models.Index(fields=['type_of_assistance'], name='type_assist_idx'),
            models.Index(fields=['is_archived', 'date_filled'], name='archived_date_idx'),
            models.Index(fields=['-date_filled'], name='date_filled_desc_idx'),
        ]
        
        # If you want to be extra optimized, add this:
        ordering = ['-date_filled']


    def save(self, force_geocode=False, *args, **kwargs):
        print(f"DEBUG: Saving applicant {self} (force_geocode={force_geocode})")
        print(f"DEBUG: Current lat/lng: {self.latitude}, {self.longitude}")

        # Determine if we should geocode
        if force_geocode or not self.latitude or not self.longitude:
            try:
                # Try JSON geocoding first
                barangay = self.background_info.barangay
                city = barangay.city
                
                print(f"DEBUG: Attempting JSON geocode for {barangay.name}, {city.name}")
                print(f"DEBUG: Barangay code: {barangay.psgc_code}, City code: {city.psgc_code}")
                
                lat, lng = json_geocode(barangay.psgc_code, city.psgc_code)
                
                # Fallback to Photon if JSON geocoding fails
                if not lat or not lng:
                    print(f"DEBUG: JSON geocode failed, falling back to Photon")
                    location_query = (
                        f"{barangay.name}, "
                        f"{city.name}, "
                        f"{city.province.name}, Philippines"
                    )
                    lat, lng = photon_geocode(location_query)
                
                print(f"DEBUG: Geocoding result: lat={lat}, lng={lng}")

                if lat and lng:
                    self.latitude = lat
                    self.longitude = lng
                    print(f"DEBUG: Updated coordinates set")
                else:
                    print(f"DEBUG: Geocoding returned None")
            except Exception as e:
                print(f"DEBUG: Geocoding failed with exception: {e}")

        super().save(*args, **kwargs)
        print(f"DEBUG: Applicant saved with lat/lng: {self.latitude}, {self.longitude}")

        # Invalidate map cache
        cache.delete("applicant_locations_cache")

    def get_coordinates(self, address=None):
        """
        Get coordinates using JSON data or fallback to Photon.
        If address is provided, use Photon directly.
        """
        if address:
            # Legacy support: if address string provided, use Photon
            return photon_geocode(address)
        else:
            # Use JSON data based on barangay/city codes
            barangay = self.background_info.barangay
            city = barangay.city
            return json_geocode(barangay.psgc_code, city.psgc_code)


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
    HISTORY_TYPE_CHOICES = [
        ("APPLICATION", "Application"),
        ("PAYOUT", "Payout"),
    ]

    background_info = models.ForeignKey(
        BackgroundInfo,
        on_delete=models.CASCADE,
        related_name="histories"
    )
    applicant = models.ForeignKey(
        Applicant,
        on_delete=models.CASCADE,
        related_name="history_entry"
    )

    type_of_assistance = models.CharField(max_length=50)

    history_type = models.CharField(
        max_length=20,
        choices=HISTORY_TYPE_CHOICES,
        default="APPLICATION"
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    related_claim = models.OneToOneField(
        "DisbursementClaim",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="history_record"
    )

    date_applied = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_applied"]

    def __str__(self):
        return f"{self.history_type} - {self.type_of_assistance} ({self.date})"

    
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


class DisbursementBatch(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("CLOSED", "Closed"),
        ("FINALIZED", "Finalized"),
    ]

    # ✅ ADD THIS: Link to approval batch
    approval_batch = models.OneToOneField(
        "ApprovalBatch",
        on_delete=models.PROTECT,
        related_name="disbursement_batch",
        null=True,
        blank=True
    )

    name = models.CharField(max_length=255)
    assistance_type = models.CharField(max_length=100)
    payout_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="OPEN")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_batches"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    total_beneficiaries = models.IntegerField(default=0)
    total_claimed = models.IntegerField(default=0)
    total_unclaimed = models.IntegerField(default=0)
    finalized_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name


class DisbursementClaim(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CLAIMED", "Claimed"),
        ("UNCLAIMED", "Unclaimed"),
    ]

    batch = models.ForeignKey(
        DisbursementBatch,
        on_delete=models.PROTECT,
        related_name="claims"
    )
    approval = models.OneToOneField(
        "Approval",
        on_delete=models.PROTECT,
        related_name="disbursement_claim"
    )
    applicant = models.ForeignKey(
        "Applicant",
        on_delete=models.PROTECT,
        related_name="disbursement_claims"
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    payout_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def mark_claimed(self, payout_date):
        if self.status != "PENDING":
            raise ValueError("Only PENDING claims can be claimed.")

        self.status = "CLAIMED"
        self.payout_date = payout_date
        self.save()

        # Prevent duplicates
        if hasattr(self, "history_record"):
            return

        ApplicantHistory.objects.create(
            background_info=self.applicant.background_info,
            applicant=self.applicant,
            type_of_assistance=self.approval.applicant.type_of_assistance,
            history_type="PAYOUT",
            amount=self.amount,
            related_claim=self,
        )

    def mark_unclaimed(self):
        if self.status != "PENDING":
            raise ValueError("Only PENDING claims can be unclaimed.")
        self.status = "UNCLAIMED"
        self.save()


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


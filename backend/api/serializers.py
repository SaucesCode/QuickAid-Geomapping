from rest_framework import serializers
from .models import Applicant, Representative, BackgroundInfo, Barangay, Approval
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import *
from django.utils import timezone
from .utils import log_staff_activity

# ---------------------------------------------------------
# JWT TOKEN SERIALIZER
# ---------------------------------------------------------
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['is_superuser'] = user.is_superuser
        token['last_active'] = user.last_active.isoformat() if user.last_active else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        user.last_active = timezone.now()
        user.save(update_fields=['last_active'])

        log_staff_activity(
            user,
            "LOGIN STAFF",
            f"{user.username} logged in successfully",
            request=self.context.get('request')
        )

        data['staff_info'] = {
            'id': user.id,
            'ref_code': user.ref_code,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.role,
            'is_superuser': user.is_superuser,
            'last_active': user.last_active.isoformat() if user.last_active else None
        }
        return data


# ---------------------------------------------------------
# BARANGAY SERIALIZER
# ---------------------------------------------------------
class BarangayDetailSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    province_name = serializers.CharField(source='city.province.name', read_only=True)
    region_name = serializers.CharField(source='city.province.region.name', read_only=True)

    class Meta:
        model = Barangay
        fields = ['id', 'name', 'psgc_code', 'city_name', 'province_name', 'region_name']


# ---------------------------------------------------------
# BACKGROUND INFO SERIALIZER
# ---------------------------------------------------------
class BackgroundInfoSerializer(serializers.ModelSerializer):
    barangay = serializers.CharField()
    barangay_details = BarangayDetailSerializer(source='barangay', read_only=True)

    class Meta:
        model = BackgroundInfo
        fields = [
            "first_name", "middle_initial", "last_name", "suffix",
            "birthday", "street_address", "barangay", "barangay_details",
            "sex", "civil_status", "occupation", "monthly_income"
        ]
        # you previously disabled validators here which is correct for nested create/get_or_create behavior
        validators = []

    def validate_barangay(self, value):
        barangay_obj = (
            Barangay.objects.filter(psgc_code=value).first() or
            Barangay.objects.filter(name__iexact=value).first()
        )
        if not barangay_obj:
            raise serializers.ValidationError("Invalid Barangay code or name.")
        return barangay_obj

    def create(self, validated_data):
        barangay = validated_data.pop("barangay")
        return BackgroundInfo.objects.create(barangay=barangay, **validated_data)


# ---------------------------------------------------------
# REPRESENTATIVE BACKGROUND INFO — FIXED VERSION
# ---------------------------------------------------------
class RepresentativeBackgroundInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackgroundInfo
        fields = [
            "first_name", "middle_initial", "last_name", "suffix",
            "birthday", "street_address",
            "sex", "civil_status", "occupation", "monthly_income"
        ]
        # disable automatic unique_together validation here so nested validation does not error
        validators = []

    def create(self, validated_data):
        """
        Use a safe get_or_create (case-insensitive) for representative BackgroundInfo:
        - If a matching record (first_name, last_name, birthday) exists, reuse and update it.
        - Otherwise create a new BackgroundInfo with a default barangay (so FK is satisfied).
        """
        # normalize keys for lookup
        first = (validated_data.get("first_name") or "").strip()
        last = (validated_data.get("last_name") or "").strip()
        birthday = validated_data.get("birthday")

        # try case-insensitive lookup for existing background info
        bg_qs = BackgroundInfo.objects.filter(
            first_name__iexact=first,
            last_name__iexact=last,
            birthday=birthday
        )

        default_barangay = Barangay.objects.first()

        bg = bg_qs.first()
        if bg:
            # update existing record with incoming fields
            for k, v in validated_data.items():
                setattr(bg, k, v)
            # ensure barangay exists (we don't change it here unless provided)
            if not getattr(bg, "barangay", None) and default_barangay:
                bg.barangay = default_barangay
            bg.save()
            return bg

        # not found -> create new (set a default barangay so FK won't fail)
        return BackgroundInfo.objects.create(barangay=default_barangay, **validated_data)


# ---------------------------------------------------------
# REPRESENTATIVE SERIALIZER
# ---------------------------------------------------------
class RepresentativeSerializer(serializers.ModelSerializer):
    background_info = RepresentativeBackgroundInfoSerializer()

    class Meta:
        model = Representative
        fields = ["id", "background_info", "relationship", "contact_number"]

    def create(self, validated_data):
        bg_data = validated_data.pop("background_info")
        bg_instance = RepresentativeBackgroundInfoSerializer().create(bg_data)

        return Representative.objects.create(
            background_info=bg_instance,
            **validated_data
        )


# ---------------------------------------------------------
# APPROVAL SERIALIZER
# ---------------------------------------------------------
class ApprovalSerializer(serializers.ModelSerializer):
    approved_by = serializers.CharField(source="approved_by.username", read_only=True)
    batch_file = serializers.CharField(source="batch.file_name", read_only=True)

    class Meta:
        model = Approval
        fields = ["id", "approved_at", "approved_by", "batch_file", "notes"]


# ---------------------------------------------------------
# APPLICANT SERIALIZER
# ---------------------------------------------------------
class ApplicantSerializer(serializers.ModelSerializer):
    background_info = BackgroundInfoSerializer()
    representative = RepresentativeSerializer(required=False, allow_null=True)

    staff = serializers.CharField(source='staff.username', read_only=True)
    city = serializers.CharField(source='background_info.barangay.city.name', read_only=True)
    staff_ref_code = serializers.UUIDField(source='staff.ref_code', read_only=True)
    approval_count = serializers.IntegerField(source="approvals.count", read_only=True)
    approvals = ApprovalSerializer(many=True, read_only=True)

    class Meta:
        model = Applicant
        fields = "__all__"
        read_only_fields = ["id", "staff", "staff_ref_code",
                            "longitude", "latitude", "date_filled"]
        
    def create(self, validated_data):
        request = self.context.get("request")
        staff_user = request.user if request and request.user.is_authenticated else None

        bg_data = validated_data.pop("background_info")
        rep_data = validated_data.pop("representative", None)
        created_at = validated_data.pop("created_at", None)

        # Normalize identifiers
        unique_identifiers = {
            "first_name": bg_data.get("first_name").strip().lower(),
            "last_name": bg_data.get("last_name").strip().lower(),
            "birthday": bg_data.get("birthday"),
        }

        # =====================================================
        # DEBUG: Print what we're searching for
        # =====================================================
        print("\n" + "="*60)
        print("🔍 3-MONTH RULE CHECK - DEBUG")
        print("="*60)
        print(f"Searching for applicant with:")
        print(f"  First Name: {unique_identifiers['first_name']}")
        print(f"  Last Name: {unique_identifiers['last_name']}")
        print(f"  Birthday: {unique_identifiers['birthday']}")
        print(f"  Contact: {validated_data.get('contact_number')}")
        
        three_months_ago = timezone.now() - timedelta(days=90)
        print(f"  Date cutoff (3 months ago): {three_months_ago}")
        print("-"*60)

        contact_number = validated_data.get("contact_number")

        # =====================================================
        # DEBUG: Check ALL matching BackgroundInfo first
        # =====================================================
        matching_bg = BackgroundInfo.objects.filter(
            first_name__iexact=unique_identifiers["first_name"],
            last_name__iexact=unique_identifiers["last_name"],
            birthday=unique_identifiers["birthday"],
        )
        
        print(f"📋 Found {matching_bg.count()} BackgroundInfo records matching name+birthday:")
        for bg in matching_bg:
            print(f"  - ID: {bg.id}, Name: {bg.first_name} {bg.last_name}, Birthday: {bg.birthday}")
        print("-"*60)

        # =====================================================
        # DEBUG: Check ALL applicants linked to those BackgroundInfo
        # =====================================================
        all_applicants_for_person = Applicant.objects.filter(
            background_info__first_name__iexact=unique_identifiers["first_name"],
            background_info__last_name__iexact=unique_identifiers["last_name"],
            background_info__birthday=unique_identifiers["birthday"],
        ).select_related('background_info')
        
        print(f"📄 Found {all_applicants_for_person.count()} total Applicant records for this person:")
        for app in all_applicants_for_person:
            print(f"  - ID: {app.id}, Date: {app.date_filled}, Archived: {app.is_archived}, Type: {app.type_of_assistance}")
        print("-"*60)

        # =====================================================
        # DEBUG: Now filter for recent non-archived ones
        # =====================================================
        recent_same_person = (
            Applicant.objects.filter(
                background_info__first_name__iexact=unique_identifiers["first_name"],
                background_info__last_name__iexact=unique_identifiers["last_name"],
                background_info__birthday=unique_identifiers["birthday"],
                is_archived=False,
                date_filled__gte=three_months_ago,
            )
            .order_by("-date_filled")
            .first()
        )

        print(f"🚫 Recent (< 3 months) non-archived application by same person:")
        if recent_same_person:
            print(f"  ✅ FOUND! ID: {recent_same_person.id}")
            print(f"     Date: {recent_same_person.date_filled}")
            print(f"     Type: {recent_same_person.type_of_assistance}")
            print(f"     Contact: {recent_same_person.contact_number}")
            print(f"     Archived: {recent_same_person.is_archived}")
        else:
            print(f"  ❌ None found")
        print("-"*60)

        # =====================================================
        # DEBUG: Check by contact number
        # =====================================================
        all_by_contact = Applicant.objects.filter(
            contact_number=contact_number,
        ).select_related('background_info')
        
        print(f"📞 Found {all_by_contact.count()} total Applicant records with contact {contact_number}:")
        for app in all_by_contact:
            print(f"  - ID: {app.id}, Date: {app.date_filled}, Archived: {app.is_archived}, Name: {app.background_info.first_name} {app.background_info.last_name}")
        print("-"*60)

        recent_same_contact = (
            Applicant.objects.filter(
                contact_number=contact_number,
                is_archived=False,
                date_filled__gte=three_months_ago,
            )
            .order_by("-date_filled")
            .first()
        )

        print(f"🚫 Recent (< 3 months) non-archived application by same contact:")
        if recent_same_contact:
            print(f"  ✅ FOUND! ID: {recent_same_contact.id}")
            print(f"     Date: {recent_same_contact.date_filled}")
            print(f"     Name: {recent_same_contact.background_info.first_name} {recent_same_contact.background_info.last_name}")
        else:
            print(f"  ❌ None found")
        print("-"*60)

        # =====================================================
        # Enforce 3-month rule
        # =====================================================
        if recent_same_person or recent_same_contact:
            recent_app = recent_same_person or recent_same_contact
            next_eligible = recent_app.date_filled + timedelta(days=90)
            reason = "same person" if recent_same_person else "same contact number"

            print(f"❌ BLOCKING APPLICATION - {reason}")
            print(f"   Last application: {recent_app.date_filled.strftime('%B %d, %Y')}")
            print(f"   Next eligible: {next_eligible.strftime('%B %d, %Y')}")
            print("="*60 + "\n")

            raise serializers.ValidationError(
                f"This {reason} already submitted an application on "
                f"{recent_app.date_filled.strftime('%B %d, %Y')}. "
                f"Next eligible date: {next_eligible.strftime('%B %d, %Y')}."
            )
        
        print(f"✅ 3-MONTH CHECK PASSED - Proceeding with application")
        print("="*60 + "\n")

        # =====================================================
        # Now safe to create/update BackgroundInfo
        # =====================================================
        background_info = BackgroundInfo.objects.filter(
            first_name__iexact=unique_identifiers["first_name"],
            last_name__iexact=unique_identifiers["last_name"],
            birthday=unique_identifiers["birthday"],
        ).first()

        if background_info:
            for key, value in bg_data.items():
                setattr(background_info, key, value)
            background_info.save()
        else:
            background_info = BackgroundInfo.objects.create(**bg_data)

        # Create/update applicant
        applicant, created_ap = Applicant.objects.get_or_create(
            background_info=background_info,
            defaults={**validated_data, "staff": staff_user, "created_at": created_at},
        )

        if not created_ap:
            for key, value in validated_data.items():
                setattr(applicant, key, value)
            applicant.staff = staff_user
            applicant.created_at = created_at
            applicant.save()

        # Handle representative
        if rep_data and validated_data.get("applicant_type") == "Representative":
            rep_bg_data = rep_data.pop("background_info")
            rep_bg = RepresentativeBackgroundInfoSerializer().create(rep_bg_data)
            Representative.objects.update_or_create(
                applicant=applicant,
                defaults={
                    "background_info": rep_bg,
                    "relationship": rep_data["relationship"],
                    "contact_number": rep_data.get("contact_number"),
                },
            )

        return applicant




    # ------------------------ UPDATE FIXED ------------------------
    def update(self, instance, validated_data):

        # Update background info
        bg_data = validated_data.pop("background_info", None)
        if bg_data:
            bg_instance = instance.background_info
            for attr, value in bg_data.items():
                setattr(bg_instance, attr, value)
            bg_instance.save()

        # Update/create representative
        rep_data = validated_data.pop("representative", None)
        if rep_data:
            # rep_data may include background_info (dict)
            rep_bg_data = rep_data.pop("background_info", None)
            if rep_bg_data:
                # create or reuse BackgroundInfo safely via serializer helper
                rep_bg_instance = RepresentativeBackgroundInfoSerializer().create(rep_bg_data)
            else:
                rep_bg_instance = None

            # update or create Representative row
            rep_defaults = {
                "background_info": rep_bg_instance if rep_bg_instance else getattr(instance.representative, "background_info", None),
                "relationship": rep_data.get("relationship"),
                "contact_number": rep_data.get("contact_number")
            }
            Representative.objects.update_or_create(
                applicant=instance,
                defaults=rep_defaults
            )

        # Update applicant normal fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        try:
            data['representative'] = RepresentativeSerializer(instance.representative).data
        except Representative.DoesNotExist:
            data['representative'] = None
        return data

from rest_framework import serializers
from .models import Applicant, Representative, BackgroundInfo, Barangay, Approval
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import *
from django.utils import timezone

# Para sa login, customize the JWT token at response
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add extra info sa token
        token['username'] = user.username
        token['role'] = user.role
        token['is_superuser'] = user.is_superuser
        token['last_active'] = user.last_active.isoformat() if user.last_active else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        # Update last_active timestamp
        user.last_active = timezone.now()
        user.save(update_fields=['last_active'])

        # Put the staff info sa response (para sa frontend)
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
    

class BarangayDetailSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    province_name = serializers.CharField(source='city.province.name', read_only=True)
    region_name = serializers.CharField(source='city.province.region.name', read_only=True)
    
    class Meta:
        model = Barangay
        fields = ['id', 'name', 'psgc_code', 'city_name', 'province_name', 'region_name']

# Serializer para sa background info ng applicant or representative
class BackgroundInfoSerializer(serializers.ModelSerializer):
    barangay = serializers.CharField()
    barangay_details = BarangayDetailSerializer(source='barangay', read_only=True)

    class Meta:
        model = BackgroundInfo
        fields = [
            "first_name", "middle_initial", "last_name", "suffix",
            "birthday", "street_address", "barangay","barangay_details",
            "sex", "civil_status", "occupation", "monthly_income"
        ]
        validators = []

    def validate_barangay(self, value):
        print(f"Validating barangay: {value}")
        try:
            barangay_obj = (
                Barangay.objects.filter(psgc_code=value).first() or
                Barangay.objects.filter(name__iexact=value).first()
            )
            if not barangay_obj:
                raise Barangay.DoesNotExist
            print(f"Barangay found: {barangay_obj.name}")
            return barangay_obj
        except Barangay.DoesNotExist:
            print("Barangay not found!")
            raise serializers.ValidationError("Invalid Barangay code or name.")

    def create(self, validated_data):
        barangay = validated_data.pop("barangay")
        return BackgroundInfo.objects.create(barangay=barangay, **validated_data)

# New serializer for representative background info without barangay
class RepresentativeBackgroundInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackgroundInfo
        fields = [
            "first_name", "middle_initial", "last_name", "suffix",
            "birthday", "street_address",
            "sex", "civil_status", "occupation", "monthly_income"
        ]

    def create(self, validated_data):
        # Get a default barangay (you might want to set this to a specific one)
        default_barangay = Barangay.objects.first()
        return BackgroundInfo.objects.create(barangay=default_barangay, **validated_data)

class RepresentativeSerializer(serializers.ModelSerializer):
    background_info = RepresentativeBackgroundInfoSerializer()

    class Meta:
        model = Representative
        fields = ["id", "background_info", "relationship"]

    def create(self, validated_data):
        bg_data = validated_data.pop("background_info")
        background_info = RepresentativeBackgroundInfoSerializer().create(bg_data)
            
        return Representative.objects.create(
            background_info=background_info, 
            **validated_data
        )

class ApprovalSerializer(serializers.ModelSerializer):
    approved_by = serializers.CharField(source="approved_by.username", read_only=True)
    batch_file = serializers.CharField(source="batch.file_name", read_only=True)

    class Meta:
        model = Approval
        fields = ["id", "approved_at", "approved_by", "batch_file", "notes"]


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
        fields = [
            "id", "staff", "staff_ref_code",
            "background_info", "contact_number",
            "valid_id_presented", "other_valid_id",
            "applicant_type", "type_of_assistance",
            "representative", "longitude", "latitude",
            "city", "date_filled", "created_at", "is_archived", "approvals", "approval_count"
        ]
        read_only_fields = ["id", "staff", "staff_ref_code", "longitude", "latitude", "date_filled"]

    def create(self, validated_data):
        request = self.context.get("request")
        staff_user = request.user if request and request.user.is_authenticated else None

        bg_data = validated_data.pop("background_info")
        rep_data = validated_data.pop("representative", None)
        created_at = validated_data.pop("created_at", None)

        # Identify the person by first_name + last_name + birthday
        unique_identifiers = {
            "first_name": bg_data.get("first_name").strip().lower(),
            "last_name": bg_data.get("last_name").strip().lower(),
            "birthday": bg_data.get("birthday"),
            "barangay": bg_data.get("barangay"),
        }

        background_info, created = BackgroundInfo.objects.get_or_create(
            **unique_identifiers,
            defaults=bg_data,
        )

        if not created:
            for key, value in bg_data.items():
                setattr(background_info, key, value)
            background_info.save()

        # --- 3-Month Rule ---
        three_months_ago = timezone.now() - timedelta(days=90)
        recent_same_person = (
            Applicant.objects.filter(
                background_info=background_info,
                is_archived=False,
                date_filled__gte=three_months_ago,
            ).order_by('-date_filled').first()
        )

        contact_number = validated_data.get("contact_number")
        recent_same_contact = (
            Applicant.objects.filter(
                contact_number=contact_number,
                is_archived=False,
                date_filled__gte=three_months_ago,
            ).order_by('-date_filled').first()
        )
        if recent_same_person or recent_same_contact:
            recent_app = recent_same_person or recent_same_contact
            next_eligible = recent_app.date_filled + timedelta(days=90)
            reason = (
                "same person"
                if recent_same_person
                else "same contact number"
            )
            raise serializers.ValidationError(
                f"This {reason} already submitted an application on "
                f"{recent_app.date_filled.strftime('%B %d, %Y')}. "
                f"Next eligible date: {next_eligible.strftime('%B %d, %Y')}."
            )

        # ✅ Get or create the applicant (per person)
        applicant, created = Applicant.objects.get_or_create(
            background_info=background_info,
            defaults={**validated_data, "staff": staff_user, "created_at": created_at},
        )

        if not created:
            # Update applicant fields if they already exist
            for key, value in validated_data.items():
                setattr(applicant, key, value)
            applicant.staff = staff_user
            applicant.created_at = created_at
            applicant.save()

        # ✅ Handle representative
        if rep_data and validated_data.get("applicant_type") == "Representative":
            rep_bg_data = rep_data.pop("background_info")
            rep_bg = RepresentativeBackgroundInfoSerializer().create(rep_bg_data)
            Representative.objects.update_or_create(
                applicant=applicant,
                defaults={
                    "background_info": rep_bg,
                    "relationship": rep_data["relationship"],
                },
            )

        return applicant

    
    
    def update(self, instance, validated_data):
        # Update background_info if present
        bg_data = validated_data.pop("background_info", None)
        if bg_data:
            bg_instance = instance.background_info
            for attr, value in bg_data.items():
                setattr(bg_instance, attr, value)
            bg_instance.save()

        # Update representative if provided
        rep_data = validated_data.pop("representative", None)
        if rep_data:
            if hasattr(instance, "representative"):
                # Update existing representative
                rep_instance = instance.representative
                rep_bg_data = rep_data.pop("background_info", None)
                
                # Update representative's background info
                if rep_bg_data:
                    rep_bg_instance = rep_instance.background_info
                    for attr, value in rep_bg_data.items():
                        setattr(rep_bg_instance, attr, value)
                    rep_bg_instance.save()
                
                # Update representative's other fields
                for attr, value in rep_data.items():
                    setattr(rep_instance, attr, value)
                rep_instance.save()
            else:
                # Create new representative if it doesn't exist
                rep_serializer = RepresentativeSerializer(context={"applicant": instance})
                rep_serializer.create({**rep_data, "applicant": instance})

        # Update regular fields of the Applicant
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

    def to_representation(self, instance):
        """
        Custom representation of the applicant, including representative data if it exists
        """
        representation = super().to_representation(instance)
        
        # Add representative data if it exists
        try:
            representative = instance.representative
            representation['representative'] = RepresentativeSerializer(representative).data
        except Representative.DoesNotExist:
            representation['representative'] = None
            
        return representation
    


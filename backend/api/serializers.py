from rest_framework import serializers
from .models import Applicant, Representative, BackgroundInfo, Barangay
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

        # Put the staff info sa response (para sa frontend)
        data['staff_info'] = {
            'id': self.user.id,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'email': self.user.email,
            'role': self.user.role,
            'is_superuser': self.user.is_superuser,
            'last_active': self.user.last_active.isoformat() if self.user.last_active else None
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
        print(f"Validating barangay PSGC code: {value}")
        try:
            barangay_obj = Barangay.objects.get(psgc_code=value)
            print(f"Barangay found: {barangay_obj.name}")
            return barangay_obj
        except Barangay.DoesNotExist:
            print("Barangay PSGC code not found!")
            raise serializers.ValidationError("Invalid Barangay PSGC code.")

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


class ApplicantSerializer(serializers.ModelSerializer):
    background_info = BackgroundInfoSerializer()
    representative = RepresentativeSerializer(required=False, allow_null=True)
    staff = serializers.CharField(source='staff.username', read_only=True)
    city = serializers.CharField(source='background_info.barangay.city.name', read_only=True)

    class Meta:
        model = Applicant
        fields = [
            "id", "staff",
            "background_info", "contact_number",
            "valid_id_presented", "other_valid_id",
            "applicant_type", "type_of_assistance",
            "representative", "longitude", "latitude",
            "city", "date_filled", "created_at", "is_archived"
        ]
        read_only_fields = ["id", "staff", "longitude", "latitude", "date_filled", "created_at"]

    def create(self, validated_data):
        bg_data = validated_data.pop("background_info")
        rep_data = validated_data.pop("representative", None)

        # The 'barangay' in bg_data is already a validated Barangay object.
        # We need to separate the unique identifiers from the rest of the data for get_or_create.
        unique_identifiers = {
            'first_name': bg_data.get('first_name'),
            'last_name': bg_data.get('last_name'),
            'birthday': bg_data.get('birthday'),
        }
        
        background_info, created = BackgroundInfo.objects.get_or_create(
            **unique_identifiers,
            defaults=bg_data
        )

        # If the person already existed, update their info with any new details.
        if not created:
            for key, value in bg_data.items():
                setattr(background_info, key, value)
            background_info.save()

        # --- 3-Month Rule ---
        three_months_ago = timezone.now() - timedelta(days=90)
        if Applicant.objects.filter(background_info=background_info, date_filled__gte=three_months_ago).exists():
            last_app = Applicant.objects.filter(background_info=background_info).latest('date_filled')
            next_eligible = last_app.date_filled + timedelta(days=90)
            raise serializers.ValidationError(
                f"This person last applied on {last_app.date_filled.strftime('%B %d, %Y')}. "
                f"They can only apply once every 3 months. "
                f"Their next eligible application date is {next_eligible.strftime('%B %d, %Y')}."
            )
        
        # If all checks pass, create the new application.
        applicant = Applicant.objects.create(
            background_info=background_info, 
            **validated_data
        )

        # Handle representative (same logic as before)
        if rep_data and validated_data.get("applicant_type") == "Representative":
            rep_bg_data = rep_data.pop("background_info")
            rep_bg = RepresentativeBackgroundInfoSerializer().create(rep_bg_data)
            Representative.objects.create(
                applicant=applicant,
                background_info=rep_bg,
                relationship=rep_data["relationship"]
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
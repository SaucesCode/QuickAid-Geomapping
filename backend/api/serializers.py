from rest_framework import serializers
from .models import Applicant, Representative, BackgroundInfo, Barangay
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


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


class RepresentativeSerializer(serializers.ModelSerializer):
    background_info = BackgroundInfoSerializer()

    class Meta:
        model = Representative
        fields = ["id", "applicant", "background_info", "relationship"]

    def create(self, validated_data):
        bg_data = validated_data.pop("background_info")
        background_info = BackgroundInfoSerializer().create(bg_data)
            
        return Representative.objects.create(
            background_info=background_info, 
            **validated_data
        )


class ApplicantSerializer(serializers.ModelSerializer):
    background_info = BackgroundInfoSerializer()
    representative = RepresentativeSerializer(required=False, write_only=True)
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
        read_only_fields = ["id", "staff","longitude", "latitude", "date_filled", "created_at"]

    def create(self, validated_data):
            
        # Handle background info
        bg_data = validated_data.pop("background_info")
        background_info = BackgroundInfoSerializer().create(bg_data)
        
        # Handle representative if provided
        rep_data = validated_data.pop("representative", None)
        
        # Create applicant
        applicant = Applicant.objects.create(
            background_info=background_info, 
            **validated_data
        )

        # Create representative if needed
        if rep_data and validated_data.get("applicant_type") == "Representative":
            rep_serializer = RepresentativeSerializer(context={"applicant": applicant})
            rep_serializer.create({**rep_data, "applicant": applicant})

        return applicant
    
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
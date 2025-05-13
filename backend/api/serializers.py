from rest_framework import serializers
from .models import Applicant, Representative
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Custom claims for the token
        token['username'] = user.username
        token['role'] = user.role
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff
        token['last_active'] = user.last_active.isoformat() if user.last_active else None,
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user info to response data (accessible in frontend)
        data['staff_info'] = {
            'id': self.user.id,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'email': self.user.email,
            'role': self.user.role,
            'is_superuser': self.user.is_superuser,
            'is_staff': self.user.is_staff,
            'last_active': self.user.last_active.isoformat() if self.user.last_active else None,
        }
        return data


class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = [
            "id", "first_name", "middle_initial", "last_name", "suffix", "contact_number",
            "purok", "barangay", "city_municipality", "province", "birthday",
            "gender", "civil_status", "occupation", "monthly_income",
            "valid_id_presented", "type_of_assistance", "applicant_type", "date_filled",
            "started_at", "processed_at",
        ]

class RepresentativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Representative
        fields = [
            'first_name', 'last_name', 'middle_initial', 'suffix',
            'address', 'birthday', 'gender', 'civil_status',
            'occupation', 'monthly_income', 'relationship'
        ]

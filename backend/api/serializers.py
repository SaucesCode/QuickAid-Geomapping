from rest_framework import serializers
from .models import Applicant
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
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user info to response data (accessible in frontend)
        data['staff_info'] = {
            'username': self.user.username,
            'role': self.user.role,
            'is_superuser': self.user.is_superuser,
            'is_staff': self.user.is_staff
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

            # Representative fields (optional if self)
            "rep_first_name", "rep_last_name", "rep_middle_initial",
            "rep_suffix", "rep_address",
            "rep_gender", "rep_civil_status", "rep_occupation",
            "rep_monthly_income", "rep_relationship"
        ]

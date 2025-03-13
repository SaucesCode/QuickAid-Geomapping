from rest_framework import serializers
from .models import Applicant

class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = [
            "first_name", "middle_initial", "last_name", "suffix", "contact_number",
            "purok", "barangay", "city_municipality", "province", "birthday",
            "gender", "civil_status", "occupation", "monthly_income",
            "valid_id_presented", "beneficiary_name", "type_of_assistance", "justification"
        ]

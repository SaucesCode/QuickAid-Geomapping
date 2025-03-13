from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import Applicant, CustomUser
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth.decorators import login_required
from .serializers import ApplicantSerializer


# Register Staff (Only Admins Can Do This)
@api_view(['POST'])
@permission_classes([IsAdminUser])  # Only superusers can add staff
def register_staff(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    # Create staff user and set the role
    user = CustomUser.objects.create_user(username=username, password=password, is_staff=True, role='staff')
    
    return Response({"message": "Staff registered successfully"}, status=status.HTTP_201_CREATED)


# Protected route (for testing authentication)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": f"Hello, {request.user.username}! You are authenticated as {'Admin' if request.user.is_superuser else 'Staff'}."})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_applicant(request):
    data = request.data

    # Ensure required fields are present
    required_fields = [
        "first_name", "middle_initial", "last_name", "contact_number",
        "purok", "barangay", "city_municipality", "province", "birthday",
        "gender", "civil_status", "occupation", "monthly_income",
        "valid_id_presented", "beneficiary_name", "type_of_assistance", "justification"
    ]
    
    for field in required_fields:
        if field not in data or data[field] == "":
            return Response({"error": f"Missing required field: {field}"}, status=400)

    # Save applicant
    serializer = ApplicantSerializer(data=data)
    if serializer.is_valid():
        serializer.save(staff=request.user)  # Associate with logged-in staff
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)



# PSGC API Base URL
PSGC_BASE_URL = "https://psgc.gitlab.io/api"

class PSGCView(View):
    def get_provinces(self, request):
        response = requests.get(f"{PSGC_BASE_URL}/provinces/")
        if response.status_code == 200:
            return JsonResponse(response.json(), safe=False)
        return JsonResponse({"error": "Failed to fetch provinces"}, status=500)

    def get_cities(self, request, province_code):
        response = requests.get(f"{PSGC_BASE_URL}/provinces/{province_code}/cities/")
        if response.status_code == 200:
            return JsonResponse(response.json(), safe=False)
        return JsonResponse({"error": "Failed to fetch cities"}, status=500)

    def get_barangays(self, request, city_code):
        response = requests.get(f"{PSGC_BASE_URL}/cities/{city_code}/barangays/")
        if response.status_code == 200:
            return JsonResponse(response.json(), safe=False)
        return JsonResponse({"error": "Failed to fetch barangays"}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class SubmitApplicantView(View):
    @method_decorator(login_required)
    def post(self, request):
        """Handles applicant form submission"""
        data = request.POST

        try:
            applicant = Applicant.objects.create(
                staff=request.user,
                first_name=data.get("first_name"),
                middle_initial=data.get("middle_initial"),
                last_name=data.get("last_name"),
                suffix=data.get("suffix"),
                contact_number=data.get("contact_number"),
                purok=data.get("purok"),  # ✅ Text input
                barangay=data.get("barangay"),
                city_municipality=data.get("city_municipality"),
                province=data.get("province"),
                birthday=data.get("birthday"),
                gender=data.get("gender"),
                civil_status=data.get("civil_status"),
                occupation=data.get("occupation"),
                monthly_income=data.get("monthly_income"),
                valid_id_presented=data.get("valid_id_presented"),
                beneficiary_name=data.get("beneficiary_name"),
                type_of_assistance=data.get("type_of_assistance"),
                justification=data.get("justification"),
            )
            return JsonResponse({"message": "Applicant submitted successfully", "applicant_id": applicant.id}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


def get_applicant_locations(request):
    applicants = Applicant.objects.exclude(latitude__isnull=True, longitude__isnull=True)
    data = [
        {
            "full_name": f"{app.first_name} {app.last_name}",
            "latitude": app.latitude,
            "longitude": app.longitude,
            "address": f"{app.purok}, {app.barangay}, {app.city_municipality}, {app.province}",
            "type_of_assistance": app.type_of_assistance,
        }
        for app in applicants
    ]
    return JsonResponse(data, safe=False)
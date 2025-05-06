from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, ExpressionWrapper, F, DurationField, IntegerField
from django.db.models.functions import TruncDate, ExtractYear
from django.http import JsonResponse
from django.utils import timezone
import datetime
from django.utils.timezone import now, timedelta
from django.views import View
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
import requests
from .models import Applicant, CustomUser, Representative
from .serializers import ApplicantSerializer, MyTokenObtainPairSerializer, RepresentativeSerializer

User = get_user_model()

# REGISTER STAFF (Only Admins Can Do This)
@api_view(['POST'])
@permission_classes([IsAdminUser])  # Only superusers can access
def register_staff(request):
    username = request.data.get('username')
    password = request.data.get('password')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    email = request.data.get('email')

    if not all([username, password, first_name, last_name, email]):
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Check for duplicate username, full name, or email
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(first_name=first_name, last_name=last_name).exists():
        return Response({"error": "A user with the same full name already exists"}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

    # Create staff user
    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email,
        is_staff=True,
        role='staff'
    )

    return Response({"message": "Staff registered successfully"}, status=status.HTTP_201_CREATED)


# LIST ALL STAFF
@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_staff(request):
    staff_users = User.objects.filter(is_staff=True).values('id', 'username', 'first_name', 'last_name', 'email')
    return Response(list(staff_users))

# LIST APPLICANTS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_applicants(request):
    applicants = Applicant.objects.all().order_by('-date_filled')
    serializer = ApplicantSerializer(applicants, many=True)
    return Response(serializer.data)

# GET, PUT, DELETE a single applicant
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def applicant_detail(request, applicant_id):
    try:
        applicant = Applicant.objects.get(pk=applicant_id)
    except Applicant.DoesNotExist:
        return Response({'error': 'Applicant not found'}, status=500)

    if request.method == 'GET':
        serializer = ApplicantSerializer(applicant)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ApplicantSerializer(applicant, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        applicant.delete()
        return Response({'message': 'Applicant deleted successfully'})


# EDIT STAFF INFO
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_staff(request, pk):
    try:
        user = User.objects.get(pk=pk, is_staff=True)
    except User.DoesNotExist:
        return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data

    if 'username' in data and data['username'] != user.username:
        if User.objects.filter(username=data['username']).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
        user.username = data['username']

    if 'email' in data and data['email'] != user.email:
        if User.objects.filter(email=data['email']).exists():
            return Response({"error": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)
        user.email = data['email']

    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']

    user.save()
    return Response({"message": "Staff updated successfully"})

# DELETE STAFF
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_staff(request, pk):
    try:
        user = User.objects.get(pk=pk, is_staff=True)
        user.delete()
        return Response({"message": "Staff deleted successfully"})
    except User.DoesNotExist:
        return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)

class MyTokenObtainView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_staff(request, staff_id):
    try:
        user = CustomUser.objects.get(id=staff_id)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    data = request.data
    username = data.get("username")
    email = data.get("email")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    password = data.get("password")  # Optional

    # Duplicate check
    if CustomUser.objects.exclude(id=staff_id).filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)
    if CustomUser.objects.exclude(id=staff_id).filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    user.username = username
    user.email = email
    user.first_name = first_name
    user.last_name = last_name

    if password:
        user.set_password(password)

    user.save()
    return Response({"message": "Staff updated successfully"})


# Protected route (for testing authentication)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": f"Hello, {request.user.username}! You are authenticated as {'Admin' if request.user.is_superuser else 'Staff'}."})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_applicant(request):
    data = request.data

    required_fields = [
        "first_name", "middle_initial", "last_name", "contact_number",
        "purok", "barangay", "city_municipality", "province", "birthday",
        "gender", "civil_status", "occupation", "monthly_income",
        "valid_id_presented", "type_of_assistance", "applicant_type"
    ]

    if data.get("applicant_type") == "Representative":
        rep_fields = [
            "rep_first_name", "rep_last_name", "rep_middle_initial",
            "rep_address", "rep_birthday",
            "rep_gender", "rep_civil_status", "rep_occupation",
            "rep_monthly_income", "rep_relationship"
        ]
        required_fields.extend(rep_fields)

    for field in required_fields:
        if field not in data or data[field] == "":
            return Response({"error": f"Missing required field: {field}"}, status=400)

    if data.get("valid_id_presented") == "Others":
        other_id_value = data.get("other_valid_id", "").strip()
        if other_id_value:
            data["valid_id_presented"] = other_id_value
        else:
            return Response({"error": "Please specify the ID type when 'Others' is selected."}, status=400)

    serializer = ApplicantSerializer(data=data)
    if serializer.is_valid():
        applicant = serializer.save(staff=request.user)
        applicant.processed_at = timezone.now()

        if not applicant.started_at:
            applicant.started_at = applicant.processed_at - timedelta(minutes=5)

        applicant.save()

        if data.get("applicant_type") == "Representative":
            Representative.objects.create(
                applicant=applicant,
                first_name=data["rep_first_name"],
                last_name=data["rep_last_name"],
                middle_initial=data.get("rep_middle_initial", ""),
                suffix=data.get("rep_suffix", ""),
                address=data["rep_address"],
                birthday=data["rep_birthday"],
                gender=data["rep_gender"],
                civil_status=data["rep_civil_status"],
                occupation=data.get("rep_occupation", ""),
                monthly_income=data.get("rep_monthly_income", 0),
                relationship=data["rep_relationship"]
            )

        return Response(ApplicantSerializer(applicant).data, status=201)
    else:
        return Response(serializer.errors, status=400)


#THIS IS FOR LOCATION DROPDOWN / API FOR LOCATIONS
# PSGC API Base URL
PSGC_BASE_URL = "https://psgc.gitlab.io/api"

class PSGCView(View):
    def get_provinces(self, request):
        response = requests.get(f"{PSGC_BASE_URL}/provinces/")
        if response.status_code == 200:
            return JsonResponse(response.json(), safe=False)
        return JsonResponse({"error": "Failed to fetch provinces"}, status=500)

    def get_cities(self, request, province_code):
        response = requests.get(f"{PSGC_BASE_URL}/provinces/{province_code}/cities-municipalities/")
        if response.status_code == 200:
            return JsonResponse(response.json(), safe=False)
        return JsonResponse({"error": "Failed to fetch cities"}, status=500)

    def get_barangays(self, request, cityOrMunicipalityCode):
        response = requests.get(f"{PSGC_BASE_URL}/cities-municipalities/{cityOrMunicipalityCode}/barangays/")
        if response.status_code == 200:
            return JsonResponse(response.json(), safe=False)
        return JsonResponse({"error": "Failed to fetch barangays"}, status=500)
    
#THIS IS FOR THE GEOSPATIAL 
def get_applicant_locations(request):
    applicants = Applicant.objects.exclude(latitude__isnull=True, longitude__isnull=True)

    type_filter = request.GET.get("type")
    city_filter = request.GET.get("city")
    barangay_filter = request.GET.get("barangay")

    if type_filter:
        applicants = applicants.filter(type_of_assistance=type_filter)
    if city_filter:
        applicants = applicants.filter(city_municipality=city_filter)
    if barangay_filter:
        applicants = applicants.filter(barangay=barangay_filter)

    data = [
        {
            "id": app.id,
            "full_name": f"{app.first_name} {app.last_name}",
            "latitude": app.latitude,
            "longitude": app.longitude,
            "address": f"{app.purok}, {app.barangay}, {app.city_municipality}, {app.province}",
            "type_of_assistance": app.type_of_assistance,
            "barangay": app.barangay,
            "city_municipality": app.city_municipality,
        }
        for app in applicants
    ]
    return JsonResponse(data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_coordinates(request):
    applicant_id = request.data.get('id')
    barangay = request.data.get('barangay')
    city_municipality = request.data.get('city_municipality')
    province = request.data.get('province')

    try:
        applicant = Applicant.objects.get(pk=applicant_id)
        location_query = f"{barangay}, {city_municipality}, {province}"
        latitude, longitude = applicant.get_coordinates(location_query)

        if latitude and longitude:
            applicant.latitude = latitude
            applicant.longitude = longitude
            applicant.save()  # Save the updated coordinates
            return Response({'latitude': latitude, 'longitude': longitude})
        else:
            return Response({'error': 'Could not retrieve coordinates'}, status=400)

    except Applicant.DoesNotExist:
        return Response({'error': 'Applicant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# ANALYTICS VIEWS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def total_applicants(request):
    today = now().date()
    one_week_ago = today - timedelta(days=7)
    one_month_ago = today - timedelta(days=30)

    daily_count = Applicant.objects.filter(date_filled__date=today).count()
    weekly_count = Applicant.objects.filter(date_filled__gte=one_week_ago).count()
    monthly_count = Applicant.objects.filter(date_filled__gte=one_month_ago).count()

    return Response({
        "daily": daily_count,
        "weekly": weekly_count,
        "monthly": monthly_count
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicants_by_assistance_type(request):
    assistance_type = request.GET.get("type")
    start_date = request.GET.get("start")
    end_date = request.GET.get("end")

    qs = Applicant.objects.all()

    if assistance_type:
        qs = qs.filter(type_of_assistance=assistance_type)

    if start_date and end_date:
        qs = qs.filter(date_filled__date__range=[start_date, end_date])

    data = qs.values('type_of_assistance').annotate(count=Count('id'))
    return Response(list(data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicants_by_location(request):
    data = Applicant.objects.values('city_municipality','barangay', 'latitude', 'longitude').annotate(count=Count('id'))
    return Response(list(data))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trends_over_time(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    qs = Applicant.objects.all()
    if start_date and end_date:
        qs = qs.filter(date_filled__range=[start_date, end_date])
    data = qs.annotate(date=TruncDate('date_filled')).values('date').annotate(count=Count('id')).order_by('date')
    return Response(list(data))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_activity_logs(request):
    data = Applicant.objects.values('staff__username').annotate(count=Count('id')).order_by('-count')
    return Response(list(data))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_barangays(request):
    assistance_type = request.GET.get("type")
    start_date = request.GET.get("start")
    end_date = request.GET.get("end")

    qs = Applicant.objects.all()
    if assistance_type:
        qs = qs.filter(type_of_assistance=assistance_type)
    if start_date and end_date:
        qs = qs.filter(date_filled__date__range=[start_date, end_date])
    
    data = qs.values('barangay').annotate(count=Count('id')).order_by('-count')[:10]
    return Response(list(data))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def average_processing_time(request):
    data = Applicant.objects.exclude(started_at__isnull=True).exclude(processed_at__isnull=True).annotate(
        processing_time=ExpressionWrapper(F('processed_at') - F('started_at'), output_field=DurationField())
    ).aggregate(avg_time=Avg('processing_time'))


    return Response({
        "average_processing_time": data['avg_time'].total_seconds() if data['avg_time'] else 0
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assistance_type_trend(request):
    assistance_type = request.GET.get('type')
    start_date = request.GET.get("start")
    end_date = request.GET.get("end")

    qs = Applicant.objects.all()
    if assistance_type:
        qs = qs.filter(type_of_assistance=assistance_type)
    if start_date and end_date:
        qs = qs.filter(date_filled__date__range=[start_date, end_date])
        
    data = qs.annotate(date=TruncDate('date_filled')).values('date').annotate(count=Count('id')).order_by('date')
    return Response(list(data))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def barangay_by_type(request):
    data = Applicant.objects.values('barangay', 'type_of_assistance').annotate(count=Count('id')).order_by('-count')
    return Response(list(data))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_gender(request):
    data = Applicant.objects.values("gender").annotate(count=Count("id"))
    return Response(list(data))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_civil_status(request):
    data = Applicant.objects.values("civil_status").annotate(count=Count("id"))
    return Response(list(data))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_age_group(request):
    today = datetime.date.today()
    qs = Applicant.objects.annotate(
        age=ExpressionWrapper(
            today.year - ExtractYear("birthday"),
            output_field=IntegerField()
        )
    )

    age_groups = {
        "0-17": qs.filter(age__lte=17).count(),
        "18-25": qs.filter(age__gte=18, age__lte=25).count(),
        "26-35": qs.filter(age__gte=26, age__lte=35).count(),
        "36-45": qs.filter(age__gte=36, age__lte=45).count(),
        "46-60": qs.filter(age__gte=46, age__lte=60).count(),
        "60+": qs.filter(age__gt=60).count(),
    }

    formatted = [{"age_group": group, "count": count} for group, count in age_groups.items()]
    return Response(formatted)

#AYAKO NA UMAY 
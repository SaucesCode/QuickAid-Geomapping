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
from django.views.decorators.csrf import csrf_exempt
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
    staff_users = User.objects.filter(is_staff=True).values('id', 'username', 'first_name', 'last_name', 'email', 'last_active').order_by('last_active')
    return Response(list(staff_users))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_applicants(request):
    applicants = Applicant.objects.all().order_by('-date_filled')[:5]
    serializer = ApplicantSerializer(applicants, many=True)
    return Response(serializer.data)


# LIST APPLICANTS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_applicants(request):
    applicants = Applicant.objects.filter(is_archived=False).order_by('-date_filled')
    serializer = ApplicantSerializer(applicants, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_applicants(request):
    applicants = Applicant.objects.all().order_by('-date_filled')[:5]
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
        applicant.is_archived = True
        applicant.save()
        return Response({"message": "Applicant archived successfully"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_archived_applicants(request):
    applicants = Applicant.objects.filter(is_archived=True)
    serializer = ApplicantSerializer(applicants, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def restore_archived_applicant(request, pk):
    try:
        applicant = Applicant.objects.get(pk=pk)
        applicant.is_archived = False
        applicant.save()
        return Response({"message": "Applicant restored successfully"})
    except Applicant.DoesNotExist:
        return Response({"error": "Applicant not found"}, status=404)

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
@csrf_exempt
def submit_applicant(request):
    data = request.data  # Kunin yung buong request body (payload)

    # Ginagamit na ang serializer para mag-validate ng data, kaya hindi na manual na check fields dito
    serializer = ApplicantSerializer(data=data)


    if serializer.is_valid():
        # I-save ang applicant, ibibigay ang nag-submit na staff user sa model
        applicant = serializer.save(staff=request.user)

        # Auto-set ng processed_at timestamp
        applicant.date_filled = timezone.now()

        if not applicant.created_at:
            applicant.created_at = applicant.date_filled - timedelta(minutes=5)

        applicant.save()

        # Ibalik ang serialized data ng bagong gawa na applicant bilang success response
        return Response(ApplicantSerializer(applicant).data, status=201)

    # Kapag invalid ang data, ibalik error messages sa response
    return Response(serializer.errors, status=400)


    
#THIS IS FOR THE GEOSPATIAL 
def get_applicant_locations(request):
    # Use select_related to prefetch related objects
    # Adjust 'background_info__barangay__city' based on your actual ForeignKey field names
    applicants = Applicant.objects.select_related(
        'background_info__barangay__city'
    ).exclude(latitude__isnull=True, longitude__isnull=True)

    type_filter = request.GET.get("type")
    city_filter = request.GET.get("city")
    barangay_filter = request.GET.get("barangay")

    if type_filter:
        applicants = applicants.filter(type_of_assistance=type_filter)
    if city_filter:
        applicants = applicants.filter(background_info__barangay__city__name=city_filter)
    if barangay_filter:
        applicants = applicants.filter(background_info__barangay__name=barangay_filter)

    data = []
    for app in applicants:
        barangay_name = app.background_info.barangay.name if app.background_info and app.background_info.barangay else "N/A"
        city_name = app.background_info.barangay.city.name if app.background_info and app.background_info.barangay and app.background_info.barangay.city else "N/A"

        data.append({
            "id": app.id,
            "full_name": f"{app.background_info.first_name} {app.background_info.last_name}",
            "latitude": app.latitude,
            "longitude": app.longitude,
            "address": f"{app.background_info.street_address}, {barangay_name}, {city_name}",
            "type_of_assistance": app.type_of_assistance,
            "barangay": barangay_name,

        })

    print(data) 
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
    
    data = qs.values('background_info__barangay__name').annotate(count=Count('id')).order_by('-count')[:10]
    print(data)
    return Response(list(data))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def average_processing_time(request):
    data = Applicant.objects.exclude(created_at__isnull=True).exclude(date_filled__isnull=True).annotate(
        processing_time=ExpressionWrapper(F('date_filled') - F('created_at'), output_field=DurationField())
    ).aggregate(avg_time=Avg('processing_time'))
    print(data  )


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
    data = Applicant.objects.values('background_info__barangay', 'type_of_assistance').annotate(count=Count('id')).order_by('-count')
    return Response(list(data))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_gender(request):
    data = Applicant.objects.values("background_info__sex").annotate(count=Count("id"))
    return Response(list(data))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_civil_status(request):
    data = Applicant.objects.values("background_info__civil_status").annotate(count=Count("id"))
    return Response(list(data))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_age_group(request):
    today = datetime.date.today()
    qs = Applicant.objects.annotate(
        age=ExpressionWrapper(
            today.year - ExtractYear("background_info__birthday"),
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
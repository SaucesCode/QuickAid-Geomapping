# Standard library
import csv
import datetime
import requests
import pandas as pd

# Django
from django.contrib.auth import get_user_model
from django.db.models import (
    Avg, Count, ExpressionWrapper, F, DurationField,
    IntegerField, Max, Q
)
from django.db.models.functions import TruncDate, ExtractYear
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.utils.timezone import now, timedelta
from django.views import View
from django.views.decorators.csrf import csrf_exempt

# Django REST Framework
from rest_framework import status
from rest_framework.decorators import (
    api_view, permission_classes, parser_classes
)
from rest_framework.permissions import (
    IsAdminUser, IsAuthenticated, AllowAny
)
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

# Local
from .models import (
    Applicant, CustomUser, StaffActivityLog,
    BackgroundInfo, ApplicantHistory, Approval, ApprovalBatch
)
from .serializers import ApplicantSerializer, MyTokenObtainPairSerializer


User = get_user_model()

# =============================================
# AUTHENTICATION & USER MANAGEMENT
# =============================================

# TOKEN OBTAIN
# Function to handle JWT token authentication
class MyTokenObtainView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# PROTECTED VIEW
# Function to test authentication status
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": f"Hello, {request.user.username}! You are authenticated as {'Admin' if request.user.is_superuser else 'Staff'}."})

# GET CURRENT USER
# Function to get current user information
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    try:
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_superuser': user.is_superuser
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# UPDATE PROFILE
# Function to update user profile information
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        user = request.user
        data = request.data

        changes = []
        if 'username' in data and data['username'] != user.username:
            if User.objects.filter(username=data['username']).exists():
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            user.username = data['username']
            changes.append('username')

        if 'email' in data and data['email'] != user.email:
            if User.objects.filter(email=data['email']).exists():
                return Response({"error": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)
            user.email = data['email']
            changes.append('email')

        if 'first_name' in data and data['first_name'] != user.first_name:
            user.first_name = data['first_name']
            changes.append('first name')

        if 'last_name' in data and data['last_name'] != user.last_name:
            user.last_name = data['last_name']
            changes.append('last name')

        user.save()
        
        # Log the profile update
        if changes:
            log_staff_activity(
                user, 
                'PROFILE', 
                f"Updated: {', '.join(changes)}", 
                request
            )

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_superuser': user.is_superuser
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# CHANGE PASSWORD
# Function to change user password
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    try:
        user = request.user
        data = request.data

        if not all(k in data for k in ['current_password', 'new_password']):
            return Response(
                {"error": "Both current_password and new_password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(data['current_password']):
            return Response(
                {"error": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(data['new_password'])
        user.save()

        # Log the password change
        log_staff_activity(
            user,
            'PASSWORD',
            'Password changed',
            request
        )

        return Response({"message": "Password changed successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# =============================================
# STAFF MANAGEMENT
# =============================================

# REGISTER STAFF
# Function to register new staff members (admin only)
@api_view(['POST'])
@permission_classes([IsAdminUser])
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
# Function to retrieve list of all staff members
@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_staff(request):
    staff_users = User.objects.filter(is_staff=True).values('id', 'username', 'first_name', 'last_name', 'email', 'last_active').order_by('last_active')
    return Response(list(staff_users))

# UPDATE STAFF INFO
# Function to update staff member information
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

# DELETE STAFF
# Function to delete a staff member
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_staff(request, staff_id):
    try:
        user = User.objects.get(pk=staff_id, is_staff=True)
        user.delete()
        return Response({"message": "Staff deleted successfully"})
    except User.DoesNotExist:
        return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)

# GET STAFF ACTIVITY LOGS
# Function to retrieve detailed staff activity logs
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_staff_activity_logs(request):
    try:
        print(f"Fetching logs for user: {request.user.username} (superuser: {request.user.is_superuser})")
        
        # Check if there are any logs
        total_logs = StaffActivityLog.objects.count()
        print(f"Total logs in database: {total_logs}")
        
        if total_logs == 0:
            # Create a test log if none exist
            print("No logs found, creating test log...")
            try:
                StaffActivityLog.objects.create(
                    staff=request.user,
                    action='LOGIN',
                    details='Initial login',
                    ip_address=request.META.get('REMOTE_ADDR')
                )
                print("Test log created successfully")
            except Exception as create_error:
                print(f"Error creating test log: {str(create_error)}")
                return Response(
                    {"error": "Failed to create initial log", "details": str(create_error)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        try:
            # Only superusers can view all logs
            if request.user.is_superuser:
                logs = StaffActivityLog.objects.all().order_by('-timestamp')
                print(f"Found {logs.count()} total logs")
            else:
                # Regular staff can only view their own logs
                logs = StaffActivityLog.objects.filter(staff=request.user).order_by('-timestamp')
                print(f"Found {logs.count()} logs for user {request.user.username}")
            
            # Format the logs for response
            formatted_logs = []
            for log in logs:
                try:
                    formatted_log = {
                        'id': log.id,
                        'staff_member': f"{log.staff.first_name} {log.staff.last_name}",
                        'action': log.action,
                        'details': log.details or '',
                        'timestamp': log.timestamp.isoformat() if log.timestamp else None
                    }
                    formatted_logs.append(formatted_log)
                except Exception as log_error:
                    print(f"Error formatting log {log.id}: {str(log_error)}")
                    continue
            
            print(f"Successfully formatted {len(formatted_logs)} logs")
            return Response(formatted_logs)
        except Exception as query_error:
            print(f"Error querying logs: {str(query_error)}")
            return Response(
                {"error": "Failed to query logs", "details": str(query_error)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        print(f"Error in get_staff_activity_logs: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return Response(
            {"error": "Failed to fetch activity logs", "details": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# =============================================
# APPLICANT MANAGEMENT
# =============================================

# SUBMIT APPLICANT
# Function to create a new applicant record
@api_view(["POST"])
@permission_classes([AllowAny])  # allow QR submissions
@csrf_exempt
def submit_applicant(request):
    staff = None

    # Case 1: staff is logged in
    if request.user.is_authenticated:
        staff = request.user
    # Case 2: staff_ref_code from QR link
    else:
        staff_ref_code = request.data.get("staff_ref_code")
        if staff_ref_code:
            try:
                staff = CustomUser.objects.get(ref_code=staff_ref_code)
            except CustomUser.DoesNotExist:
                staff = None

    serializer = ApplicantSerializer(data=request.data, context={"request": request})

    if serializer.is_valid():
        applicant = serializer.save(staff=staff)

        # ✅ Always add to history
        ApplicantHistory.objects.create(
            background_info=applicant.background_info,
            applicant=applicant,
            type_of_assistance=applicant.type_of_assistance,
            date_applied=timezone.now(),  # or created_at if your model already has it
        )

        if staff:
            log_staff_activity(
                staff,
                "CREATE",
                f"Application recorded for {applicant.background_info.first_name} {applicant.background_info.last_name}",
                request,
            )

        return Response(ApplicantSerializer(applicant).data, status=201)

    return Response(serializer.errors, status=400)


# LIST APPLICANTS
# Function to get all non-archived applicants
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_applicants(request):
    applicants = Applicant.objects.filter(is_archived=False).select_related("background_info")
    serializer = ApplicantSerializer(applicants, many=True)

    data = serializer.data

    # Attach application history to each applicant
    for idx, applicant in enumerate(applicants):
        history_qs = ApplicantHistory.objects.filter(
            background_info=applicant.background_info
        ).order_by("-date_applied")

        history_data = [
            {
                "id": h.id,
                "type_of_assistance": h.type_of_assistance,
                "applicant_id": h.applicant.id if h.applicant else None,
                "date": h.date_applied,
            }
            for h in history_qs
        ]

        data[idx]["application_history"] = history_data

    return Response(data)

#APPROVED UPLOAD
# Function to upload and process approved applicants list
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_approved_list(request):
    file_obj = request.FILES.get("file")
    if not file_obj:
        return Response({"error": "No file uploaded"}, status=400)

    try:
        if file_obj.name.endswith(".csv"):
            df = pd.read_csv(file_obj)
        else:
            df = pd.read_excel(file_obj, engine="openpyxl")
        df.columns = df.columns.str.strip().str.lower()
    except Exception as e:
        return Response({"error": f"Failed to read file: {str(e)}"}, status=400)

    # create batch first
    batch = ApprovalBatch.objects.create(
        uploaded_by=request.user,
        file_name=file_obj.name,
        total_processed=0,
        total_approved=0,
        total_already_approved=0,
        total_not_found=0,
    )

    matched, not_found, already_approved = [], [], []

    for _, row in df.iterrows():
        last_name = str(row.get("last name", "")).strip()
        first_name = str(row.get("first name", "")).strip()
        middle_name = str(row.get("middle name", "")).strip()
        barangay = str(row.get("barangay", "")).strip()
        municipal = str(row.get("municipal", "")).strip()
        assistance_type = str(row.get("type of assistance", "")).strip()
        amount = row.get("amount of assistance")

        try:
            background = BackgroundInfo.objects.get(
                first_name__iexact=first_name,
                last_name__iexact=last_name,
                barangay__name__iexact=barangay,
                barangay__city__name__iexact=municipal,
            )

            applicant = (
                Applicant.objects.filter(
                    background_info=background,
                    type_of_assistance__iexact=assistance_type
                )
                .order_by("-date_filled")
                .first()
            )

            if not applicant:
                not_found.append(f"{first_name} {last_name} - {barangay} ({assistance_type})")
                continue

            if hasattr(applicant, "approval"):
                already_approved.append(f"{first_name} {last_name} - {barangay} ({assistance_type})")
            else:
                Approval.objects.create(
                    applicant=applicant,
                    batch=batch,  # 👈 link approval to this batch
                    approved_by=request.user,
                    notes=f"Approved amount: {amount}"
                )
                matched.append(f"{first_name} {last_name} - {barangay} ({assistance_type})")

        except BackgroundInfo.DoesNotExist:
            not_found.append(f"{first_name} {last_name} - {barangay} ({assistance_type})")

    # update batch summary
    batch.total_processed = len(df)
    batch.total_approved = len(matched)
    batch.total_already_approved = len(already_approved)
    batch.total_not_found = len(not_found)
    batch.save()

    return Response({
        "approved": matched,
        "already_approved": already_approved,
        "not_found": not_found,
        "total_processed": len(df)
    })



#APPROVED APPLICANTS
# Function to get approved applicants
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approved_applicants(request):
    approvals = Approval.objects.select_related(
        "applicant__background_info",
        "approved_by"
    ).order_by("-approved_at")

    data = [
        {
            "id": approval.id,
            "first_name": approval.applicant.background_info.first_name,
            "last_name": approval.applicant.background_info.last_name,
            "barangay": approval.applicant.background_info.barangay.name,
            "municipal": approval.applicant.background_info.barangay.city.name,
            "type_of_assistance": approval.applicant.type_of_assistance,
            "amount": approval.notes,  # stored in notes for now
            "approved_at": approval.approved_at.isoformat(),
            "approved_by": approval.approved_by.username if approval.approved_by else "System",
        }
        for approval in approvals
    ]
    return Response(data)

#APPROVAL BATCHES

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approval_batches(request):
    batches = ApprovalBatch.objects.order_by("-uploaded_at").all()
    data = [
        {
            "id": batch.id,
            "file_name": batch.file_name,
            "uploaded_by": batch.uploaded_by.username if batch.uploaded_by else "System",
            "uploaded_at": batch.uploaded_at.isoformat(),
            "total_processed": batch.total_processed,
            "total_approved": batch.total_approved,
            "total_already_approved": batch.total_already_approved,
            "total_not_found": batch.total_not_found,
        }
        for batch in batches
    ]
    return Response(data)

#APPROVED APPLICANTS BY BATCH
#
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approvals_for_batch(request, batch_id):
    approvals = Approval.objects.filter(batch_id=batch_id).select_related(
        "applicant__background_info", "approved_by"
    )

    data = [
        {
            "id": approval.id,
            "first_name": approval.applicant.background_info.first_name,
            "last_name": approval.applicant.background_info.last_name,
            "barangay": approval.applicant.background_info.barangay.name,
            "municipal": approval.applicant.background_info.barangay.city.name,
            "type_of_assistance": approval.applicant.type_of_assistance,
            "amount": approval.notes,
            "approved_at": approval.approved_at.isoformat(),
            "approved_by": approval.approved_by.username if approval.approved_by else "System",
        }
        for approval in approvals
    ]
    return Response(data)


#APPROVAL HISTORY
# Function to get history of approval batches
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approval_batch_history(request):
    batches = ApprovalBatch.objects.all().order_by("-uploaded_at")
    data = [
        {
            "id": batch.id,
            "uploaded_by": batch.uploaded_by.username if batch.uploaded_by else "System",
            "uploaded_at": batch.uploaded_at.isoformat(),
            "file_name": batch.file_name,
            "total_processed": batch.total_processed,
            "total_approved": batch.total_approved,
            "total_already_approved": batch.total_already_approved,
            "total_not_found": batch.total_not_found,
        }
        for batch in batches
    ]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_applicants_csv(request):
    from datetime import datetime

    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    assistance_type = request.GET.get("assistance_type")

    qs = Applicant.objects.filter(is_archived=False)

    if start_date and end_date:
        try:
            start = timezone.make_aware(datetime.strptime(start_date, "%Y-%m-%d"))
            end = timezone.make_aware(datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1))
            qs = qs.filter(date_filled__range=[start, end])
        except ValueError:
            print("Invalid date format received")

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="applicants.csv"'
    writer = csv.writer(response)

    writer.writerow([
        "ID", "First Name", "Middle Initial", "Last Name", "Suffix",
        "Contact Number", "Barangay", "City", "Province",
        "Birthday", "Sex", "Civil Status", "Occupation",
        "Monthly Income", "Valid ID", "Assistance Type",
        "Applicant Type", "Date Filled"
    ])

    for app in qs:
        bg = app.background_info
        writer.writerow([
            app.id,
            bg.first_name, bg.middle_initial or "", bg.last_name, bg.suffix or "",
            app.contact_number,
            bg.barangay.name, bg.barangay.city.name, bg.barangay.city.province.name,
            bg.birthday, bg.sex, bg.civil_status, bg.occupation or "",
            bg.monthly_income or "", app.valid_id_presented, app.type_of_assistance,
            app.applicant_type, app.date_filled.strftime("%Y-%m-%d %H:%M:%S"),
        ])

    print(f"Exported {qs.count()} applicants to CSV")
    return response


# RECENT APPLICANTS
# Function to get the 5 most recent applicants
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_applicants(request):
    applicants = Applicant.objects.all().order_by('-date_filled')[:5]
    serializer = ApplicantSerializer(applicants, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def applicant_detail(request, applicant_id):
    try:
        applicant = Applicant.objects.get(pk=applicant_id)
    except Applicant.DoesNotExist:
        return Response({'error': 'Applicant not found'}, status=404)

    if request.method == 'GET':
        serializer = ApplicantSerializer(applicant)

        # Include full history for this applicant’s BackgroundInfo
        history_qs = ApplicantHistory.objects.filter(
            background_info=applicant.background_info
        ).order_by("-date_applied")

        history_data = [
            {
                "id": h.id,
                "type_of_assistance": h.type_of_assistance,
                "applicant_id": h.applicant.id if h.applicant else None,
                "date": h.date_applied,
            }
            for h in history_qs
        ]


        response_data = serializer.data
        response_data["application_history"] = history_data

        return Response(response_data)

    elif request.method == 'PUT':
        serializer = ApplicantSerializer(applicant, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            log_staff_activity(
                request.user,
                'UPDATE',
                f"Updated application for {applicant.background_info.first_name} {applicant.background_info.last_name}",
                request
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        applicant.is_archived = True
        applicant.save()
        log_staff_activity(
            request.user,
            'ARCHIVE',
            f"Archived application for {applicant.background_info.first_name} {applicant.background_info.last_name}",
            request
        )
        return Response({"message": "Applicant archived successfully"})



# LIST ARCHIVED APPLICANTS
# Function to get all archived applicants
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_archived_applicants(request):
    applicants = Applicant.objects.filter(is_archived=True)
    serializer = ApplicantSerializer(applicants, many=True)
    return Response(serializer.data)

# RESTORE ARCHIVED APPLICANT
# Function to restore an archived applicant
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def restore_archived_applicant(request, pk):
    try:
        applicant = Applicant.objects.get(pk=pk)
        applicant.is_archived = False
        applicant.save()
        # Log the restore
        log_staff_activity(
            request.user,
            'RESTORE',
            f"Restored application for {applicant.background_info.first_name} {applicant.background_info.last_name}",
            request
        )
        return Response({"message": "Applicant restored successfully"})
    except Applicant.DoesNotExist:
        return Response({"error": "Applicant not found"}, status=404)

# =============================================
# GEOSPATIAL FUNCTIONS
# =============================================

# GET APPLICANT LOCATIONS
# Function to retrieve applicant locations for mapping
def get_applicant_locations(request):
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
            "city": city_name,
        })

    return JsonResponse(data, safe=False)

# UPDATE COORDINATES
# Function to update applicant's geographical coordinates
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_coordinates(request):
    applicant_id = request.data.get('id')
    barangay = request.data.get('background_info', {}).get('barangay')
    city_name = request.data.get('background_info', {}).get('barangay_details', {}).get('city_name')

    try:
        applicant = Applicant.objects.get(pk=applicant_id)

        # Build the location query with Quezon, Philippines to ensure correct location
        location_query = f"{barangay}, {city_name}, Quezon, Philippines"
        latitude, longitude = applicant.get_coordinates(location_query)

        if latitude and longitude:
            applicant.latitude = latitude
            applicant.longitude = longitude
            applicant.save()
            return Response({'latitude': latitude, 'longitude': longitude})
        else:
            return Response({'error': 'Could not retrieve coordinates'}, status=400)

    except Applicant.DoesNotExist:
        return Response({'error': 'Applicant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# =============================================
# ANALYTICS & REPORTING
# =============================================

# ---------------------------------------------
# Applicant Demographics
# ---------------------------------------------

# APPLICANTS BY GENDER
# Function to get applicant counts by gender
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_gender(request):
    data = Applicant.objects.values("background_info__sex").annotate(count=Count("id"))
    return Response(list(data))

# APPLICANTS BY CIVIL STATUS
# Function to get applicant counts by civil status
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_civil_status(request):
    data = Applicant.objects.values("background_info__civil_status").annotate(count=Count("id"))
    return Response(list(data))

# APPLICANTS BY AGE GROUP
# Function to get applicant counts by age groups
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

# INCOME DISTRIBUTION
# Function to get applicant counts by income ranges
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def income_distribution(request):
    # Define income ranges with a reasonable maximum
    income_ranges = [
        (0, 10000, 'Below 10,000'),
        (10001, 20000, '10,001 - 20,000'),
        (20001, 30000, '20,001 - 30,000'),
        (30001, 40000, '30,001 - 40,000'),
        (40001, 50000, '40,001 - 50,000'),
        (50001, 100000, '50,001 - 100,000'),
        (100001, None, 'Above 100,000')  # Use None instead of float('inf')
    ]
    
    # Get counts for each range
    distribution = []
    for min_income, max_income, label in income_ranges:
        if max_income is None:
            # For the last range (Above 100,000)
            count = Applicant.objects.filter(
                background_info__monthly_income__gte=min_income
            ).count()
        else:
            count = Applicant.objects.filter(
                background_info__monthly_income__gte=min_income,
                background_info__monthly_income__lt=max_income
            ).count()
        
        distribution.append({
            'range': label,
            'count': count
        })
    
    return Response(distribution)

# ---------------------------------------------
# Applicant Statistics
# ---------------------------------------------

# TOTAL APPLICANTS
# Function to get applicant counts for different time periods
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def total_applicants(request):
    today = now().date()
    one_week_ago = today - timedelta(days=7)
    one_month_ago = today - timedelta(days=30)

    daily_count = Applicant.objects.filter(date_filled__date=today).count()
    weekly_count = Applicant.objects.filter(date_filled__gte=one_week_ago).count()
    monthly_count = Applicant.objects.filter(date_filled__gte=one_month_ago).count()

    print(daily_count, weekly_count, monthly_count)

    return Response({
        "daily": daily_count,
        "weekly": weekly_count,
        "monthly": monthly_count
    })

# APPLICANTS BY ASSISTANCE TYPE
# Function to get applicant counts by assistance type
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

# APPLICANTS BY LOCATION
# Function to get applicant counts by location
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicants_by_location(request):
    data = Applicant.objects.values('city_municipality','barangay', 'latitude', 'longitude').annotate(count=Count('id'))
    return Response(list(data))

# TOP BARANGAYS
# Function to get top barangays by applicant count
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
    return Response(list(data))

# BARANGAY BY TYPE
# Function to get applicant counts by barangay and assistance type
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def barangay_by_type(request):
    data = Applicant.objects.values('background_info__barangay', 'type_of_assistance').annotate(count=Count('id')).order_by('-count')
    return Response(list(data))

# ---------------------------------------------
# Trend Analysis
# ---------------------------------------------

# TRENDS OVER TIME
# Function to get applicant trends over a time period
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

# ASSISTANCE TYPE TREND
# Function to get trends for specific assistance types
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

# MONTHLY TRENDS
# Function to get monthly applicant trends
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_trends(request):
    # Get the last 12 months of data
    end_date = timezone.now()
    start_date = end_date - timedelta(days=365)
    
    # Get monthly counts
    monthly_data = Applicant.objects.filter(
        date_filled__range=[start_date, end_date]
    ).annotate(
        month=TruncDate('date_filled')
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')
    
    # Format the data for the frontend
    formatted_data = [
        {
            'month': item['month'].strftime('%Y-%m'),
            'count': item['count']
        }
        for item in monthly_data
    ]
    
    return Response(formatted_data)

# ---------------------------------------------
# Performance Metrics
# ---------------------------------------------

# AVERAGE PROCESSING TIME
# Function to calculate average application processing time
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def average_processing_time(request):
    data = Applicant.objects.exclude(created_at__isnull=True).exclude(date_filled__isnull=True).annotate(
        processing_time=ExpressionWrapper(F('date_filled') - F('created_at'), output_field=DurationField())
    ).aggregate(avg_time=Avg('processing_time'))

    # Convert seconds to minutes and round to 1 decimal place
    avg_minutes = round(data['avg_time'].total_seconds() / 60, 1) if data['avg_time'] else 0

    return Response({
        "average_processing_time": avg_minutes
    })

# PROCESSING TIME BY TYPE
# Function to get average processing time by assistance type
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def processing_time_by_type(request):
    # Calculate average processing time for each assistance type
    processing_times = Applicant.objects.exclude(
        created_at__isnull=True
    ).exclude(
        date_filled__isnull=True
    ).values(
        'type_of_assistance'
    ).annotate(
        processing_time=Avg(
            ExpressionWrapper(
                F('date_filled') - F('created_at'),
                output_field=DurationField()
            )
        )
    ).order_by('type_of_assistance')
    
    # Format the data
    formatted_data = [
        {
            'type': item['type_of_assistance'],
            'minutes': round(item['processing_time'].total_seconds() / 60, 1) if item['processing_time'] and item['processing_time'].total_seconds() > 0 else 0
        }
        for item in processing_times
    ]
    
    return Response(formatted_data)

# STAFF ACTIVITY LOGS
# Function to get staff activity statistics
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_activity_logs(request):
    data = Applicant.objects.values('staff__username').annotate(count=Count('id')).order_by('-count')
    return Response(list(data))

# ---------------------------------------------
# Summary
# ---------------------------------------------

# SUMMARY METRICS
# Function to get overall application statistics
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def summary_metrics(request):
    # Get total applicants
    total_applicants = Applicant.objects.count()
    
    # Get average processing time in minutes
    avg_processing_time = Applicant.objects.exclude(
        created_at__isnull=True
    ).exclude(
        date_filled__isnull=True
    ).aggregate(
        avg_time=Avg(
            ExpressionWrapper(
                F('date_filled') - F('created_at'),
                output_field=DurationField()
            )
        )
    )['avg_time']

    
    # Convert to minutes and round to 1 decimal place
    avg_minutes = round(avg_processing_time.total_seconds() / 60, 1) if avg_processing_time and avg_processing_time.total_seconds() > 0 else 0
    
    # Get most common assistance type
    most_common_type = Applicant.objects.values(
        'type_of_assistance'
    ).annotate(
        count=Count('id')
    ).order_by('-count').first()
    
    # Get barangay with highest applications
    highest_barangay = Applicant.objects.values(
        'background_info__barangay__name'
    ).annotate(
        count=Count('id')
    ).order_by('-count').first()
    
    return Response({
        'totalApplicants': total_applicants,
        'averageProcessingTime': avg_minutes,
        'mostCommonType': most_common_type['type_of_assistance'] if most_common_type else 'N/A',
        'highestBarangay': highest_barangay['background_info__barangay__name'] if highest_barangay else 'N/A'
    })

#APPROVAL RATE 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approval_rate(request):
    total = Applicant.objects.count()
    approved = Approval.objects.count()
    rate = (approved / total * 100) if total > 0 else 0

    return Response({
        "total_applicants": total,
        "approved_applications": approved,
        "approval_rate": round(rate, 2)
    })

#APPROVAL RATE BY GROUP
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approval_rate_by_group(request):
    group_by = request.GET.get("group", "type_of_assistance")  

    groups = Applicant.objects.values(group_by).annotate(
        total=Count("id"),
        approved=Count("id", filter=Q(approval__isnull=False))
    )

    results = []
    for g in groups:
        total = g["total"]
        approved = g["approved"]
        rate = (approved / total * 100) if total > 0 else 0
        results.append({
            "group": g[group_by],
            "total": total,
            "approved": approved,
            "approval_rate": round(rate, 2)
        })

    return Response(results)



# =============================================
# HELPER FUNCTIONS
# =============================================

# LOG STAFF ACTIVITY
# Helper function to log staff activities
def log_staff_activity(staff, action, details=None, request=None):
    try:
        ip_address = request.META.get('REMOTE_ADDR') if request else None
        StaffActivityLog.objects.create(
            staff=staff,
            action=action,
            details=details,
            ip_address=ip_address
        )
    except Exception as e:
        print(f"Error logging staff activity: {str(e)}")
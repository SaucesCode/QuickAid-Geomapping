# Standard library
import csv
import datetime
import requests
import pandas as pd
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta


# Django
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password, ValidationError
from django.db import transaction
from django.db.models import (
    Avg, Count, ExpressionWrapper, F, DurationField,
    IntegerField, Max, Q, Prefetch
)
from django.db.models.functions import TruncDate, ExtractYear, TruncMonth, ExtractHour
from django.http import JsonResponse, StreamingHttpResponse
from django.utils import timezone
from django.utils.timezone import now, timedelta

# Django REST Framework
from rest_framework import status
from rest_framework.decorators import (
    api_view, permission_classes, parser_classes
)
from rest_framework.permissions import (
    IsAdminUser, IsAuthenticated, AllowAny
)
from rest_framework.throttling import AnonRateThrottle
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.pagination import LimitOffsetPagination

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

class ApplicantSubmissionRateThrottle(AnonRateThrottle):
    rate = '10/hour'  # allow 10 submissions per hour per IP

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
    user = request.user
    data = request.data
    changes = {}

    try:
        with transaction.atomic(): #For ensuring DB actions succeed or none
            #Validate and update username
            username = data.get('username')
            if username and username != user.username:
                if User.objects.only('id').filter(username=username).exists():
                    return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
                user.username = username
                changes['username'] = username
                
            #Validate and update email
            email = data.get('email')
            if email and email != user.email:
                if User.objects.only('id').filter(email=email).exists():
                    return Response({"error": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)
                user.email = email
                changes['email'] = email

            # First Name
            first_name = data.get('first_name')
            if first_name and first_name != user.first_name:
                user.first_name = first_name
                changes['first_name'] = first_name

            # Last Name
            last_name = data.get('last_name')
            if last_name and last_name != user.last_name:
                user.last_name = last_name
                changes['last_name'] = last_name
                
            if changes:
                user.save(update_fields=list(changes.keys()))

                log_staff_activity(
                    user,
                    'PROFILE',
                    f"Updated profile fields: {', '.join(changes.keys())}",
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
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

# CHANGE PASSWORD
# Function to change user password
# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def update_staff(request, pk):
#     try:
#         user = request.user

#         # Only allow admins or superusers to edit staff
#         if not user.is_superuser:
#             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

#         staff = get_object_or_404(User, pk=pk)
#         data = request.data

#         # Update basic info
#         for field in ['username', 'first_name', 'last_name', 'email']:
#             if field in data:
#                 setattr(staff, field, data[field])

#         # ✅ Allow admin to reset password directly if provided
#         new_password = data.get('password')
#         if new_password:
#             staff.set_password(new_password)

#         staff.save()

#         log_staff_activity(
#             user,
#             'UPDATE',
#             f"Updated staff {staff.username}",
#             request
#         )

#         return Response({
#             "message": f"Staff '{staff.username}' updated successfully"
#         }, status=status.HTTP_200_OK)

#     except Exception as e:
#         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# =============================================
# STAFF MANAGEMENT
# =============================================

# REGISTER STAFF
# Function to register new staff members (admin only)
@api_view(['POST'])
@permission_classes([IsAdminUser])
def register_staff(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')

    if not all([username, password, first_name, last_name, email]):
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
        
    duplicates = User.objects.filter(
        Q(username=username) | Q(email=email) | 
        Q(first_name=first_name, last_name=last_name)
    ).values('username', 'email', 'first_name', 'last_name')

    if duplicates.exists():
        for dup in duplicates:
            if dup['username'] == username:
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            if dup['email'] == email:
                return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
            if dup['first_name'] == first_name and dup['last_name'] == last_name:
                return Response({"error": "A user with the same full name already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
    try:
        validate_password(password)
    except ValidationError as e:
        return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)
    
    try: 
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                email=email,
                is_staff=True,
                role='staff'
            )
    
            log_staff_activity(
                request.user,
                'CREATE',
                f"Registered new staff member: {username}",
                request
            )
        return Response({"message": f"Staff '{user.username}' registered successfully"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# LIST ALL STAFF
# Function to retrieve list of all staff members
@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_staff(request):
    staff_users = User.objects.filter(is_staff=True, is_active=True)\
        .values('id', 'username', 'first_name', 'last_name', 'email', 'last_active')\
        .order_by('last_active')
    return Response(list(staff_users))

# UPDATE STAFF INFO
# Function to update staff member information
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_staff(request, staff_id):
    try:
        user = CustomUser.objects.only('id', 'username', 'email', 'first_name', 'last_name').get(id=staff_id)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    data = request.data
    username = data.get("username")
    email = data.get("email")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    password = data.get("password")

    # Duplicate check
    duplicates =  CustomUser.objects.exclude(id=staff_id).filter(
        Q(username=username) | Q(email=email)
    ).values('username', 'email')

    if duplicates.exists():
        for dup in duplicates:
            if dup['username'] == username:
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            if dup['email'] == email:
                return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
            
    fields_to_update = []
    if username and username != user.username:
        user.username = username
        fields_to_update.append('username')
    if email and email != user.email:
        user.email = email
        fields_to_update.append('email')
    if first_name and first_name != user.first_name:
        user.first_name = first_name
        fields_to_update.append('first_name')
    if last_name and last_name != user.last_name:
        user.last_name = last_name
        fields_to_update.append('last_name')
    if password:
        user.set_password(password)
        fields_to_update.append('password')

    if not fields_to_update:
        return Response({"message": "No changes detected"}, status=status.HTTP_200_OK)
        
    try:
        with transaction.atomic():
            user.save(update_fields=fields_to_update)

            log_staff_activity(
                request.user,
                'UPDATE',
                f"Updated staff member: {user.username}",
                request
            )

        return Response({"message": f"Staff '{user.username}' updated successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    

# DELETE STAFF
# Function to delete a staff member
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_staff(request, staff_id):
    try:
        user = User.objects.get(pk=staff_id, is_staff=True)

        if user.is_superuser:
            return Response({"error": "Cannot delete superuser account"}, status=status.HTTP_403_FORBIDDEN)
        if user == request.user:
            return Response({"error": "You cannot delete yourself"}, status=status.HTTP_403_FORBIDDEN)
        
        with transaction.atomic():
            user.is_active = False
            user.save(update_fields=['is_active'])

            log_staff_activity(
                request.user,
                'DELETE',
                f"Deactivated staff member: {user.username}",
                request
            )
        return Response({"message": f"Staff '{user.username}' deactivated successfully"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# GET STAFF ACTIVITY LOGS
# Function to retrieve detailed staff activity logs
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_staff_activity_logs(request):
    try:
        # Get current user and prepare pagination
        user = request.user
        paginator = LimitOffsetPagination()

        if user.is_superuser:
            logs = StaffActivityLog.objects.select_related('staff').order_by('-timestamp')
        else:
            logs = StaffActivityLog.objects.select_related('staff').filter(staff=user).order_by('-timestamp')
            
        paginated_logs = paginator.paginate_queryset(logs, request)
        print(f"Fetched {len(paginated_logs)} logs for user {user.username}")

        formatted_logs = [
            {
                'id': log.id,
                'staff_member': f"{log.staff.first_name} {log.staff.last_name}",
                'action': log.action,
                'details': log.details or '',
                'timestamp': log.timestamp.isoformat() if log.timestamp else None,
            }
            for log in paginated_logs
        ]

        return paginator.get_paginated_response(formatted_logs)
    
    except Exception as e:
        print(f"Error in get_staff_activity_logs: {str(e)}")
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
def submit_applicant(request):
    """
    Handles applicant submission.
    - Staff can submit via dashboard (authenticated)
    - Public users can submit via QR (using staff_ref_code)
    """
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

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    with transaction.atomic():
        applicant = serializer.save(staff=staff)

        ApplicantHistory.objects.create(
            background_info=applicant.background_info,
            applicant=applicant,
            type_of_assistance=applicant.type_of_assistance,
            date_applied=timezone.now(),
        )

        if staff:
            log_staff_activity(
                staff,
                "CREATE",
                f"Application recorded for {applicant.background_info.first_name} {applicant.background_info.last_name}",
                request,
            )

    return Response(ApplicantSerializer(applicant).data, status=201)



# LIST APPLICANTS
# Function to get all non-archived applicants
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_applicants(request):
    """
    Optimized applicant listing endpoint:
    - Supports pagination (limit/offset)
    - Supports search and ordering
    - Prefetches only necessary related data
    """

    search = request.GET.get('search', '')
    ordering = request.GET.get('ordering', '-date_filled')  # default: newest first

    paginator = LimitOffsetPagination()
    paginator.default_limit = 50

    # ✅ Optimize: prefetch related objects
    applicants_qs = (
        Applicant.objects.filter(is_archived=False)
        .select_related(
            'background_info', 
            'background_info__barangay',
            'background_info__barangay__city',
        )\
        .prefetch_related(
            Prefetch(
                'background_info__histories',
                queryset=ApplicantHistory.objects.only(
                    'id', 'type_of_assistance', 'applicant', 'date_applied'
                ).order_by('-date_applied'),
                to_attr='prefetched_history'
            )
        )
    )

    # ✅ Optional: case-insensitive search filter
    if search:
        applicants_qs = applicants_qs.filter(
            Q(background_info__first_name__icontains=search) |
            Q(background_info__last_name__icontains=search) |
            Q(background_info__barangay__name__icontains=search) |
            Q(background_info__barangay__city__name__icontains=search) |
            Q(type_of_assistance__icontains=search)
        )

    # ✅ Ordering (e.g., ?ordering=date_filled or ?ordering=-background_info__last_name)
    if ordering:
        applicants_qs = applicants_qs.order_by(ordering)

    # ✅ Paginate results
    paginated_queryset = paginator.paginate_queryset(applicants_qs, request)
    serializer = ApplicantSerializer(paginated_queryset, many=True, context={"request": request})

    # ✅ Add preloaded history without extra DB queries
    data = serializer.data
    for idx, applicant in enumerate(paginated_queryset):
        history_data = [
            {
                "id": h.id,
                "type_of_assistance": h.type_of_assistance,
                "applicant_id": h.applicant.id if h.applicant else None,
                "date": h.date_applied,
            }
            for h in getattr(applicant.background_info, 'prefetched_history', [])
        ]
        data[idx]["application_history"] = history_data

    return paginator.get_paginated_response(data)

    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_approved_list(request):
    file_obj = request.FILES.get("file")
    if not file_obj:
        return Response({"error": "No file uploaded"}, status=400)

    # ✅ Read CSV or Excel safely
    try:
        if file_obj.name.endswith(".csv"):
            df = pd.read_csv(file_obj)
        else:
            df = pd.read_excel(file_obj, engine="openpyxl")
        df.columns = df.columns.str.strip().str.lower()
    except Exception as e:
        return Response({"error": f"Failed to read file: {str(e)}"}, status=400)

    # ✅ Create approval batch
    batch = ApprovalBatch.objects.create(
        uploaded_by=request.user,
        file_name=file_obj.name,
        total_processed=len(df),
    )

    matched = []

    # ✅ Collect all names to query in bulk
    applicant_filters = Q()
    for _, row in df.iterrows():
        first_name = str(row.get("first name", "")).strip()
        last_name = str(row.get("last name", "")).strip()
        middle_name = str(row.get("middle name", "")).strip()
        barangay = str(row.get("barangay", "")).strip()
        city = str(row.get("municipal", "")).strip()
        assistance_type = str(row.get("type of assistance", "")).strip()

        # Build Q object to batch query
        applicant_filters |= (
            Q(
                background_info__first_name__iexact=first_name,
                background_info__middle_initial__iexact=middle_name,
                background_info__last_name__iexact=last_name,
                background_info__barangay__name__iexact=barangay,
                background_info__barangay__city__name__iexact=city,
                type_of_assistance__iexact=assistance_type,
            )
        )

    # ✅ Bulk fetch applicants in a single query
    applicants = {
        (
            a.background_info.first_name.lower(),
            a.background_info.middle_initial.lower() if a.background_info.middle_initial else '',
            a.background_info.last_name.lower(),
            a.background_info.barangay.name.lower(),
            a.background_info.barangay.city.name.lower(),
            a.type_of_assistance.lower(),
        ): a
        for a in Applicant.objects.select_related(
            'background_info',
            'background_info__barangay__city'
        ).filter(applicant_filters)
    }

    # ✅ Process approvals in one transaction
    with transaction.atomic():
        for _, row in df.iterrows():
            first_name = str(row.get("first name", "")).strip().lower()
            last_name = str(row.get("last name", "")).strip().lower()
            middle_name = str(row.get("middle name", "")).strip().lower()
            barangay = str(row.get("barangay", "")).strip().lower()
            city = str(row.get("municipal", "")).strip().lower()
            assistance_type = str(row.get("type of assistance", "")).strip().lower()
            amount = row.get("amount of assistance")

            key = (first_name, middle_name, last_name, barangay, city, assistance_type)
            applicant = applicants.get(key)

            if not applicant:
                continue  # Skip if not found, no error needed

            Approval.objects.create(
                applicant=applicant,
                batch=batch,
                approved_by=request.user,
                notes=f"Approved amount: {amount}"
            )
            matched.append(f"{first_name.title()} {last_name.title()} - {barangay.title()} ({assistance_type.title()})")

    # ✅ Update batch summary
    batch.total_approved = len(matched)
    batch.save(update_fields=["total_processed", "total_approved"])

    return Response({
        "approved": matched,
        "total_processed": len(df),
        "total_approved": len(matched),
        "message": "Approved applicants processed successfully"
    }, status=201)



#APPROVED APPLICANTS
# Function to get approved applicants
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approved_applicants(request):
    approvals = Approval.objects.select_related(
        "applicant",
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
    paginator = LimitOffsetPagination()
    paginator.default_limit = 50

    batches = ApprovalBatch.objects.select_related("uploaded_by").order_by("-uploaded_at")
    paginated_queryset = paginator.paginate_queryset(batches, request)

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
        for batch in paginated_queryset
    ]
    return paginator.get_paginated_response(data)


#APPROVED APPLICANTS BY BATCH
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approvals_for_batch(request, batch_id):
    paginator = LimitOffsetPagination()
    paginator.default_limit = 50

    approvals = Approval.objects.filter(batch_id=batch_id).select_related(
        "applicant",
        "applicant__background_info", 
        "applicant__background_info__barangay", 
        "applicant__background_info__barangay__city", 
        "approved_by"
    )

    paginated_queryset = paginator.paginate_queryset(approvals, request)

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
        for approval in paginated_queryset
    ]
    return paginator.get_paginated_response(data)


#APPROVAL HISTORY
# Function to get history of approval batches
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approval_batch_history(request):
    paginator = LimitOffsetPagination()
    paginator.default_limit = 50 

    batches = ApprovalBatch.objects.select_related("uploaded_by").order_by("-uploaded_at")

    paginated_queryset = paginator.paginate_queryset(batches, request)
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
        for batch in paginated_queryset
    ]
    return paginator.get_paginated_response(data)

# ✅ Helper class for streaming CSV (memory efficient)
class Echo:
    def write(self, value):
        return value
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_applicants_csv(request):
    """
    Export filtered applicant data as a CSV file.
    Includes representative information when available.
    """
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    assistance_type = request.GET.get("assistance_type")

    # Base queryset
    qs = Applicant.objects.filter(is_archived=False).select_related(
        "background_info",
        "background_info__barangay",
        "background_info__barangay__city",
        "background_info__barangay__city__province"
    ).prefetch_related("representative__background_info")

    # 📅 Date filtering
    if start_date and end_date:
        try:
            start = timezone.make_aware(datetime.strptime(start_date, "%Y-%m-%d"))
            end = timezone.make_aware(
                datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)
            )
            qs = qs.filter(date_filled__range=[start, end])
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

    # 🎯 Assistance type filtering (case-insensitive)
    if assistance_type:
        qs = qs.filter(type_of_assistance__iexact=assistance_type)

    # 🧠 Use iterator() for large datasets — avoids loading all into memory
    qs = qs.iterator(chunk_size=500)

    # Prepare CSV header
    header = [
        "Applicant ID", "First Name", "Middle Initial", "Last Name", "Suffix",
        "Contact Number", "Barangay", "City", "Province",
        "Birthday", "Sex", "Civil Status", "Occupation",
        "Monthly Income", "Valid ID", "Assistance Type",
        "Applicant Type", "Date Filled",
        "Representative First Name", "Representative Last Name",
        "Representative Contact Number"
    ]

    # ⚡ Streaming response setup
    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)
    rows = []

    # Header row first
    rows.append(writer.writerow(header))

    # Data rows generator (lazy)
    for app in qs:
        bg = app.background_info
        rep = getattr(app, "representative", None)
        rep_bg = getattr(rep, "background_info", None) if rep else None

        rows.append(writer.writerow([
            app.id,
            bg.first_name,
            bg.middle_initial or "",
            bg.last_name,
            bg.suffix or "",
            app.contact_number,
            bg.barangay.name,
            bg.barangay.city.name,
            bg.barangay.city.province.name,
            bg.birthday.strftime("%Y-%m-%d"),
            bg.sex,
            bg.civil_status,
            bg.occupation or "",
            bg.monthly_income or "",
            app.valid_id_presented,
            app.type_of_assistance,
            app.applicant_type,
            app.date_filled.strftime("%Y-%m-%d %H:%M:%S"),
            rep_bg.first_name if rep_bg else "",
            rep_bg.last_name if rep_bg else "",
            getattr(rep, "contact_number", ""),
        ]))

    response = StreamingHttpResponse(rows, content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="applicants.csv"'
    return response

# RECENT APPLICANTS
# Function to get the 5 most recent applicants
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_applicants(request):
    applicants = Applicant.objects.filter(is_archived=False)\
        .select_related(
            'background_info',
            'background_info__barangay',
            "background_info__barangay__city")\
        .order_by('-date_filled')[:5]
    serializer = ApplicantSerializer(applicants, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def applicant_detail(request, applicant_id):

    applicant = get_object_or_404(
        Applicant.objects.select_related(
            "background_info__barangay__city",
            "background_info__barangay__city__province",
            "representative__background_info",
        ),
        pk=applicant_id,
    )

    if request.method == 'GET':
        serializer = ApplicantSerializer(applicant, context={"request": request})

        # Include full history for this applicant’s BackgroundInfo
        history_qs = (
            ApplicantHistory.objects
            .filter(background_info=applicant.background_info)
            .select_related("applicant")  # avoids query per history row
            .order_by("-date_applied")
        )

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
                "UPDATE",
                f"Updated application for {applicant.background_info.first_name} {applicant.background_info.last_name}",
                request
            )

            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        applicant.is_archived = True
        applicant.save(update_fields=["is_archived"])

        log_staff_activity(
            request.user,
            "ARCHIVE",
            f"Archived application for {applicant.background_info.first_name} {applicant.background_info.last_name}",
            request
        )

        return Response({"message": "Applicant archived successfully"})



# LIST ARCHIVED APPLICANTS
# Function to get all archived applicants
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_archived_applicants(request):

    paginator = LimitOffsetPagination()
    paginator.default_limit = 50

    applicants = Applicant.objects.filter(is_archived=True)\
        .select_related(
            "background_info",
            "background_info__barangay",
        )\
        .order_by("-date_filled")

    paginated_query = paginator.paginate_queryset(applicants, request)
    serializer = ApplicantSerializer(paginated_query, many=True, context={"request": request})
    return paginator.get_paginated_response(serializer.data)

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
        'background_info',
        'background_info__barangay',
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

# ======================================================
# 1. 📊 DASHBOARD (Executive Summary & KPIs)
# ======================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def summary_metrics(request):
    """
    📊 Dashboard: High-level summary metrics
    - Total applicants
    - Average processing time (minutes)
    - Most common assistance type
    - Barangay with highest applications
    """
    total_applicants = Applicant.objects.count()
    avg_processing_time = Applicant.objects.exclude(
        created_at__isnull=True, date_filled__isnull=True
    ).aggregate(
        avg_time=Avg(ExpressionWrapper(
            F('date_filled') - F('created_at'),
            output_field=DurationField()
        ))
    )['avg_time']
    avg_minutes = round(avg_processing_time.total_seconds() / 60, 1) if avg_processing_time else 0

    most_common_type = Applicant.objects.values('type_of_assistance').annotate(
        count=Count('id')
    ).order_by('-count').first()

    highest_barangay = Applicant.objects.values('background_info__barangay__name').annotate(
        count=Count('id')
    ).order_by('-count').first()

    return Response({
        'totalApplicants': total_applicants,
        'averageProcessingTime': avg_minutes,
        'mostCommonType': most_common_type['type_of_assistance'] if most_common_type else 'N/A',
        'highestBarangay': highest_barangay['background_info__barangay__name'] if highest_barangay else 'N/A'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def total_applicants(request):
    """
    📊 Dashboard: Applicant counts
    - Daily, weekly, monthly totals
    """
    today = timezone.now().date()
    start_of_week = today - timedelta(days=today.weekday())
    start_of_month = today.replace(day=1)

    applicants = Applicant.objects.all()

    return Response({
        'daily': applicants.filter(date_filled__date=today).count(),
        'weekly': applicants.filter(date_filled__date__gte=start_of_week).count(),
        'monthly': applicants.filter(date_filled__date__gte=start_of_month).count()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicant_growth_rate(request):
    """
    📊 Dashboard: Applicant growth rate
    - Compare this month vs previous month (% growth)
    """
    today = timezone.now().date()
    last_month = today - timedelta(days=30)
    prev_month = today - timedelta(days=60)

    this_month = Applicant.objects.filter(date_filled__gte=last_month).count()
    previous_month = Applicant.objects.filter(date_filled__range=[prev_month, last_month]).count()

    growth = ((this_month - previous_month) / previous_month * 100) if previous_month > 0 else 0

    return Response({
        "this_month": this_month,
        "previous_month": previous_month,
        "growth_rate": round(growth, 2)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def repeat_applicants(request):
    """
    📊 Dashboard: Repeat applicants
    - Count of applicants who submitted multiple applications
    """
    repeat_count = BackgroundInfo.objects.annotate(app_count=Count('applicant')).filter(app_count__gt=1).count()
    return Response({"repeat_applicants": repeat_count})


# ======================================================
# 2. 🌍 GEOGRAPHIC INSIGHTS
# ======================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_applicant_locations(request):
    """
    🌍 Geographic: Applicant locations
    - Returns lat/lon + address for mapping
    - Filters: type, city, barangay
    """
    applicants = Applicant.objects.select_related('background_info__barangay__city').exclude(
        latitude__isnull=True, longitude__isnull=True
    )

    if request.GET.get("type"):
        applicants = applicants.filter(type_of_assistance=request.GET["type"])
    if request.GET.get("city"):
        applicants = applicants.filter(background_info__barangay__city__name=request.GET["city"])
    if request.GET.get("barangay"):
        applicants = applicants.filter(background_info__barangay__name=request.GET["barangay"])

    data = [{
        "id": app.id,
        "full_name": f"{app.background_info.first_name} {app.background_info.last_name}",
        "latitude": app.latitude,
        "longitude": app.longitude,
        "address": f"{app.background_info.street_address}, {app.background_info.barangay.name}, {app.background_info.barangay.city.name}",
        "type_of_assistance": app.type_of_assistance,
        "barangay": app.background_info.barangay.name,
        "city": app.background_info.barangay.city.name,
    } for app in applicants]

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_barangays(request):
    """
    🌍 Geographic: Top barangays
    - Returns top 10 barangays by applicant count
    - Optional filters: assistance type, date range
    """
    qs = Applicant.objects.all()
    if request.GET.get("type"):
        qs = qs.filter(type_of_assistance=request.GET["type"])
    if request.GET.get("start") and request.GET.get("end"):
        qs = qs.filter(date_filled__date__range=[request.GET["start"], request.GET["end"]])

    data = qs.values('background_info__barangay__name').annotate(count=Count('id')).order_by('-count')[:10]
    return Response(list(data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def barangay_by_type(request):
    """
    🌍 Geographic: Applications by barangay & assistance type
    """
    data = Applicant.objects.values(
        'background_info__barangay__name', 'type_of_assistance'
    ).annotate(count=Count('id')).order_by('-count')
    return Response(list(data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approval_rate_by_location(request):
    """
    🌍 Geographic: Approval rates by location
    - Grouped by province/city/barangay (configurable via ?group=)
    """
    group = request.GET.get("group", "background_info__barangay__city__name")
    qs = Applicant.objects.values(group).annotate(
        total=Count("id"),
        approved=Count("id", filter=Q(approvals__isnull=False))
    )

    results = [{
        "location": item[group],
        "total": item["total"],
        "approved": item["approved"],
        "approval_rate": round((item["approved"] / item["total"] * 100), 2) if item["total"] > 0 else 0
    } for item in qs]

    return Response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inactive_applicants(request):
    """
    🌍 Geographic: Inactive applicants
    - Applicants with no new applications in X months (default=6)
    """
    months = int(request.GET.get("months", 6))
    cutoff = now() - timedelta(days=30*months)

    inactive = BackgroundInfo.objects.annotate(
        last_app=Max("applicant__date_filled")
    ).filter(Q(last_app__lt=cutoff) | Q(last_app__isnull=True))

    data = [{
        "id": b.id,
        "name": f"{b.first_name} {b.last_name}",
        "last_application": b.application_history().first().date_filled if b.application_history().exists() else None
    } for b in inactive]

    return Response(data)


# ======================================================
# 3. 👥 DEMOGRAPHICS & ECONOMICS
# ======================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_gender(request):
    """👥 Demographics: Applicants by gender"""
    return Response(list(Applicant.objects.values("background_info__sex").annotate(count=Count("id"))))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_civil_status(request):
    """👥 Demographics: Applicants by civil status"""
    return Response(list(Applicant.objects.values("background_info__civil_status").annotate(count=Count("id"))))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_age_group(request):
    """👥 Demographics: Applicants by age groups (0–17, 18–25, … 60+)"""
    today = datetime.date.today()
    qs = Applicant.objects.annotate(
        age=ExpressionWrapper(today.year - ExtractYear("background_info__birthday"), output_field=IntegerField())
    )
    age_groups = {
        "0-17": qs.filter(age__lte=17).count(),
        "18-25": qs.filter(age__gte=18, age__lte=25).count(),
        "26-35": qs.filter(age__gte=26, age__lte=35).count(),
        "36-45": qs.filter(age__gte=36, age__lte=45).count(),
        "46-60": qs.filter(age__gte=46, age__lte=60).count(),
        "60+": qs.filter(age__gt=60).count(),
    }
    return Response([{"age_group": g, "count": c} for g, c in age_groups.items()])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicants_by_occupation(request):
    data = (
        Applicant.objects.values("background_info__occupation")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    formatted = [
        {
            "occupation": (
                "No Occupation" if item["background_info__occupation"].lower() == "none" else item["background_info__occupation"]
            ),
            "count": item["count"],
        }
        for item in data
    ]

    return Response(formatted)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicants_by_age_gender(request):
    """👥 Demographics: Applicants by age × gender cross-tab"""
    today = datetime.date.today()
    qs = Applicant.objects.annotate(
        age=ExpressionWrapper(today.year - ExtractYear("background_info__birthday"), output_field=IntegerField())
    )
    data = qs.values("background_info__sex").annotate(
        under18=Count("id", filter=Q(age__lt=18)),
        between18_35=Count("id", filter=Q(age__gte=18, age__lte=35)),
        between36_60=Count("id", filter=Q(age__gte=36, age__lte=60)),
        above60=Count("id", filter=Q(age__gt=60)),
    )
    return Response(list(data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def income_distribution(request):
    """💰 Economics: Income distribution by applicant"""
    income_ranges = [
        (0, 10000, 'Below 10,000'),
        (10001, 20000, '10,001 - 20,000'),
        (20001, 30000, '20,001 - 30,000'),
        (30001, 40000, '30,001 - 40,000'),
        (40001, 50000, '40,001 - 50,000'),
        (50001, 100000, '50,001 - 100,000'),
        (100001, None, 'Above 100,000')
    ]
    distribution = []
    for min_income, max_income, label in income_ranges:
        if max_income is None:
            count = Applicant.objects.filter(background_info__monthly_income__gte=min_income).count()
        else:
            count = Applicant.objects.filter(
                background_info__monthly_income__gte=min_income,
                background_info__monthly_income__lt=max_income
            ).count()
        distribution.append({"range": label, "count": count})
    return Response(distribution)

# ======================================================
# 4. 📈 APPLICATION & APPROVAL TRENDS
# ======================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_trends(request):
    """
    📈 Trends: Applicants by month (last 12 months)
    """
    today = timezone.now().date()
    start_date = today.replace(day=1) - relativedelta(months=11)
    qs = Applicant.objects.filter(date_filled__gte=start_date)

    data = qs.annotate(month=TruncMonth("date_filled")).values("month").annotate(count=Count("id")).order_by("month")
    return Response(list(data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def yearly_trends(request):
    """
    📈 Trends: Applicants by year
    """
    qs = Applicant.objects.annotate(year=ExtractYear("date_filled")).values("year").annotate(count=Count("id")).order_by("year")
    return Response(list(qs))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trends_over_time(request):
    """
    📈 Trends: Applicants over time (daily granularity, configurable start/end)
    """
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")

    qs = Applicant.objects.all()
    if start_date and end_date:
        qs = qs.filter(date_filled__date__range=[start_date, end_date])

    data = qs.annotate(day=TruncDate("date_filled")).values("day").annotate(count=Count("id")).order_by("day")
    return Response(list(data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cumulative_applicants(request):
    """
    📈 Trends: Cumulative applicants over time
    """
    qs = Applicant.objects.annotate(day=TruncDate("date_filled")).values("day").annotate(count=Count("id")).order_by("day")

    cumulative = []
    total = 0
    for row in qs:
        total += row["count"]
        cumulative.append({"day": row["day"], "cumulative": total})
    return Response(cumulative)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assistance_type_trend(request):
    """
    📈 Trends: Distribution of assistance types
    """
    qs = Applicant.objects.values("type_of_assistance").annotate(count=Count("id")).order_by("-count")
    return Response(list(qs))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assistance_type_over_time(request):
    """
    📈 Trends: Assistance types over time (monthly stacked)
    """
    qs = Applicant.objects.annotate(month=TruncMonth("date_filled")).values("month", "type_of_assistance").annotate(count=Count("id")).order_by("month")
    return Response(list(qs))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approval_trends(request):
    """
    📈 Trends: Approval counts over time (monthly)
    """
    qs = Applicant.objects.filter(approvals__isnull=False).annotate(month=TruncMonth("date_filled")).values("month").annotate(count=Count("id")).order_by("month")
    return Response(list(qs))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def time_to_approval(request):
    """
    📈 Trends: Average time to approval (days)
    """
    qs = Applicant.objects.exclude(date_filled__isnull=True).exclude(approvals__date_approved__isnull=True)
    qs = qs.annotate(duration=ExpressionWrapper(
        F("approvals__date_approved") - F("date_filled"), output_field=DurationField()
    ))

    avg_time = qs.aggregate(avg=Avg("duration"))["avg"]
    avg_days = round(avg_time.total_seconds() / 86400, 1) if avg_time else 0
    return Response({"average_days_to_approval": avg_days})

# Applicants Activity Heatmap (by hour of day)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicant_activity_heatmap(request):
    from django.db.models.functions import ExtractHour

    qs = Applicant.objects.annotate(
        hour=ExtractHour("date_filled")
    ).values("hour").annotate(count=Count("id")).order_by("hour")

    results = []
    for i in range(24):
        hour_data = next((item for item in qs if item["hour"] == i), None)
        results.append({
            "hour": i,
            "count": hour_data["count"] if hour_data else 0
        })

    return Response(results)



# ======================================================
# 5. ⚡ PERFORMANCE & PRODUCTIVITY
# ======================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def average_processing_time(request):
    """
    ⚡ Performance: Average processing time (minutes)
    """
    qs = Applicant.objects.exclude(created_at__isnull=True, date_filled__isnull=True).annotate(
        duration=ExpressionWrapper(F("date_filled") - F("created_at"), output_field=DurationField())
    )
    avg_time = qs.aggregate(avg=Avg("duration"))["avg"]
    avg_minutes = round(avg_time.total_seconds() / 60, 1) if avg_time else 0
    return Response({"average_processing_time_minutes": avg_minutes})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def processing_time_by_type(request):
    """
    ⚡ Performance: Average processing time grouped by assistance type
    """
    qs = Applicant.objects.exclude(created_at__isnull=True, date_filled__isnull=True).annotate(
        duration=ExpressionWrapper(F("date_filled") - F("created_at"), output_field=DurationField())
    )

    data = qs.values("type_of_assistance").annotate(
        avg_time=Avg("duration")
    ).order_by("type_of_assistance")

    results = [{
        "type": row["type_of_assistance"],
        "avg_minutes": round(row["avg_time"].total_seconds() / 60, 1) if row["avg_time"] else 0
    } for row in data]

    return Response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def processing_time_distribution(request):
    """
    ⚡ Performance: Distribution of processing times (bucketed in minutes)
    """
    qs = Applicant.objects.exclude(created_at__isnull=True, date_filled__isnull=True).annotate(
        duration=ExpressionWrapper(F("date_filled") - F("created_at"), output_field=DurationField())
    )

    buckets = {
        "<30 mins": qs.filter(duration__lte=timedelta(minutes=30)).count(),
        "30-60 mins": qs.filter(duration__gt=timedelta(minutes=30), duration__lte=timedelta(hours=1)).count(),
        "1-2 hrs": qs.filter(duration__gt=timedelta(hours=1), duration__lte=timedelta(hours=2)).count(),
        "2+ hrs": qs.filter(duration__gt=timedelta(hours=2)).count()
    }
    return Response([{"bucket": k, "count": v} for k, v in buckets.items()])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_productivity(request):
    """
    ⚡ Performance: Applicants processed per staff member
    """
    qs = Applicant.objects.values("staff__username").annotate(count=Count("id")).order_by("-count")
    return Response(list(qs))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_leaderboard(request):
    """
    ⚡ Performance: Staff ranked by number of processed applications
    """
    qs = Applicant.objects.values("staff__username").annotate(count=Count("id")).order_by("-count")[:10]
    return Response(list(qs))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_activity_logs(request):
    """
    ⚡ Performance: Staff activity logs (timeline of actions)
    """
    logs = StaffActivityLog.objects.all().order_by("-timestamp")[:100]
    return Response([{
        "id": log.id,
        "staff": log.staff.username,
        "action": log.action,
        "timestamp": log.timestamp
    } for log in logs])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_activity_heatmap(request):
    """
    ⚡ Performance: Staff activity heatmap (hourly distribution)
    """
    qs = StaffActivityLog.objects.annotate(hour=ExtractHour("timestamp")).values("hour").annotate(count=Count("id")).order_by("hour")
    return Response(list(qs))


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
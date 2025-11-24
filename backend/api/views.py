# Standard library
import csv
import datetime
import json
import requests
import pandas as pd
import numpy as np
import base64
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta, date
from django.core.cache import cache

# Django
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password, ValidationError
from django.db import transaction
from django.db.models import (
    Avg, Count, ExpressionWrapper, F, DurationField,
    IntegerField, Max, Q, Prefetch, Min
)
from django.db.models.functions import TruncDate, ExtractYear, TruncMonth, ExtractHour
from django.http import JsonResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.utils.timezone import now, timedelta
from .utils import apply_applicant_filters, apply_approval_filters, get_applicant_history
from .export_analytics import ExportOrchestrator
from django.core.exceptions import ValidationError

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
    BackgroundInfo, ApplicantHistory, Approval, ApprovalBatch, SupportMessage, City, Barangay
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
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    🔐 Allows a logged-in user to change their own password.
    Fields: old_password, new_password
    """
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not all([old_password, new_password]):
        return Response({"error": "Both old and new passwords are required."}, status=400)

    if not user.check_password(old_password):
        return Response({"error": "Old password is incorrect."}, status=400)

    user.set_password(new_password)
    user.save()

    log_staff_activity(
        user,
        "CHANGE_PASSWORD",
        f"Changed password for {user.username}",
        request
    )

    return Response({"message": "Password changed successfully."}, status=200)


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
    search = request.GET.get('search', '')
    is_active = request.GET.get('active', 'true').lower() == 'true'
    ordering = request.GET.get('ordering', 'last_active')

    staff_users = User.objects.filter(is_staff=True, is_active=is_active)

    if search:
        staff_users = staff_users.filter(
            Q(username__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )

    staff_users = staff_users.order_by(ordering).values(
        'id', 'username', 'first_name', 'last_name', 'email', 'last_active'
    )

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
    paginator = LimitOffsetPagination()
    paginator.default_limit = 50

    applicants_qs = (
        Applicant.objects.filter(is_archived=False).all()
        .select_related(
            'background_info',
            'background_info__barangay',
            'background_info__barangay__city',
        )
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

    try:
        applicants_qs = apply_applicant_filters(applicants_qs, request)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    paginated_queryset = paginator.paginate_queryset(applicants_qs, request)
    serializer = ApplicantSerializer(paginated_queryset, many=True, context={"request": request})

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
    approvals = (
        Approval.objects.select_related(
            "applicant",
            "applicant__background_info",
            "applicant__background_info__barangay",
            "applicant__background_info__barangay__city",
            "approved_by",
        )
    )

    try:
        approvals = apply_approval_filters(approvals, request)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    data = [
        {
            "id": a.id,
            "first_name": a.applicant.background_info.first_name,
            "last_name": a.applicant.background_info.last_name,
            "barangay": a.applicant.background_info.barangay.name,
            "municipal": a.applicant.background_info.barangay.city.name,
            "type_of_assistance": a.applicant.type_of_assistance,
            "amount": a.notes,  # stored in notes for now
            "approved_at": a.approved_at.isoformat(),
            "approved_by": a.approved_by.username if a.approved_by else "System",
        }
        for a in approvals
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
        "approved_by",
    )

    try:
        approvals = apply_approval_filters(approvals, request)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    paginated_queryset = paginator.paginate_queryset(approvals, request)
    data = [
        {
            "id": a.id,
            "first_name": a.applicant.background_info.first_name,
            "last_name": a.applicant.background_info.last_name,
            "barangay": a.applicant.background_info.barangay.name,
            "municipal": a.applicant.background_info.barangay.city.name,
            "type_of_assistance": a.applicant.type_of_assistance,
            "amount": a.notes,
            "approved_at": a.approved_at.isoformat(),
            "approved_by": a.approved_by.username if a.approved_by else "System",
        }
        for a in paginated_queryset
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
    
from django.utils import timezone
from datetime import datetime, timedelta
from django.http import StreamingHttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import csv

class Echo:
    """An object that implements just the write method of the file-like interface."""
    def write(self, value):
        return value


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_applicants_csv(request):
    """
    Export filtered applicant data as a CSV file.
    Now supports multiple filters (cities, barangays, assistance types).
    """
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")

    # Accept multiple filter values (from query string)
    cities = request.GET.getlist("cities")
    barangays = request.GET.getlist("barangays")
    assistance_types = request.GET.getlist("assistance_types")

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

    # 🏙 City filtering
    if cities:
        qs = qs.filter(background_info__barangay__city__name__in=cities)

    # 🏘 Barangay filtering
    if barangays:
        qs = qs.filter(background_info__barangay__name__in=barangays)

    # 🎯 Assistance types filtering (case-insensitive)
    if assistance_types:
        qs = qs.filter(type_of_assistance__in=assistance_types)

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

    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)

    def row_generator():
        # Header first
        yield writer.writerow(header)

        # Stream data rows
        for app in qs:
            bg = app.background_info
            rep = getattr(app, "representative", None)
            rep_bg = getattr(rep, "background_info", None) if rep else None

            yield writer.writerow([
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
            ])

    response = StreamingHttpResponse(row_generator(), content_type="text/csv")
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
    


        response_data = serializer.data
        response_data["application_history"] = get_applicant_history(applicant.background_info)

        return Response(response_data)

    elif request.method == 'PUT':
        serializer = ApplicantSerializer(applicant, data=request.data, context={"request": request})
        
        if serializer.is_valid():
            serializer.save()

            # 🔥 Reload object to refresh nested relations
            applicant.refresh_from_db()
            if applicant.background_info:
                applicant.background_info.refresh_from_db()
            if applicant.representative:
                applicant.representative.refresh_from_db()
            if applicant.representative and applicant.representative.background_info:
                applicant.representative.background_info.refresh_from_db()

            log_staff_activity(
                request.user,
                "UPDATE",
                f"Updated application for {applicant.background_info.first_name} {applicant.background_info.last_name}",
                request
            )

            # 🔥 Re-serialize fresh object
            fresh = ApplicantSerializer(applicant, context={"request": request})
            return Response(fresh.data)

        return Response(serializer.errors, status=400)
     


    elif request.method == 'DELETE':
        applicant.is_archived = True
        applicant.save(update_fields=["is_archived"])

        applicant.refresh_from_db()

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

    applicants_qs = (
        Applicant.objects.filter(is_archived=True)
        .select_related(
            "background_info",
            "background_info__barangay",
            "background_info__barangay__city",
        )
        .prefetch_related("background_info__histories")
    )

    try:
        applicants_qs = apply_applicant_filters(applicants_qs, request)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    paginated_query = paginator.paginate_queryset(applicants_qs, request)
    serializer = ApplicantSerializer(paginated_query, many=True, context={"request": request})
    data = serializer.data

    for idx, applicant in enumerate(paginated_query):
        data[idx]["application_history"] = get_applicant_history(applicant.background_info)

    return paginator.get_paginated_response(data)

# RESTORE ARCHIVED APPLICANT
# Function to restore an archived applicant
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def restore_archived_applicant(request, pk):
    try:
        applicant = get_object_or_404(Applicant.objects.select_related("background_info"), pk=pk)

        if not applicant.is_archived:
            return Response(
                {"message": "Applicant is already active."},
                status=400
            )
    
        applicant.is_archived = False
        applicant.save(update_fields=["is_archived"])
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
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_applicant_locations(request):
    """
    Optimized endpoint for retrieving applicant locations with clustering support.
    Uses Django cache to minimize database hits.
    """
    
    # Get filter parameters (used for cache key)
    type_filter = request.GET.get("type", "")
    city_filter = request.GET.get("city", "")
    barangay_filter = request.GET.get("barangay", "")
    
    # Get limit with protection
    try:
        limit = int(request.GET.get("limit", 2000))
        if limit > 2000:  # Protect server from excessive requests
            limit = 2000
    except ValueError:
        limit = 2000

    # Create cache key based on filters
    cache_key = f"applicant_locations_{type_filter}_{city_filter}_{barangay_filter}_{limit}"
    
    # Try to get from cache first
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return JsonResponse(cached_data, safe=False)

    # Query database if not in cache
    applicants = Applicant.objects.exclude(
        latitude__isnull=True, 
        longitude__isnull=True
    ).select_related(
        'background_info',
        'background_info__barangay',
        'background_info__barangay__city'
    ).filter(
        is_archived=False
    )

    # Apply filters
    if type_filter:
        applicants = applicants.filter(type_of_assistance=type_filter)
    if city_filter:
        applicants = applicants.filter(background_info__barangay__city__name=city_filter)
    if barangay_filter:
        applicants = applicants.filter(background_info__barangay__name=barangay_filter)

    # Order and limit
    applicants = applicants.order_by("-date_filled")[:limit]

    # Build response data
    data = [
        {
            "id": app.id,
            "full_name": f"{app.background_info.first_name} {app.background_info.last_name}",
            "latitude": float(app.latitude),
            "longitude": float(app.longitude),
            "address": f"{app.background_info.street_address}, "
                       f"{app.background_info.barangay.name}, "
                       f"{app.background_info.barangay.city.name}",
            "type_of_assistance": app.type_of_assistance,
            "barangay": app.background_info.barangay.name,
            "city": app.background_info.barangay.city.name,
        }
        for app in applicants
    ]

    # Cache for 15 minutes
    cache.set(cache_key, data, 60 * 15)

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
    base_qs = Applicant.objects.filter(is_archived=False)
    total_applicants = base_qs.count()

    avg_processing_time = base_qs.exclude(
        created_at__isnull=True, date_filled__isnull=True
    ).aggregate(
        avg_time=Avg(ExpressionWrapper(
            F('date_filled') - F('created_at'),
            output_field=DurationField()
        ))
    )['avg_time']

    avg_minutes = round(avg_processing_time.total_seconds() / 60, 1) if avg_processing_time else 0

    most_common_type = base_qs.values('type_of_assistance').annotate(
        count=Count('id')
    ).order_by('-count').first()

    highest_barangay = base_qs.values('background_info__barangay__name').annotate(
        count=Count('id')
    ).order_by('-count').first()

    data = {
        "totalApplicants": total_applicants,
        "averageProcessingTime": avg_minutes,
        "mostCommonType": (
            most_common_type["type_of_assistance"]
            if most_common_type
            else "N/A"
        ),
        "highestBarangay": (
            highest_barangay["background_info__barangay__name"]
            if highest_barangay
            else "N/A"
        ),
    }

    return Response(data)


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

    data = {
        'daily': applicants.filter(date_filled__date=today).count(),
        'weekly': applicants.filter(date_filled__date__gte=start_of_week).count(),
        'monthly': applicants.filter(date_filled__date__gte=start_of_month).count()
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicant_growth_rate(request):
    """
    📊 Dashboard: Applicant Growth Rate
    - Compares this month vs previous month (% growth)
    - Uses exact month boundaries, not just last 30 days
    """
    today = timezone.localdate()
    start_of_this_month = today.replace(day=1)
    start_of_last_month = (start_of_this_month - timedelta(days=1)).replace(day=1)
    end_of_last_month = start_of_this_month - timedelta(days=1)

    base_qs = Applicant.objects.filter(is_archived=False)

    # ✅ Applicants this month and previous month
    this_month_count = base_qs.filter(date_filled__date__gte=start_of_this_month).count()
    previous_month_count = base_qs.filter(
        date_filled__date__range=[start_of_last_month, end_of_last_month]
    ).count()

    # ✅ Compute growth rate safely
    growth_rate = (
        ((this_month_count - previous_month_count) / previous_month_count * 100)
        if previous_month_count > 0
        else 0
    )

    return Response({
        "this_month": this_month_count,
        "previous_month": previous_month_count,
        "growth_rate": round(growth_rate, 2)
    })


@api_view(["GET"])
def applicant_forecast(request):
    today = now().date()
    start_date = today.replace(day=1)

    daily_data = (
        Applicant.objects.filter(date_filled__date__gte=start_date)
        .extra(select={'day': "date(date_filled)"})
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )


    days = []
    counts = []

    for row in daily_data:
        days.append(row["day"])
        counts.append(row["count"])

    # Safety
    if len(counts) < 2:
        return Response({
            "historical": {"dates": [], "counts": []},
            "forecast": {"dates": [], "counts": [], "upper": [], "lower": []},
        })

    # 1. Smooth the data (moving average)
    smooth = []
    for i in range(len(counts)):
        window = counts[max(0, i-2):i+1]
        smooth.append(int(sum(window)/len(window)))

    # 2. Linear regression on smoothed data
    x = np.arange(len(smooth))
    y = np.array(smooth)
    slope, intercept = np.polyfit(x, y, 1)

    # 3. Forecast next 7 days
    preds = []
    for i in range(1, 8):
        pred = slope * (len(smooth) + i) + intercept
        preds.append(max(int(pred), 0))

    # Confidence bounds ±20%
    upper = [int(p * 1.2) for p in preds]
    lower = [max(int(p * 0.8), 0) for p in preds]

    # Forecast dates
    forecast_dates = [(today + timedelta(days=i)).isoformat() for i in range(1, 8)]

    data = {
        "historical": {
            "dates": [d.isoformat() for d in days],
            "counts": counts,
        },
        "forecast": {
            "dates": forecast_dates,
            "counts": preds,
            "upper": upper,
            "lower": lower,
        }
    }


    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def repeat_applicants(request):
    """
    📊 Dashboard: Repeat applicants
    - Count of applicants who submitted multiple applications
    """
    annotated_qs = BackgroundInfo.objects.annotate(app_count=Count("applicant"))
    repeat_count = annotated_qs.filter(app_count__gt=1).count()
    total_applicants = annotated_qs.count()

    repeat_percentage = (
        round((repeat_count / total_applicants) * 100, 2)
        if total_applicants > 0
        else 0
    )

    data = {
        "repeat_applicants": repeat_count,
        "total_applicants": total_applicants,
        "repeat_percentage": repeat_percentage
    }

    return Response(data)


# ======================================================
# 2. 🌍 GEOGRAPHIC INSIGHTS
# ======================================================


def apply_common_filters(request, queryset):
    """Apply shared analytics filters: date range, assistance type, city, barangay"""
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    assistance_type = request.GET.get("type")
    city = request.GET.get("city")
    barangay = request.GET.get("barangay")

    if start_date and end_date:
        queryset = queryset.filter(date_filled__date__range=[start_date, end_date])
    if assistance_type:
        queryset = queryset.filter(type_of_assistance__iexact=assistance_type)
    if city:
        queryset = queryset.filter(background_info__barangay__city__name__iexact=city)
    if barangay:
        queryset = queryset.filter(background_info__barangay__name__iexact=barangay)

    return queryset


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_applicant_locations(request):
    """
    🌍 Geographic: Applicant locations
    - Returns lat/lon + address for mapping
    - Filters: type, city, barangay
    """
    applicants = Applicant.objects.select_related(
        "background_info",
        "background_info__barangay",
        'background_info__barangay__city').exclude(
        latitude__isnull=True, longitude__isnull=True
    ).filter(is_archived=False)

    applicants = apply_common_filters(request, applicants)

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
    base_qs = Applicant.objects.select_related(
        "barangay_info",
        "barangay_info__barangay",
        "barangay_info__barangay__city",
    ).filter(is_archived=False)

    base_qs = apply_common_filters(request, base_qs)

    data = base_qs.values('background_info__barangay__name').annotate(count=Count('id')).order_by('-count')[:10]
    return Response(list(data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def barangay_by_type(request):
    """
    Geographic: Applications by barangay & assistance type
    """
    qs = Applicant.objects.filter(is_archived=False).select_related(
        "background_info",
        "background_info__barangay",
        "background_info__barangay__city"
    )

    qs = apply_common_filters(request, qs)

    # ✅ Group by barangay and assistance type
    data = (
        qs.values("background_info__barangay__name", "type_of_assistance")
        .annotate(count=Count("id"))
        .exclude(background_info__barangay__name__isnull=True)
        .order_by("-count")
    )

    # ✅ Format output for readability
    response_data = [
        {
            "barangay": d["background_info__barangay__name"],
            "type_of_assistance": d["type_of_assistance"],
            "count": d["count"]
        }
        for d in data
    ]

    return Response(response_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approval_rate_by_location(request):
    """
    🌍 Geographic: Approval rates by location
    - Grouped by province/city/barangay (configurable via ?group=)
    """
    valid_groups = {
        "province": "background_info__barangay__city__province__name",
        "city": "background_info__barangay__city__name",
        "barangay": "background_info__barangay__name",
    }

    group_field = valid_groups.get(request.GET.get("group", "city"))
    qs = Applicant.objects.filter(is_archived=False)
    qs = apply_common_filters(request, qs)

    qs = (
        Applicant.objects
        .values(group_field)
        .annotate(
            total=Count("id"),
            approved=Count("id", filter=Q(approvals__isnull=False))
        )
        .order_by("-total")
    )

    data = [
        {
            "location": item[group_field] or "Unknown",
            "total": item["total"],
            "approved": item["approved"],
            "approval_rate": round((item["approved"] / item["total"] * 100), 2) if item["total"] > 0 else 0,
        }
        for item in qs
    ]

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inactive_applicants(request):
    """
    🌍 Geographic: Inactive applicants
    - Applicants with no new applications in X months (default=6)
    """
    months = int(request.GET.get("months", 6))
    assistance_type = request.GET.get("assistance_type")
    city = request.GET.get("city")
    barangay = request.GET.get("barangay")
    cutoff = now() - timedelta(days=30 * months)

    # Annotate latest application date for each person
    inactive_qs = (
        BackgroundInfo.objects.annotate(last_app=Max("applicant__date_filled"))
        .filter(Q(last_app__lt=cutoff), applicant__isnull=False)
        .select_related()  # lightweight optimization
        .order_by("last_app")
    )

    if assistance_type:
        inactive_qs = inactive_qs.filter(applicant__type_of_assistance__iexact=assistance_type)
    if city:
        inactive_qs = inactive_qs.filter(applicant__background_info__barangay__city__name__iexact=city)
    if barangay:
        inactive_qs = inactive_qs.filter(applicant__background_info__barangay__name__iexact=barangay)

    data = []
    for b in inactive_qs:
        last_applicant = (
            b.applicant_set.order_by("-date_filled").first()
        )  # Access reverse relation safely

        data.append({
            "id": b.id,
            "name": f"{b.first_name} {b.last_name}",
            "last_application": (
                last_applicant.date_filled.isoformat()
                if last_applicant and last_applicant.date_filled
                else None
            ),
        })

    return Response(data)


# ======================================================
# 3. 👥 DEMOGRAPHICS & ECONOMICS
# ======================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_gender(request):
    """👥 Demographics: Applicants by gender"""
    applicants = Applicant.objects.filter(is_archived=False)\
        .values(
            "background_info__sex"
        ).annotate(count=Count("id")).order_by("count")
    applicants = apply_common_filters(request, applicants)
    
    print(applicants)
    return Response(list(applicants))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_civil_status(request):
    """👥 Demographics: Applicants by civil status"""
    applicants = Applicant.objects.filter(is_archived=False)
    applicants = apply_common_filters(request, applicants)

    data = applicants.values("background_info__civil_status")\
        .annotate(count=Count("id"))\
        .order_by("background_info__civil_status")

    return Response(list(data))



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicants_by_age_group(request):
    """👥 Demographics: Applicants by age groups (0–17, 18–25, … 60+)"""
    today = date.today()
    qs = Applicant.objects.filter(is_archived=False)
    qs = apply_common_filters(request, qs)

    qs = qs.annotate(
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

    data = [
            {
                "age_group": group, "count": count
            } 
            for group, count in age_groups.items()
        ]
    return Response(data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicants_by_occupation(request):
    data = (
        Applicant.objects.values("background_info__occupation")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    data = apply_common_filters(request, data)

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
    today = date.today()
    qs = Applicant.objects.filter(is_archived=False)
    qs = apply_common_filters(request, qs)
    qs = qs.annotate(
        age=ExpressionWrapper(
            today.year - ExtractYear("background_info__birthday"), 
            output_field=IntegerField()
        )
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

    applicants = Applicant.objects.filter(is_archived=False)
    applicants = applicants.exclude(background_info__monthly_income=0)

    applicants = apply_common_filters(request, applicants)

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
            count = applicants.filter(background_info__monthly_income__gte=min_income).count()
        else:
            count = applicants.filter(
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

    qs = apply_common_filters(request, qs)

    data = qs.annotate(
        month=TruncMonth("date_filled")
    ).values("month").annotate(count=Count("id")).order_by("month")

    return Response(list(data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def yearly_trends(request):
    """
    📈 Trends: Applicants by year
    """
    qs = Applicant.objects.filter(is_archived=False)
    qs = apply_common_filters(request, qs)
    
    qs = qs.annotate(
        year=ExtractYear("date_filled")
    ).values("year").annotate(count=Count("id")).order_by("year")
    
    
    return Response(list(qs))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trends_over_time(request):
    """
    📈 Trends: Applicants over time (daily granularity, configurable start/end)
    """

    qs = Applicant.objects.filter(is_archived=False)
    qs = apply_common_filters(request, qs)

    data = qs.annotate(day=TruncDate("date_filled")).values("day").annotate(count=Count("id")).order_by("day")
    return Response(list(data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cumulative_applicants(request):
    """
    📈 Trends: Cumulative applicants over time
    """
    qs = Applicant.objects.annotate(
        day=TruncDate("date_filled")
    ).values("day").annotate(count=Count("id")).order_by("day")

    qs = apply_common_filters(request, qs)

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

    qs = Applicant.objects.filter(is_archived=False)
    qs = apply_common_filters(request, qs)

    qs = qs.values("type_of_assistance").annotate(count=Count("id")).order_by("-count")
    return Response(list(qs))
    
@api_view(["GET"])
def assistance_type_linetrend(request):
    today = now().date()
    start_date = today.replace(day=1)

    queryset = Applicant.objects.filter(date_filled__date__gte=start_date)

    days = (today - start_date).days + 1
    labels = [(start_date + timedelta(days=i)).isoformat() for i in range(days)]

    medical = [0] * days
    educational = [0] * days
    burial = [0] * days

    for app in queryset:
        idx = (app.date_filled.date() - start_date).days
        if idx >= 0 and idx < days:
            t = app.type_of_assistance.lower()
            if "medical" in t:
                medical[idx] += 1
            elif "educational" in t:
                educational[idx] += 1
            elif "burial" in t:
                burial[idx] += 1
                
    data = {
        "labels": labels,
        "medical": medical,
        "educational": educational,
        "burial": burial
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assistance_type_over_time(request):
    """
    📈 Trends: Assistance types over time (monthly stacked)
    """

    qs = Applicant.objects.filter(is_archived=False)
    qs = apply_common_filters(request, qs)

    qs = qs.annotate(
        month=TruncMonth("date_filled")
    ).values("month", "type_of_assistance").annotate(count=Count("id")).order_by("month")

    return Response(list(qs))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approval_trends(request):
    """
    📈 Trends: Approval counts over time (monthly)
    """
    qs = Applicant.objects.filter(is_archive=False)
    qs = apply_common_filters(request, qs)

    qs = Applicant.objects.filter(approvals__isnull=False).annotate(
        month=TruncMonth("date_filled")
    ).values("month").annotate(count=Count("id")).order_by("month")

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
    qs = apply_common_filters(request, qs)

    avg_time = qs.aggregate(avg=Avg("duration"))["avg"]
    avg_days = round(avg_time.total_seconds() / 86400, 1) if avg_time else 0
    return Response({"average_days_to_approval": avg_days})

# Applicants Activity Heatmap (by hour of day)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicant_activity_heatmap(request):

    qs = Applicant.objects.annotate(
        hour=ExtractHour("date_filled")
    ).values("hour").annotate(count=Count("id")).order_by("hour")

    qs = apply_common_filters(request, qs)

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

    qs = apply_common_filters(request, qs)

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

    qs = apply_common_filters(request, qs)

    data = qs.values("type_of_assistance").annotate(
        avg_time=Avg("duration")
    ).order_by("type_of_assistance")
    

    results = [
            {
            "type": row["type_of_assistance"],
            "avg_minutes": round(row["avg_time"].total_seconds() / 60, 1) if row["avg_time"] else 0
        } 
        for row in data
    ]

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

    qs = apply_common_filters(request, qs)

    buckets = {
        "< 1 min": qs.filter(duration__lte=timedelta(minutes=1)).count(),
        "1 - 3 mins": qs.filter(duration__gt=timedelta(minutes=1), duration__lte=timedelta(minutes=3)).count(),
        "3 - 5 mins": qs.filter(duration__gt=timedelta(minutes=3), duration__lte=timedelta(minutes=5)).count(),
        "5 - 10 mins": qs.filter(duration__gt=timedelta(minutes=5), duration__lte=timedelta(minutes=10)).count(),
        "10+ mins": qs.filter(duration__gt=timedelta(minutes=10)).count(),
    }

    data = [
        {
            "bucket": k,
            "count": v
        }
        for k, v in buckets.items()
    ]

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_productivity(request):
    """
    ⚡ Performance: Applicants processed per staff member
    """

    qs = Applicant.objects.filter(is_archived=False)
    qs = apply_common_filters(request, qs)

    qs = qs.values("staff__username").annotate(count=Count("id")).order_by("-count")
    return Response(list(qs))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_leaderboard(request):
    """
    ⚡ Performance: Staff ranked by number of processed applications
    """
    qs = Applicant.objects.filter(is_archived=False)
    qs = apply_common_filters(request, qs)

    qs = qs.values("staff__username").annotate(count=Count("id")).order_by("-count")[:10]
    return Response(list(qs))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_activity_logs(request):
    """
    ⚡ Performance: Staff activity logs (timeline of actions)
    """


    logs = StaffActivityLog.objects.select_related("staff").order_by("-timestamp")
    logs = apply_common_filters(request, logs)

    staff_filter = request.GET.get("staff")
    action_filter = request.GET.get("action")

    if staff_filter:
        logs = logs.filter(staff__username__icontains=staff_filter)
    if action_filter:
        logs = logs.filter(action__icontains=action_filter)

    logs = logs[:100]  # limit for performance

    data = [
        {
            "id": log.id,
            "staff": log.staff.username if log.staff else "Unknown",
            "action": log.action,
            "timestamp": log.timestamp,
            "formatted_time": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for log in logs
    ]

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_activity_heatmap(request):
    """
    ⚡ Performance: Staff activity heatmap (hourly distribution)
    """

    qs = StaffActivityLog.objects.all()
    qs = apply_common_filters(request, qs)

    staff_filter = request.GET.get("staff")
    if staff_filter:
        qs = qs.filter(staff__username__icontains=staff_filter)

    qs = qs.annotate(hour=ExtractHour("timestamp"))\
           .values("hour")\
           .annotate(count=Count("id"))\
           .order_by("hour")

    return Response(list(qs))


# =============================================
# HELPER FUNCTIONS
# =============================================

# LOG STAFF ACTIVITY
# Helper function to log staff activities (with IP tracking and error safety)
def log_staff_activity(staff, action, details=None, request=None):
    """
    🧾 Logs a staff member's activity for auditing and analytics.
    
    Args:
        staff (User): The staff user performing the action.
        action (str): A short description (e.g., "Approved Applicant #123").
        details (dict | str, optional): Extra contextual info (e.g., applicant data).
        request (HttpRequest, optional): Used to capture IP address.
    """
    try:
        # --- Determine the client IP ---
        ip_address = None
        if request:
            # Respect proxy headers if using Nginx / Cloudflare / etc.
            ip_address = (
                request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0]
                or request.META.get('REMOTE_ADDR')
            )

        # --- Convert dict details to string for storage ---
        if isinstance(details, dict):
            details = json.dumps(details, ensure_ascii=False, indent=2)

        # --- Create the activity log record ---
        StaffActivityLog.objects.create(
            staff=staff,
            action=action,
            details=details,
            ip_address=ip_address
        )

    except Exception as e:
        print(f"[ActivityLog Error] Failed to log staff activity: {e}")


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_admin(request):
    """
    Staff can send a message to admin if they can't log in.
    Stores in DB for admins to view later.
    """
    name = request.data.get("name")
    email = request.data.get("email")
    message = request.data.get("message")

    if not all([name, email, message]):
        return Response({"error": "All fields are required."}, status=400)

    SupportMessage.objects.create(name=name, email=email, message=message)
    return Response({"message": "Your message has been sent to the admin."}, status=200)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_support_messages(request):
    """
    Admin view for all staff support messages.
    Optional filters: ?resolved=true&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """
    messages = SupportMessage.objects.all().order_by("-created_at")
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    resolved = request.GET.get("resolved")

    if start_date and end_date:
        messages = messages.filter(created_at__date__range=[start_date, end_date])
    if resolved == "true":
        messages = messages.filter(is_resolved=True)
    elif resolved == "false":
        messages = messages.filter(is_resolved=False)

    data = [
        {
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "message": m.message,
            "created_at": m.created_at.strftime("%Y-%m-%d %H:%M"),
            "is_resolved": m.is_resolved,
        }
        for m in messages
    ]
    return Response(data)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def resolve_support_message(request, message_id):
    """
    Marks a staff support message as resolved.
    """
    try:
        message = SupportMessage.objects.get(id=message_id)
        message.is_resolved = True
        message.save()
        return Response({"message": "Message marked as resolved."}, status=200)
    except SupportMessage.DoesNotExist:
        return Response({"error": "Message not found."}, status=404)


# ✅ Returns only available cities and barangays that have applicants
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_location_filters(request):
    city_filter = request.GET.get("city")

    # Start from active (non-archived) applicants
    applicants = Applicant.objects.select_related(
        'background_info__barangay__city'
    ).filter(is_archived=False)

    # ✅ If no city is selected, return all cities that have applicants
    if not city_filter:
        cities = (
            applicants.values_list("background_info__barangay__city__name", flat=True)
            .distinct()
            .order_by("background_info__barangay__city__name")
        )
        return JsonResponse({"cities": list(cities)}, safe=False)

    # ✅ Otherwise, return barangays only within that city
    barangays = (
        applicants.filter(background_info__barangay__city__name=city_filter)
        .values_list("background_info__barangay__name", flat=True)
        .distinct()
        .order_by("background_info__barangay__name")
    )
    return JsonResponse({"barangays": list(barangays)}, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_analytics_report(request):
    """
    Export analytics report in PDF, Excel, or both formats (in-memory)
    Returns base64-encoded files directly in the response

    REQUEST BODY: 
    {
        "format": "both", // "pdf" | "excel" | "both"
        "filters": {
            "start_date": "2025-01-01",
            "end_date": "2025-11-01",
            "cities": ["Lucena"],
            "barangays": ["Brgy 1"],
            "assistance_types": ["Medical"]
        },
        "branding": {
            "organization_name": "DSWD Quezon Province",
            "primary_color": "#0066cc"
        }
    }

    """
    try:
        # Parse request data
        format_type = request.data.get('format', 'both')
        filters = request.data.get('filters', {})
        branding = request.data.get('branding', {})

        # Validate format
        if format_type not in ['pdf', 'excel', 'both']:
            return Response(
                {"error": "Invalid format. Choose 'pdf', 'excel', or 'both'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate date range
        start_date = filters.get('start_date')
        end_date = filters.get('end_date')
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d')
                end = datetime.strptime(end_date, '%Y-%m-%d')
                if start > end:
                    return Response(
                        {"error": "Start date must be before end date"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Add branding to filters
        filters['branding'] = branding

        # Generate report in-memory (returns base64 files)
        orchestrator = ExportOrchestrator(filters, request.user, format_type)
        result = orchestrator.generate_report()

        if not result['success']:
            return Response(
                {
                    "success": False,
                    "error": result.get('error', 'Unknown error occurred'),
                    "traceback": result.get('traceback', '')
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Log export activity
        log_staff_activity(
            request.user,
            'EXPORT_ANALYTICS',
            f"Exported analytics report ({format_type}) for period "
            f"{filters.get('start_date', 'All')} to {filters.get('end_date', 'All')}",
            request
        )

        # Return JSON with metadata + base64 files (already encoded by ExportOrchestrator)
        return Response({
            'success': True,
            'files': result['files'],  # Already contains base64
            'metadata': result['metadata']
        }, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        return Response(
            {
                "success": False,
                "error": f"Failed to generate report: {str(e)}",
                "traceback": traceback.format_exc()
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_history(request):
    """
    Get history of exported analytics reports
    Returns list of previous exports by the user or all (if admin)
    """
    try:
        user = request.user
        
        # Get export activity logs
        if user.is_superuser:
            logs = StaffActivityLog.objects.filter(
                action='EXPORT_ANALYTICS'
            ).select_related('staff').order_by('-timestamp')[:50]
        else:
            logs = StaffActivityLog.objects.filter(
                staff=user,
                action='EXPORT_ANALYTICS'
            ).order_by('-timestamp')[:50]
        
        data = [
            {
                'id': log.id,
                'exported_by': f"{log.staff.first_name} {log.staff.last_name}",
                'username': log.staff.username,
                'details': log.details,
                'timestamp': log.timestamp.isoformat(),
                'formatted_time': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            }
            for log in logs
        ]
        
        return Response(data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": f"Failed to fetch export history: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_filters(request):
    """
    Returns:
    - All cities
    - Barangays limited to the selected city (if provided)
    - Assistance types
    """
    try:
        applicants = Applicant.objects.filter(is_archived=False)

        # Get distinct cities
        cities = list(
            applicants.values_list(
                'background_info__barangay__city__name', flat=True
            ).distinct().order_by('background_info__barangay__city__name')
        )

        # If city is selected, filter barangays by that city
        selected_city = request.GET.get('city')

        if selected_city:
            barangays = list(
                applicants.filter(
                    background_info__barangay__city__name=selected_city
                ).values_list(
                    'background_info__barangay__name', flat=True
                ).distinct().order_by('background_info__barangay__name')
            )
        else:
            barangays = []  # Do not return barangays until a city is chosen

        # Assistance types (unchanged)
        assistance_types = list(
            applicants.values_list('type_of_assistance', flat=True)
            .distinct()
            .order_by('type_of_assistance')
        )

        # Date range
        date_range = applicants.aggregate(
            earliest=Min('date_filled'),
            latest=Max('date_filled')
        )

        return Response({
            'cities': [c for c in cities if c],
            'barangays': [b for b in barangays if b],
            'assistance_types': [a for a in assistance_types if a],
            'date_range': {
                'earliest': date_range['earliest'].date().isoformat() if date_range['earliest'] else None,
                'latest': date_range['latest'].date().isoformat() if date_range['latest'] else None
            }
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)

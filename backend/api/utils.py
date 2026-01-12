import qrcode
import re
import os
import json
from dotenv import load_dotenv
from .models import ApplicantHistory, StaffActivityLog, DisbursementClaim, DisbursementBatch
from django.db.models import Q, Sum
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation


load_dotenv()


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


def generate_qr_for_staff(staff, domain=os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')):
    url = f"{domain}/new-applicant?staff_ref_code={staff.ref_code}"
    img = qrcode.make(url)
    filename = f"{staff.username}_qr.png"
    img.save(filename)
    return filename, url


def get_applicant_history(background_info):
    """
    Returns a list of application history entries for a given applicant's background_info.
    Optimized with select_related to minimize DB queries.
    """
    history_qs = (
        ApplicantHistory.objects
        .filter(background_info=background_info)
        .select_related("applicant")
        .order_by("-date_applied")
    )

    return [
        {
            "id": h.id,
            "type_of_assistance": h.type_of_assistance,
            "applicant_id": h.applicant.id if h.applicant else None,
            "date": h.date_applied,
        }
        for h in history_qs
    ]


def apply_applicant_filters(queryset, request):
    """
    Reusable filter helper for applicant list endpoints.
    Supports:
      - search (name, barangay, city, type)
      - type_of_assistance
      - city
      - barangay
      - date range (start_date, end_date)
      - ordering
    """

    search = request.GET.get('search', '')
    ordering = request.GET.get('ordering', '-date_filled')
    type_filter = request.GET.get('type')
    city_filter = request.GET.get('city')
    barangay_filter = request.GET.get('barangay')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    # 🔍 Text search
    if search:
        queryset = queryset.filter(
            Q(background_info__first_name__icontains=search) |
            Q(background_info__last_name__icontains=search) |
            Q(background_info__barangay__name__icontains=search) |
            Q(background_info__barangay__city__name__icontains=search) |
            Q(type_of_assistance__icontains=search)
        )

    # 🎯 Assistance type
    if type_filter:
        queryset = queryset.filter(type_of_assistance__iexact=type_filter)

    # 🏙️ City filter
    if city_filter:
        queryset = queryset.filter(background_info__barangay__city__name__iexact=city_filter)

    # 🏘️ Barangay filter
    if barangay_filter:
        queryset = queryset.filter(background_info__barangay__name__iexact=barangay_filter)

    # 📅 Date range filter
    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            queryset = queryset.filter(date_filled__range=[start, end])
        except ValueError:
            raise ValueError("Invalid date format. Use YYYY-MM-DD.")

    # 🧾 Ordering
    if ordering:
        queryset = queryset.order_by(ordering)

    return queryset


def apply_approval_filters(queryset, request):
    """
    Reusable filter for approval- or batch-related endpoints.
    Supports:
      - search (applicant name, barangay, city, type)
      - type_of_assistance
      - city / barangay
      - approved_by
      - date range (start_date, end_date)
      - ordering
    """

    search = request.GET.get('search', '')
    ordering = request.GET.get('ordering', '-approved_at')
    type_filter = request.GET.get('type')
    city_filter = request.GET.get('city')
    barangay_filter = request.GET.get('barangay')
    approver_filter = request.GET.get('approved_by')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    # 🔍 Text search
    if search:
        queryset = queryset.filter(
            Q(applicant__background_info__first_name__icontains=search) |
            Q(applicant__background_info__last_name__icontains=search) |
            Q(applicant__background_info__barangay__name__icontains=search) |
            Q(applicant__background_info__barangay__city__name__icontains=search) |
            Q(applicant__type_of_assistance__icontains=search)
        )

    # 🎯 Filter by assistance type
    if type_filter:
        queryset = queryset.filter(applicant__type_of_assistance__iexact=type_filter)

    # 🏙️ City filter
    if city_filter:
        queryset = queryset.filter(applicant__background_info__barangay__city__name__iexact=city_filter)

    # 🏘️ Barangay filter
    if barangay_filter:
        queryset = queryset.filter(applicant__background_info__barangay__name__iexact=barangay_filter)

    # 👤 Approver filter
    if approver_filter:
        queryset = queryset.filter(approved_by__username__icontains=approver_filter)

    # 📅 Date range filter
    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            queryset = queryset.filter(approved_at__range=[start, end])
        except ValueError:
            raise ValueError("Invalid date format. Use YYYY-MM-DD.")

    # 🧾 Ordering
    if ordering:
        queryset = queryset.order_by(ordering)

    return queryset

def extract_amount_from_notes(notes):
    """Extract amount from 'Approved amount: 5000' format"""
    if not notes:
        return Decimal('0.00')
    
    match = re.search(r'[\d,]+\.?\d*', notes)
    if match:
        amount_str = match.group().replace(',', '')
        try:
            return Decimal(amount_str)
        except InvalidOperation:
            return Decimal('0.00')
    return Decimal('0.00')


def base_disbursement_qs():
    """Base queryset for all disbursement claims with relationships"""
    return (
        DisbursementClaim.objects
        .select_related(
            "approval",
            "approval__applicant",
            "approval__applicant__background_info",
            "approval__applicant__background_info__barangay",
            "approval__applicant__background_info__barangay__city",
            "approval__batch",
            "batch",
        )
    )


def apply_budget_filters(qs, params):
    """Apply common filters to budget queries"""
    year = params.get("year")
    city = params.get("city")
    barangay = params.get("barangay")
    assistance = params.get("assistance")
    batch_id = params.get("batch_id")
    date_from = params.get("date_from")
    date_to = params.get("date_to")
    status = params.get("status")  # CLAIMED, PENDING, UNCLAIMED

    if year:
        qs = qs.filter(payout_date__year=year)

    if date_from:
        qs = qs.filter(payout_date__gte=date_from)

    if date_to:
        qs = qs.filter(payout_date__lte=date_to)

    if assistance:
        qs = qs.filter(approval__applicant__type_of_assistance=assistance)

    if city:
        qs = qs.filter(
            approval__applicant__background_info__barangay__city__name=city
        )

    if barangay:
        qs = qs.filter(
            approval__applicant__background_info__barangay__name=barangay
        )

    if batch_id:
        qs = qs.filter(batch_id=batch_id)

    if status:
        qs = qs.filter(status=status)

    return qs


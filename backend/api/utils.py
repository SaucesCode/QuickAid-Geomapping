import qrcode
import os
from dotenv import load_dotenv
from .models import ApplicantHistory
from django.db.models import Q
from datetime import datetime, timedelta

load_dotenv()


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
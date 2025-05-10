from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *



urlpatterns = [
    # Login: Obtain access and refresh tokens
    path("token/", MyTokenObtainView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Staff Registration (Only Admins Can Do This)
    path("register_staff/", register_staff, name="register_staff"),
    path("staff-list/", list_staff, name="staff_list"),
    path("delete-staff/<int:user_id>/", delete_staff, name="delete_staff"),
    path("update-staff/<int:staff_id>/", update_staff, name="update-staff"),

    path('applicants/', list_applicants, name='applicants'),
    path('applicants/<int:applicant_id>/', applicant_detail, name='applicant_detail'),
    path('update_coordinates/', update_coordinates, name='update_coordinates'),

    # Protected API Route (Only Authenticated Staff)
    path('protected/', protected_view, name='protected_view'),
    
    path('api/barangays/<str:cityOrMunicipalityCode>/', PSGCView().get_barangays, name='get_barangays'),
    path("submit-applicant/", submit_applicant, name="submit_applicant"),
    path('applicant-locations/', get_applicant_locations, name='applicant-locations'),

    #Analytics
    path('analytics/total-applicants/', total_applicants, name='total-applicants'),
    path('analytics/applicants-by-assistance-type/', applicants_by_assistance_type, name='applicants-by-assistance-type'),
    path('analytics/applicants-by-location/', applicants_by_location, name='applicants-by-location'),
    path('analytics/trends-over-time/', trends_over_time, name='trends-over-time'),
    path('analytics/average-processing-time/', average_processing_time, name='average-processing-time'),
    path('analytics/top-barangays/', top_barangays, name='top-barangays'),
    path('analytics/barangay-by-type/', barangay_by_type, name='barangay-by-type'),
    path('analytics/staff-activity/', staff_activity_logs, name='staff-activity'),
    path('analytics/assistance-type-trend/', assistance_type_trend, name='assistance-type-trend'),
    path('analytics/by-gender/', applicants_by_gender, name='analytics-by-gender'),
    path('analytics/by-civil-status/', applicants_by_civil_status, name='analytics-by-civil-status'),
    path('analytics/by-age-group/', applicants_by_age_group, name='analytics-by-age-group'),
]

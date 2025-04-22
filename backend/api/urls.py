from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *




urlpatterns = [
    # Login: Obtain access and refresh tokens
    path("token/", MyTokenObtainView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Staff Registration (Only Admins Can Do This)
    path('register_staff/', register_staff, name='register_staff'),

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
    path('analytics/staff-activity/', staff_activity_logs, name='staff-activity'),
]

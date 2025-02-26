from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *

urlpatterns = [
    # Login: Obtain access and refresh tokens
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Staff Registration (Only Admins Can Do This)
    path('register_staff/', register_staff, name='register_staff'),

    # Protected API Route (Only Authenticated Staff)
    path('protected/', protected_view, name='protected_view'),
    
    path("submit-applicant/", submit_applicant, name="submit_applicant"),
    path('applicant-locations/', get_applicant_locations, name='applicant-locations'),
]

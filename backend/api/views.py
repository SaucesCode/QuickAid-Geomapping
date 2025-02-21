from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import Applicant, CustomUser


# Register Staff (Only Admins Can Do This)
@api_view(['POST'])
@permission_classes([IsAdminUser])  # Only superusers can add staff
def register_staff(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    # Create staff user and set the role
    user = CustomUser.objects.create_user(username=username, password=password, is_staff=True, role='staff')
    
    return Response({"message": "Staff registered successfully"}, status=status.HTTP_201_CREATED)

# Protected route (for testing authentication)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": f"Hello, {request.user.username}! You are authenticated as {'Admin' if request.user.is_superuser else 'Staff'}."})

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Only logged-in staff can submit
def submit_applicant(request):
    staff = request.user  # Get the logged-in staff user
    full_name = request.data.get('full_name')
    contact_number = request.data.get('contact_number')
    address = request.data.get('address')

    if not full_name or not contact_number or not address:
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    applicant = Applicant.objects.create(
        staff=staff,
        full_name=full_name,
        contact_number=contact_number,
        address=address
    )

    return Response({"message": "Applicant saved successfully", "id": applicant.id}, status=status.HTTP_201_CREATED)
from django.contrib import admin
from django.contrib.auth.models import Group
from .models import Applicant, CustomUser, Representative

class ApplicantAdmin(admin.ModelAdmin):
    list_display = (
        "staff", "first_name", "last_name", 
        "barangay", "city_municipality", "province", 
        "type_of_assistance", "date_filled"
    )
    search_fields = ("first_name", "last_name", "barangay", "city_municipality", "province")
    list_filter = ("gender", "province", "city_municipality", "barangay", "type_of_assistance", "date_filled")
    ordering = ("-date_filled",)

    def get_queryset(self, request):
        """Restrict staff to only see their own applicants."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs  # Superusers see all records
        return qs.filter(staff=request.user)  # Staff only see their own entries

    def has_change_permission(self, request, obj=None):
        """Restrict staff from modifying others' applicants."""
        if obj is None:
            return True  # Allow listing
        return obj.staff == request.user or request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        """Restrict staff from deleting others' applicants."""
        if obj is None:
            return True
        return obj.staff == request.user or request.user.is_superuser
    
class RepresentativeAdmin(admin.ModelAdmin):
    list_display = (
        "applicant","first_name", "last_name", "relationship",
    )

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_active")
    search_fields = ("username", "email")
    list_filter = ("role", "is_staff", "is_active")

admin.site.register(Applicant, ApplicantAdmin)
admin.site.register(Representative, RepresentativeAdmin)
admin.site.register(CustomUser, CustomUserAdmin)

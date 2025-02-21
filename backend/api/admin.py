from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Applicant

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ('staff', 'full_name', 'contact_number', 'address', 'date_filled')
    search_fields = ('full_name', 'contact_number')
    list_filter = ('date_filled',)

admin.site.register(CustomUser, CustomUserAdmin)

admin.site.register(Applicant, ApplicantAdmin)

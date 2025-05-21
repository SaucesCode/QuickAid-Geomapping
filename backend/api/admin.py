from django.contrib import admin
from .models import Applicant, CustomUser, Representative, BackgroundInfo

#
class ApplicantAdmin(admin.ModelAdmin):
    list_display = (
        "id", "staff", "get_first_name", "get_last_name",
        "get_barangay", "get_city", "get_province",
        "type_of_assistance", "date_filled"
    )
    search_fields = (
        "background_info__first_name",
        "background_info__last_name",
        "background_info__barangay__name",
        "background_info__barangay__city__name",
        "background_info__barangay__city__province__name"
    )
    list_filter = (
        "background_info__sex",
        "background_info__barangay__city__province__name",
        "background_info__barangay__city__name",
        "background_info__barangay__name",
        "type_of_assistance",
        "date_filled"
    )
    ordering = ("-date_filled",)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("background_info", "background_info__barangay__city__province")

    def get_first_name(self, obj):
        return obj.background_info.first_name
    get_first_name.short_description = "First Name"

    def get_last_name(self, obj):
        return obj.background_info.last_name
    get_last_name.short_description = "Last Name"

    def get_barangay(self, obj):
        return obj.background_info.barangay.name
    get_barangay.short_description = "Barangay"

    def get_city(self, obj):
        return obj.background_info.barangay.city.name
    get_city.short_description = "City"

    def get_province(self, obj):
        return obj.background_info.barangay.city.province.name
    get_province.short_description = "Province"

    def has_change_permission(self, request, obj=None):
        if obj is None:
            return True
        return obj.staff == request.user or request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        if obj is None:
            return True
        return obj.staff == request.user or request.user.is_superuser

class RepresentativeAdmin(admin.ModelAdmin):
    list_display = (
        "applicant", "get_first_name", "get_last_name", "relationship",
    )

    def get_first_name(self, obj):
        return obj.background_info.first_name
    get_first_name.short_description = "First Name"

    def get_last_name(self, obj):
        return obj.background_info.last_name
    get_last_name.short_description = "Last Name"

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_active")
    search_fields = ("username", "email")
    list_filter = ("role", "is_superuser", "is_active")

admin.site.register(Applicant, ApplicantAdmin)
admin.site.register(Representative, RepresentativeAdmin)
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(BackgroundInfo)

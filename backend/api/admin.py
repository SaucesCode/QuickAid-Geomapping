from django.contrib import admin
from .models import (
    Applicant,
    CustomUser,
    Representative,
    BackgroundInfo,
    ApplicantHistory,
    StaffActivityLog,
    Approval,
    ApprovalBatch,
    SupportMessage
)

#
class ApplicantAdmin(admin.ModelAdmin):
    list_display = (
        "id", "staff", "get_first_name", "get_last_name",
        "get_barangay", "get_city", "get_province",
        "type_of_assistance", "date_filled", "created_at"
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


class ApplicantHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "background_info",
        "applicant",
        "type_of_assistance",
        "date_applied"
    )
    search_fields = (
        "background_info__first_name",
        "background_info__last_name",
        "type_of_assistance"
    )
    list_filter = ("type_of_assistance", "date_applied")
    ordering = ("-date_applied",)


class StaffActivityLogAdmin(admin.ModelAdmin):
    list_display = (
        "staff", "action", "details", "ip_address", "timestamp"
    )
    search_fields = ("staff__username", "action", "details")
    list_filter = ("action", "timestamp")
    ordering = ("-timestamp",)


class ApprovalAdmin(admin.ModelAdmin):
    list_display = ("applicant", "approved_by", "approved_at", "notes")
    search_fields = (
        "applicant__background_info__first_name",
        "applicant__background_info__last_name",
        "approved_by__username",
    )
    list_filter = ("approved_at", "approved_by")
    ordering = ("-approved_at",)


class ApprovalBatchAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "uploaded_by",
        "file_name",
        "uploaded_at",
        "total_processed",
        "total_approved",
        "total_already_approved",
        "total_not_found",
    )
    search_fields = ("file_name", "uploaded_by__username")
    list_filter = ("uploaded_at",)
    ordering = ("-uploaded_at",)
    
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'message', 'created_at', 'is_resolved')
    list_filter = ('is_resolved', 'created_at')
    search_fields = ('name', 'email', 'message')


# Register models
admin.site.register(ApplicantHistory, ApplicantHistoryAdmin)
admin.site.register(StaffActivityLog, StaffActivityLogAdmin)
admin.site.register(Applicant, ApplicantAdmin)
admin.site.register(Representative, RepresentativeAdmin)
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(BackgroundInfo)
admin.site.register(Approval, ApprovalAdmin)
admin.site.register(ApprovalBatch, ApprovalBatchAdmin)
admin.site.register(SupportMessage, SupportMessageAdmin)


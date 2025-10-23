from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    # =============================================
    # AUTHENTICATION & USER MANAGEMENT
    # =============================================
    path("token/", MyTokenObtainView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('protected/', protected_view, name='protected_view'),
    path('users/update-profile/', update_profile, name='update_profile'),
    # path('users/change-password/', change_password, name='change_password'),
    path('users/me/', get_current_user, name='get_current_user'),
    path('users/staff-activity/', get_staff_activity_logs, name='staff_activity_logs'),

    # =============================================
    # STAFF MANAGEMENT
    # =============================================
    path("register_staff/", register_staff, name="register_staff"),
    path("staff-list/", list_staff, name="staff_list"),
    path("delete-staff/<int:staff_id>/", delete_staff, name="delete_staff"),
    path("update-staff/<int:staff_id>/", update_staff, name="update-staff"),
    path("contact-admin/", contact_admin, name="contact_admin"),
    path("support-messages/", list_support_messages, name="support_messages"),
    path("support-messages/<int:message_id>/resolve/", resolve_support_message, name="resolve_support_message"),

    # =============================================
    # APPLICANT MANAGEMENT
    # =============================================
    path("submit-applicant/", submit_applicant, name="submit_applicant"),
    path('applicants/', list_applicants, name='applicants'),
    path('recent_applicants/', recent_applicants, name='recent_applicants'),
    path('applicants/<int:applicant_id>/', applicant_detail, name='applicant_detail'),
    path('list-archived-applicants/', list_archived_applicants, name='list_archived_applicants'),
    path('restore-applicant/<int:pk>/', restore_archived_applicant, name='restore_applicant'),
    path("export-applicants/", export_applicants_csv, name="export_applicants"),
    path("approved/upload/", upload_approved_list, name="upload_approved_list"),
    path("approved/batches/", approval_batches, name="approval-batches"),
    path("approved/batch/<int:batch_id>/approvals/", approvals_for_batch, name="approvals-for-batch"),
    path("approved/list/", approved_applicants, name="approved-applicants"),
    path("approved/history/", approval_batch_history, name="approval_batch_history"),

    # =============================================
    # GEOSPATIAL FUNCTIONS
    # =============================================
    path('applicant-locations/', get_applicant_locations, name='applicant-locations'),
    path('update_coordinates/', update_coordinates, name='update_coordinates'),

     # ========================
    # Dashboard
    # ========================
    path("analytics/dashboard/summary/", summary_metrics, name="analytics-dashboard-summary"),
    path("analytics/dashboard/total-applicants/", total_applicants, name="analytics-dashboard-total"),
    path("analytics/dashboard/growth-rate/", applicant_growth_rate, name="analytics-dashboard-growth"),
    path("analytics/dashboard/repeat-applicants/", repeat_applicants, name="analytics-dashboard-repeat"),

    # ========================
    # Geographic
    # ========================
    path("analytics/geographic/locations/", analytics_applicant_locations, name="analytics-geographic-locations"),
    path("analytics/geographic/top-barangays/", top_barangays, name="analytics-geographic-top"),
    path("analytics/geographic/barangay-by-type/", barangay_by_type, name="analytics-geographic-type"),
    path("analytics/geographic/approval-rate/", approval_rate_by_location, name="analytics-geographic-approval"),
    path("analytics/geographic/inactive-applicants/", inactive_applicants, name="analytics-geographic-inactive"),

    # ========================
    # Demographics & Economics
    # ========================
    path("analytics/demographics/gender/", applicants_by_gender, name="analytics-demographics-gender"),
    path("analytics/demographics/civil-status/", applicants_by_civil_status, name="analytics-demographics-civil"),
    path("analytics/demographics/age-groups/", applicants_by_age_group, name="analytics-demographics-age"),
    path("analytics/demographics/occupation/", applicants_by_occupation, name="analytics-demographics-occupation"),
    path("analytics/demographics/age-gender/", applicants_by_age_gender, name="analytics-demographics-age-gender"),
    path("analytics/economics/income-distribution/", income_distribution, name="analytics-economics-income"),
    # (future) path("analytics/economics/income-vs-occupation/", income_vs_occupation, name="analytics-economics-income-occupation"),
    # (future) path("analytics/economics/disparities-location/", income_disparities_by_location, name="analytics-economics-disparities"),

    # ========================
    # Trends
    # ========================
    path("analytics/trends/monthly/", monthly_trends, name="analytics-trends-monthly"),
    path("analytics/trends/yearly/", yearly_trends, name="analytics-trends-yearly"),
    path("analytics/trends/over-time/", trends_over_time, name="analytics-trends-over"),
    path("analytics/trends/cumulative/", cumulative_applicants, name="analytics-trends-cumulative"),
    path("analytics/trends/assistance-type/", assistance_type_trend, name="analytics-trends-type"),
    path("analytics/trends/assistance-type-over-time/", assistance_type_over_time, name="analytics-trends-type-over"),
    path("analytics/trends/applicant-heatmap/", applicant_activity_heatmap, name="applicant_heatmap"),

    path("analytics/trends/approval/", approval_trends, name="analytics-trends-approval"),
    path("analytics/trends/time-to-approval/", time_to_approval, name="analytics-trends-time"),

    # ========================
    # Performance
    # ========================
    path("analytics/performance/average-processing/", average_processing_time, name="analytics-performance-average"),
    path("analytics/performance/processing-by-type/", processing_time_by_type, name="analytics-performance-by-type"),
    path("analytics/performance/processing-distribution/", processing_time_distribution, name="analytics-performance-distribution"),

    path("analytics/performance/staff-productivity/", staff_productivity, name="analytics-performance-productivity"),
    path("analytics/performance/staff-leaderboard/", staff_leaderboard, name="analytics-performance-leaderboard"),
    path("analytics/performance/staff-activity/", staff_activity_logs, name="analytics-performance-activity"),
    path("analytics/performance/staff-heatmap/", staff_activity_heatmap, name="analytics-performance-heatmap"),

]

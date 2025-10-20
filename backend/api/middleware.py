from django.utils import timezone
import datetime

class UpdateLastActiveMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.user.is_authenticated:
            now = timezone.now()
            if not request.user.last_active or (now - request.user.last_active > datetime.timedelta(minutes=1)):
                request.user.last_active = now
                request.user.save(update_fields=["last_active"])

        return response


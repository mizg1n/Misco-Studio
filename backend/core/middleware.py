import json
from django.utils.deprecation import MiddlewareMixin
from .models import AuditLog

class AuditLogMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE'] and request.path.startswith('/api/'):
            # Avoid logging login/refresh requests if necessary, but here we log everything modifying under /api/
            if '/auth/' in request.path and request.method == 'POST':
                pass # Can optionally skip auth logging to avoid noise
            
            user = request.user if request.user.is_authenticated else None
            
            AuditLog.objects.create(
                user=user,
                action_type=request.method,
                target_model=request.path,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

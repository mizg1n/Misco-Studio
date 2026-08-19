from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtistAvailableSlotsView, ArtistWorkingHoursViewSet, ArtistShiftViewSet, ArtistLeaveViewSet
from .views import (
    RegisterView, CustomTokenObtainPairView, CustomTokenRefreshView, LogoutView, CurrentUserView,
    PriceListViewSet, CareInstructionViewSet, AppointmentViewSet, AuditLogViewSet,
    NotificationViewSet, UserViewSet, FinanceViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'pricelist', PriceListViewSet)
router.register(r'careinstructions', CareInstructionViewSet)
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'auditlogs', AuditLogViewSet, basename='auditlog')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'finance', FinanceViewSet, basename='finance')
router.register(r'working-hours', ArtistWorkingHoursViewSet, basename='working-hours')
router.register(r'shifts', ArtistShiftViewSet, basename='shifts')
router.register(r'leaves', ArtistLeaveViewSet, basename='leaves')

urlpatterns = [
    path('shifts/artist-available-slots/', ArtistAvailableSlotsView.as_view(), name='artist-slots'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', CustomTokenRefreshView.as_view(), name='refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
    path('', include(router.urls)),
]

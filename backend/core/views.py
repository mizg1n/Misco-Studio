from .services.finance import get_dashboard_stats, process_appointment_payment
from django.db.models import Sum
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import PriceList, CareInstruction, Appointment, AuditLog, Notification, Payment, ArtistPayout
from django.db.models import Sum, Count
from .serializers import (
    UserSerializer, PublicUserSerializer, RegisterSerializer, PriceListSerializer,
    CareInstructionSerializer, AppointmentSerializer, AppointmentAdminSerializer,
    AuditLogSerializer, NotificationSerializer, PaymentSerializer, ArtistPayoutSerializer
)
from .permissions import IsCustomer, IsArtist, IsReceptionist, IsAdmin, IsAdminOrReceptionist

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            refresh_token = response.data.get('refresh')
            if refresh_token:
                response.set_cookie(
                    'refresh_token',
                    refresh_token,
                    max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                    httponly=True,
                    samesite='Lax' # Use 'None' for cross-domain in production if secure=True
                )
                del response.data['refresh'] # Don't send in response body
        return response

class CustomTokenRefreshView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'No refresh token provided'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({'access': str(refresh.access_token)})
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    def post(self, request):
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('refresh_token')
        return response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset

    def get_serializer_class(self):
        # Only admin/receptionist can see sensitive fields (email, commission_rate, payout_type, phone)
        if self.request.user.is_authenticated and getattr(self.request.user, 'role', None) in ['ADMIN', 'RECEPTIONIST']:
            return UserSerializer
        return PublicUserSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Must be authenticated to list users; sensitive fields filtered by serializer above
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

class PriceListViewSet(viewsets.ModelViewSet):
    queryset = PriceList.objects.all()
    serializer_class = PriceListSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdmin()]

class CareInstructionViewSet(viewsets.ModelViewSet):
    queryset = CareInstruction.objects.all()
    serializer_class = CareInstructionSerializer

    def get_permissions(self):
        # Anyone can read care instructions; only admin can create/edit/delete
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdmin()]

class AppointmentViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if getattr(self.request.user, 'role', None) in ['ADMIN', 'RECEPTIONIST', 'ARTIST']:
            return AppointmentAdminSerializer
        return AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Appointment.objects.none()
        if user.role == 'ADMIN' or user.role == 'RECEPTIONIST':
            return Appointment.objects.all()
        elif user.role == 'ARTIST':
            return Appointment.objects.filter(artist=user)
        elif user.role == 'CUSTOMER':
            return Appointment.objects.filter(customer=user)
        return Appointment.objects.none()

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        if self.request.user.role == 'CUSTOMER':
            serializer.save(customer=self.request.user)
        else:
            serializer.save()

    def get_allowed_actions_for_customer(self):
        return ['create', 'list', 'retrieve']

    def check_permissions(self, request):
        super().check_permissions(request)
        # Customers may only create new appointments or view their own
        if getattr(request.user, 'role', None) == 'CUSTOMER':
            if self.action not in ['create', 'list', 'retrieve', 'stats']:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Müşteriler randevu güncelleyemez veya silemez.")
        
    @action(detail=False, methods=['get'])
    def stats(self, request):
        if getattr(request.user, 'role', None) not in ['ADMIN', 'RECEPTIONIST']:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        total = Appointment.objects.count()
        tattoos = Appointment.objects.filter(service_type='TATTOO', status__in=['COMPLETED', 'PAID']).count()
        piercings = Appointment.objects.filter(service_type='PIERCING', status__in=['COMPLETED', 'PAID']).count()
        
        return Response({
            'total': total,
            'tattoos': tattoos,
            'piercings': piercings
        })

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    
    def get_permissions(self):
        return [IsAdminOrReceptionist()]


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'marked as read'})
        
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'marked as read'})

class FinanceViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        if request.user.role not in ['ADMIN', 'RECEPTIONIST']:
            return Response(status=403)
            
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        stats = get_dashboard_stats(start_date, end_date)
        return Response(stats)

    @action(detail=False, methods=['get'])
    def artist_reports(self, request):
        if request.user.role != 'ADMIN':
            return Response(status=403)
            
        artists = User.objects.filter(role='ARTIST')
        data = []
        for artist in artists:
            qs = Payment.objects.filter(artist=artist, status='COMPLETED')
            aggregates = qs.aggregate(
                sessions=Count('id'),
                turnover=Sum('final_amount'),
                commission=Sum('artist_commission_amount'),
                studio=Sum('studio_cut_amount')
            )
            data.append({
                'artist_id': artist.id,
                'artist_name': artist.username,
                'commission_rate': artist.commission_rate,
                'sessions': aggregates['sessions'] or 0,
                'turnover': aggregates['turnover'] or 0,
                'commission': aggregates['commission'] or 0,
                'studio': aggregates['studio'] or 0
            })
        return Response(data)

    @action(detail=False, methods=['get'])
    def my_earnings(self, request):
        if request.user.role != 'ARTIST':
            return Response(status=403)
            
        qs = Payment.objects.filter(artist=request.user, status='COMPLETED')
        aggregates = qs.aggregate(
            sessions=Count('id'),
            turnover=Sum('final_amount'),
            commission=Sum('artist_commission_amount')
        )
        
        # Recent payments
        recent = qs.order_by('-paid_at')[:10]
        recent_data = PaymentSerializer(recent, many=True).data
        
        return Response({
            'total_sessions': aggregates['sessions'] or 0,
            'total_turnover': aggregates['turnover'] or 0,
            'my_commission': aggregates['commission'] or 0,
            'recent_payments': recent_data
        })

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        if request.user.role not in ['ADMIN', 'RECEPTIONIST']:
            return Response(status=403)
            
        appointment_id = request.data.get('appointment_id')
        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=404)
            
        payment = process_appointment_payment(
            appointment=appointment,
            total_amount=request.data.get('total_amount', 0),
            discount_amount=request.data.get('discount_amount', 0),
            deposit_amount=request.data.get('deposit_amount', 0),
            payment_method=request.data.get('payment_method', 'CASH'),
            cash_amount=request.data.get('cash_amount', 0),
            card_amount=request.data.get('card_amount', 0)
        )
        return Response(PaymentSerializer(payment).data)


from .models import ArtistWorkingHours, ArtistShift, ArtistLeave
from .serializers import ArtistWorkingHoursSerializer, ArtistShiftSerializer, ArtistLeaveSerializer
from django.utils import timezone
from rest_framework.decorators import action

class ArtistWorkingHoursViewSet(viewsets.ModelViewSet):
    serializer_class = ArtistWorkingHoursSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role in ['ADMIN', 'RECEPTIONIST']:
            return ArtistWorkingHours.objects.all()
        return ArtistWorkingHours.objects.filter(artist=self.request.user)

    def perform_create(self, serializer):
        # Artists can only create working hours for themselves
        if self.request.user.role == 'ARTIST':
            serializer.save(artist=self.request.user)
        else:
            serializer.save()

class ArtistShiftViewSet(viewsets.ModelViewSet):
    serializer_class = ArtistShiftSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN' or self.request.user.role == 'RECEPTIONIST':
            return ArtistShift.objects.all()
        return ArtistShift.objects.filter(artist=self.request.user)

    def perform_create(self, serializer):
        # Artists can only create shifts for themselves
        if self.request.user.role == 'ARTIST':
            serializer.save(artist=self.request.user)
        else:
            serializer.save()

class ArtistLeaveViewSet(viewsets.ModelViewSet):
    serializer_class = ArtistLeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN' or self.request.user.role == 'RECEPTIONIST':
            return ArtistLeave.objects.all()
        return ArtistLeave.objects.filter(artist=self.request.user)

    def perform_create(self, serializer):
        leave = serializer.save(artist=self.request.user)
        # Notify admins
        admins = User.objects.filter(role='ADMIN')
        from .models import Notification
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title="Yeni İzin Talebi",
                message=f"{self.request.user.username} yeni bir izin talebi oluşturdu. Onayınızı bekliyor."
            )

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def review(self, request, pk=None):
        leave = self.get_object()
        status = request.data.get('status')
        if status in ['APPROVED', 'REJECTED']:
            leave.status = status
            leave.reviewed_by = request.user
            leave.reviewed_at = timezone.now()
            leave.save()
            return Response({'status': 'İzin güncellendi'})
        return Response({'error': 'Geçersiz durum'}, status=400)


from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
from .services.availability import check_artist_availability

class ArtistAvailableSlotsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        artist_id = request.query_params.get('artist_id')
        date_str = request.query_params.get('date')
        
        if not date_str:
            return Response({'error': 'date required'}, status=400)
            
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'invalid date format, use YYYY-MM-DD'}, status=400)
            
        if artist_id:
            artists = User.objects.filter(id=artist_id, role='ARTIST')
            if not artists.exists():
                return Response({'error': 'artist not found'}, status=404)
        else:
            artists = User.objects.filter(role='ARTIST')
            
        # Generate 1-hour slots from 10:00 to 20:00
        slots = []
        for hour in range(10, 20):
            slot_time = timezone.make_aware(datetime.combine(target_date, datetime.min.time().replace(hour=hour)))
            
            is_avail = False
            assigned_artist = None
            for artist in artists:
                avail, _ = check_artist_availability(artist, slot_time)
                if avail:
                    is_avail = True
                    assigned_artist = artist
                    break
                    
            slots.append({
                'time': f"{hour:02d}:00",
                'available': is_avail,
                'assigned_artist_id': assigned_artist.id if assigned_artist else None,
                'assigned_artist_name': assigned_artist.username if assigned_artist else None
            })
            
        return Response({'slots': slots})

from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.utils import timezone
from core.models import Payment, ArtistPayout, CustomUser

def calculate_artist_commission(artist: CustomUser, final_amount: Decimal) -> Decimal:
    '''
    Calculates the artist's cut from a specific transaction based on their payout type and commission rate.
    If payout_type is PERCENTAGE, the rate is applied to the final_amount (after discount).
    If payout_type is FIXED_PER_SESSION, the rate represents a fixed currency amount.
    '''
    if not artist or artist.role != 'ARTIST':
        return Decimal('0.00')

    rate = artist.commission_rate
    
    if artist.payout_type == 'PERCENTAGE':
        # Proportional discount: We apply the commission rate directly to the final amount (total - discount)
        return final_amount * (rate / Decimal('100.00'))
    elif artist.payout_type == 'FIXED_PER_SESSION':
        return rate
    else:
        # HYBRID or other logic can be added here
        return final_amount * (rate / Decimal('100.00'))

def process_appointment_payment(appointment, total_amount, discount_amount, deposit_amount, payment_method, cash_amount=0, card_amount=0):
    '''
    Process checkout for an appointment and creates the Payment record.
    '''
    final_amount = Decimal(str(total_amount)) - Decimal(str(discount_amount))
    artist_cut = calculate_artist_commission(appointment.artist, final_amount)
    studio_cut = final_amount - artist_cut
    
    payment = Payment.objects.create(
        appointment=appointment,
        client=appointment.customer,
        artist=appointment.artist,
        total_amount=Decimal(str(total_amount)),
        discount_amount=Decimal(str(discount_amount)),
        deposit_amount=Decimal(str(deposit_amount)),
        final_amount=final_amount,
        payment_method=payment_method,
        cash_amount=Decimal(str(cash_amount)),
        card_amount=Decimal(str(card_amount)),
        status='COMPLETED',
        artist_commission_amount=artist_cut,
        studio_cut_amount=studio_cut
    )
    
    # Mark appointment as PAID
    appointment.status = 'PAID'
    appointment.save()
    
    return payment

def get_dashboard_stats(start_date=None, end_date=None):
    '''
    Aggregates financial KPIs for the admin dashboard.
    '''
    qs = Payment.objects.filter(status='COMPLETED')
    if start_date:
        qs = qs.filter(paid_at__gte=start_date)
    if end_date:
        qs = qs.filter(paid_at__lte=end_date)
        
    aggregates = qs.aggregate(
        total_turnover=Sum('final_amount'),
        total_artist_payouts=Sum('artist_commission_amount'),
        total_studio_net=Sum('studio_cut_amount'),
        total_sessions=Count('id')
    )
    
    methods_split = qs.values('payment_method').annotate(total=Sum('final_amount'))
    
    return {
        'total_turnover': aggregates['total_turnover'] or 0,
        'total_artist_payouts': aggregates['total_artist_payouts'] or 0,
        'total_studio_net': aggregates['total_studio_net'] or 0,
        'total_sessions': aggregates['total_sessions'] or 0,
        'methods_split': list(methods_split)
    }

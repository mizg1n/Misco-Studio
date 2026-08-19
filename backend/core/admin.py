from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, PriceList, CareInstruction, Appointment, AuditLog

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'role', 'phone_number', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'phone_number')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'phone_number')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(PriceList)
admin.site.register(CareInstruction)
admin.site.register(Appointment)
admin.site.register(AuditLog)

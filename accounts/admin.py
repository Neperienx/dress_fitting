from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Shop & Role", {"fields": ("shop", "role")}),
    )
    list_display = ("username", "email", "role", "shop", "is_staff")
    list_filter = ("role", "shop")

from django.contrib import admin
from .models import BrideSession, Swipe


@admin.register(BrideSession)
class BrideSessionAdmin(admin.ModelAdmin):
    list_display = ("code", "shop", "created_by", "created_at", "completed_at")
    list_filter = ("shop",)


@admin.register(Swipe)
class SwipeAdmin(admin.ModelAdmin):
    list_display = ("session", "dress", "liked", "created_at")
    list_filter = ("liked",)

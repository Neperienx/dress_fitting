from django.contrib import admin
from .models import Shop, ShopMembership


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")


@admin.register(ShopMembership)
class ShopMembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "shop", "joined_at")

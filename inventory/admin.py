from django.contrib import admin
from .models import Dress, DressImage


class DressImageInline(admin.TabularInline):
    model = DressImage
    extra = 1


@admin.register(Dress)
class DressAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "price", "brand", "silhouette")
    list_filter = ("shop", "brand", "silhouette")
    inlines = [DressImageInline]


@admin.register(DressImage)
class DressImageAdmin(admin.ModelAdmin):
    list_display = ("dress", "image")

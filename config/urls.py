from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from sessions import views as session_views
from inventory import views as inventory_views
from shops import views as shop_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("", shop_views.home, name="home"),
    path("dashboard/", shop_views.dashboard, name="dashboard"),
    path("dresses/", inventory_views.dress_list, name="dress_list"),
    path("dresses/new/", inventory_views.dress_create, name="dress_create"),
    path("dresses/<int:dress_id>/edit/", inventory_views.dress_edit, name="dress_edit"),
    path("sessions/new/", session_views.session_create, name="session_create"),
    path("sessions/<uuid:code>/", session_views.session_swipe, name="session_swipe"),
    path("sessions/<uuid:code>/swipe/", session_views.record_swipe, name="record_swipe"),
    path("sessions/<uuid:code>/finish/", session_views.session_results, name="session_results"),
    path("api/", include("api.urls")),
]

handler403 = "config.views.error_403"
handler404 = "config.views.error_404"
handler500 = "config.views.error_500"

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

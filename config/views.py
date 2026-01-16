from django.contrib import messages
from django.shortcuts import render
from django.urls import reverse


def error_403(request, exception):
    if not request.user.is_authenticated:
        messages.error(
            request,
            "You need to log in with a manager or owner account to view that page.",
        )
    context = {
        "title": "Access denied",
        "message": (
            "That page is only available to shop managers or owners. "
            "Log in with the correct account to continue."
        ),
        "login_url": reverse("account_login"),
    }
    return render(request, "403.html", context, status=403)


def error_404(request, exception):
    context = {
        "title": "Page not found",
        "message": "We couldn't find that page. Check the address or return home.",
        "login_url": reverse("account_login"),
    }
    return render(request, "404.html", context, status=404)


def error_500(request):
    context = {
        "title": "Something went wrong",
        "message": "We ran into an unexpected error. Please try again.",
        "login_url": reverse("account_login"),
    }
    return render(request, "500.html", context, status=500)

from functools import wraps

from django.contrib import messages
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.views import redirect_to_login
from django.urls import reverse


def require_manager_or_owner(view_func):
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated or not user.is_manager_or_owner():
            messages.error(
                request,
                "This page is only available to shop managers or owners. "
                "Log in with a manager or owner account to continue.",
            )
            login_url = reverse("account_login")
            return redirect_to_login(
                request.get_full_path(), login_url, REDIRECT_FIELD_NAME
            )
        return view_func(request, *args, **kwargs)

    return _wrapped

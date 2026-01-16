from functools import wraps
from django.core.exceptions import PermissionDenied


def require_manager_or_owner(view_func):
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated or not user.is_manager_or_owner():
            raise PermissionDenied("You do not have access to this page.")
        return view_func(request, *args, **kwargs)

    return _wrapped

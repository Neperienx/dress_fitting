from datetime import timedelta
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST
from .forms import BrideSessionForm
from .models import BrideSession, Swipe
from .services import next_dress_for_session, rank_dresses

MAX_SWIPES = 20


def session_create(request):
    if not request.user.is_authenticated:
        return redirect("account_login")
    if request.method == "POST":
        form = BrideSessionForm(request.POST)
        if form.is_valid():
            session = form.save(commit=False)
            session.shop = request.user.shop
            session.created_by = request.user
            session.save()
            return render(request, "sessions/session_created.html", {"session": session})
    else:
        form = BrideSessionForm()
    return render(request, "sessions/session_create.html", {"form": form})


def _should_finish(session: BrideSession) -> bool:
    return session.swipes.count() >= MAX_SWIPES or next_dress_for_session(session) is None


def session_swipe(request, code):
    session = get_object_or_404(BrideSession, code=code)
    if _should_finish(session):
        return redirect("session_results", code=code)
    dress = next_dress_for_session(session)
    return render(
        request,
        "sessions/session_swipe.html",
        {
            "session": session,
            "dress": dress,
            "swipe_count": session.swipes.count(),
            "max_swipes": MAX_SWIPES,
        },
    )


@require_POST
def record_swipe(request, code):
    session = get_object_or_404(BrideSession, code=code)
    dress_id = request.POST.get("dress_id")
    liked = request.POST.get("liked") == "true"
    if dress_id:
        Swipe.objects.get_or_create(
            session=session,
            dress_id=dress_id,
            defaults={"liked": liked},
        )
    if _should_finish(session):
        session.completed_at = session.completed_at or timezone.now()
        session.save(update_fields=["completed_at"])
        return render(
            request,
            "sessions/partials/finish_notice.html",
            {"session": session},
        )
    dress = next_dress_for_session(session)
    context = {
        "session": session,
        "dress": dress,
        "swipe_count": session.swipes.count(),
        "max_swipes": MAX_SWIPES,
    }
    return render(request, "sessions/partials/swipe_card.html", context)


def session_results(request, code):
    session = get_object_or_404(BrideSession, code=code)
    budget_min = request.GET.get("budget_min")
    budget_max = request.GET.get("budget_max")
    dresses = rank_dresses(
        session,
        limit=10,
        budget_min=float(budget_min) if budget_min else None,
        budget_max=float(budget_max) if budget_max else None,
    )
    return render(
        request,
        "sessions/session_results.html",
        {"session": session, "dresses": dresses},
    )

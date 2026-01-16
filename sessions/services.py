import random
from typing import Iterable
from django.db.models import Count, Q
from inventory.models import Dress
from .models import BrideSession


def get_unseen_dresses(session: BrideSession) -> Iterable[Dress]:
    swiped_ids = session.swipes.values_list("dress_id", flat=True)
    return Dress.objects.filter(shop=session.shop).exclude(id__in=swiped_ids)


def next_dress_for_session(session: BrideSession) -> Dress | None:
    unseen = list(get_unseen_dresses(session))
    if not unseen:
        return None
    return random.choice(unseen)


def rank_dresses(
    session: BrideSession,
    limit: int = 10,
    budget_min: float | None = None,
    budget_max: float | None = None,
) -> list[Dress]:
    dresses = Dress.objects.filter(shop=session.shop)
    if budget_min is not None:
        dresses = dresses.filter(price__gte=budget_min)
    if budget_max is not None:
        dresses = dresses.filter(price__lte=budget_max)

    swipe_stats = (
        session.swipes.values("dress_id")
        .annotate(
            likes=Count("id", filter=Q(liked=True)),
            dislikes=Count("id", filter=Q(liked=False)),
        )
        .values("dress_id", "likes", "dislikes")
    )

    scores = {row["dress_id"]: (row["likes"], row["dislikes"]) for row in swipe_stats}

    ranked = []
    for dress in dresses:
        likes, dislikes = scores.get(dress.id, (0, 0))
        base_score = likes * 2 - dislikes
        exploration = random.uniform(0, 0.5)
        ranked.append((base_score + exploration, dress))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return [dress for _, dress in ranked[:limit]]

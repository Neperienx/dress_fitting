import uuid
from django.conf import settings
from django.db import models


class BrideSession(models.Model):
    code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    shop = models.ForeignKey("shops.Shop", on_delete=models.CASCADE, related_name="sessions")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_sessions",
    )
    bride_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"Session {self.code}"


class Swipe(models.Model):
    session = models.ForeignKey(BrideSession, on_delete=models.CASCADE, related_name="swipes")
    dress = models.ForeignKey("inventory.Dress", on_delete=models.CASCADE)
    liked = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("session", "dress")

    def __str__(self) -> str:
        return f"{self.session} - {self.dress} ({'like' if self.liked else 'dislike'})"

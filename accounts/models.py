from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        OWNER = "OWNER", "Owner"
        MANAGER = "MANAGER", "Manager"
        STYLIST = "STYLIST", "Stylist"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STYLIST)
    shop = models.ForeignKey(
        "shops.Shop",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )

    def is_manager_or_owner(self) -> bool:
        return self.role in {self.Role.OWNER, self.Role.MANAGER}

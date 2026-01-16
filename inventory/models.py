from django.db import models


class Dress(models.Model):
    shop = models.ForeignKey("shops.Shop", on_delete=models.CASCADE, related_name="dresses")
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    size_range = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=100, blank=True)
    brand = models.CharField(max_length=120, blank=True)
    silhouette = models.CharField(max_length=120, blank=True)
    neckline = models.CharField(max_length=120, blank=True)
    fabric = models.CharField(max_length=120, blank=True)
    style_tags = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.shop.name})"


class DressImage(models.Model):
    dress = models.ForeignKey(Dress, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="dress_images/")
    alt_text = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:
        return self.alt_text or self.image.name

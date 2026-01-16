import random
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from inventory.models import Dress, DressImage
from shops.models import Shop, ShopMembership


class Command(BaseCommand):
    help = "Seed demo data for a bridal shop"

    def handle(self, *args, **options):
        User = get_user_model()
        with transaction.atomic():
            shop, _ = Shop.objects.get_or_create(name="Luna Bridal Atelier")

            owner, _ = User.objects.get_or_create(
                username="owner",
                defaults={
                    "email": "owner@example.com",
                    "role": User.Role.OWNER,
                    "shop": shop,
                },
            )
            if not owner.has_usable_password():
                owner.set_password("password123")
                owner.save(update_fields=["password"])

            stylist, _ = User.objects.get_or_create(
                username="stylist",
                defaults={
                    "email": "stylist@example.com",
                    "role": User.Role.STYLIST,
                    "shop": shop,
                },
            )
            if not stylist.has_usable_password():
                stylist.set_password("password123")
                stylist.save(update_fields=["password"])

            ShopMembership.objects.get_or_create(user=owner, shop=shop)
            ShopMembership.objects.get_or_create(user=stylist, shop=shop)

            if Dress.objects.filter(shop=shop).exists():
                self.stdout.write(self.style.WARNING("Dresses already exist, skipping creation."))
                return

            silhouettes = ["A-Line", "Mermaid", "Ballgown", "Sheath", "Fit & Flare"]
            necklines = ["Sweetheart", "V-neck", "Off-shoulder", "Scoop", "Halter"]
            fabrics = ["Lace", "Chiffon", "Satin", "Tulle", "Crepe"]
            colors = ["Ivory", "Champagne", "Blush", "Snow", "Sand"]
            brands = ["Eloise", "Atelier Rose", "Marina", "Aurora", "Celeste"]

            for index in range(1, 31):
                dress = Dress.objects.create(
                    shop=shop,
                    name=f"Luna {index}",
                    price=random.randint(900, 3500),
                    size_range="0-18",
                    color=random.choice(colors),
                    brand=random.choice(brands),
                    silhouette=random.choice(silhouettes),
                    neckline=random.choice(necklines),
                    fabric=random.choice(fabrics),
                    style_tags="romantic, modern",
                )
                svg = f"""
                <svg xmlns='http://www.w3.org/2000/svg' width='640' height='800'>
                  <rect width='100%' height='100%' fill='#fce7f3'/>
                  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
                    font-family='Helvetica, Arial, sans-serif' font-size='32' fill='#db2777'>
                    {dress.name}
                  </text>
                </svg>
                """.strip()
                image = DressImage(dress=dress, alt_text=f"{dress.name} placeholder")
                image.image.save(f"dress_{dress.id}.svg", ContentFile(svg.encode("utf-8")), save=True)

        self.stdout.write(self.style.SUCCESS("Seeded demo shop, users, and dresses."))

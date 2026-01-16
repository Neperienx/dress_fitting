from django.test import TestCase
from shops.models import Shop
from accounts.models import User
from .models import Dress


class TenantIsolationTests(TestCase):
    def setUp(self):
        self.shop_a = Shop.objects.create(name="Shop A")
        self.shop_b = Shop.objects.create(name="Shop B")
        self.user_a = User.objects.create_user(
            username="usera",
            password="pass",
            shop=self.shop_a,
        )
        Dress.objects.create(shop=self.shop_a, name="Dress A", price=1000)
        Dress.objects.create(shop=self.shop_b, name="Dress B", price=1200)

    def test_dress_queryset_is_scoped_to_shop(self):
        dresses = Dress.objects.filter(shop=self.user_a.shop)
        self.assertEqual(dresses.count(), 1)
        self.assertEqual(dresses.first().name, "Dress A")

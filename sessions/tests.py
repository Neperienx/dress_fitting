from django.test import TestCase
from accounts.models import User
from inventory.models import Dress
from shops.models import Shop
from .models import BrideSession, Swipe
from .services import rank_dresses


class RankingServiceTests(TestCase):
    def setUp(self):
        self.shop = Shop.objects.create(name="Test Shop")
        self.user = User.objects.create_user(
            username="stylist",
            password="pass",
            shop=self.shop,
        )
        self.session = BrideSession.objects.create(shop=self.shop, created_by=self.user)
        self.dress_a = Dress.objects.create(shop=self.shop, name="Dress A", price=1000)
        self.dress_b = Dress.objects.create(shop=self.shop, name="Dress B", price=1500)
        Swipe.objects.create(session=self.session, dress=self.dress_a, liked=True)
        Swipe.objects.create(session=self.session, dress=self.dress_b, liked=False)

    def test_rank_dresses_prefers_liked(self):
        ranked = rank_dresses(self.session, limit=2)
        self.assertEqual(ranked[0].id, self.dress_a.id)

from django import forms
from .models import Dress


class DressForm(forms.ModelForm):
    class Meta:
        model = Dress
        fields = [
            "name",
            "price",
            "size_range",
            "color",
            "brand",
            "silhouette",
            "neckline",
            "fabric",
            "style_tags",
        ]

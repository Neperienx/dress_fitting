from django import forms
from .models import Dress


class DressForm(forms.ModelForm):
    image = forms.ImageField(required=True)

    class Meta:
        model = Dress
        fields = [
            "name",
            "price",
            "stock",
            "size_range",
            "color",
            "brand",
            "silhouette",
            "neckline",
            "fabric",
            "style_tags",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields["image"].required = False
